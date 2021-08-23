import { Inject } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Mutation } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { errorMonitor } from 'events';
import { PubSub } from 'graphql-subscriptions';
import { AuthUser } from 'src/auth/auth-user.decorator';
import {
  NEW_COOKED_ORDER,
  NEW_PENDING_ORDER,
  ORDER_STATUS_UPDATE,
  PUB_SUB,
} from 'src/common/common.constants';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderResult } from './dtos/create-order.dto';
import { EditOrderInput } from './dtos/edit-order.dto';
import { GetOrderInput } from './dtos/get-order.dto';
import { GetOrdersInput } from './dtos/get-orders.dto';
import { TakeOrderInput } from './dtos/take-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order, OrderStatus } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  async createOrder(customer: User, { items, restaurantId }: CreateOrderInput) {
    const restaurant = await this.restaurants.findOne(restaurantId);
    if (!restaurant) {
      throw new Error('No restaurant founnd');
    }
    let finalTotal = 0;
    let orderItems: OrderItem[] = [];
    for (let item of items) {
      const dish = await this.dishes.findOne(item.dishId);
      if (!dish) {
        throw new Error('No dish found for order item');
      }

      let dishTotal = dish.price;
      item?.choices?.forEach((c) => {
        const dishOption: any = dish.options?.find((o) => o.name === c.name);

        if (dishOption?.extra) {
          dishTotal += dishOption.extra;
        } else {
          const choiceOption = dishOption.choices.find(
            (choice) => choice.name === c.choice,
          );

          if (choiceOption?.extra) {
            dishTotal += choiceOption.extra;
          }
        }
      });
      finalTotal += dishTotal;

      const orderItem = await this.orderItems.save(
        this.orderItems.create({
          dish,
          choices: item.choices,
        }),
      );
      orderItems.push(orderItem);
    }

    const order = this.orders.create({
      customer,
      restaurant,
      items: orderItems,
      total: finalTotal,
    });

    await this.orders.save(order);
    this.pubSub.publish(NEW_PENDING_ORDER, {
      pendingOrders: { order, ownerId: restaurant.ownerId },
    });
  }

  async getOrders(user: User, { status }: GetOrdersInput) {
    let orders: Order[];
    if (user.role === UserRole.Client) {
      orders = await this.orders.find({
        where: {
          customer: user,
          ...(status && { status }),
        },
      });
    } else if (user.role === UserRole.Delivery) {
      orders = await this.orders.find({
        where: {
          deliver: user,
          ...(status && { status }),
        },
      });
    } else {
      const restaurants = await this.restaurants.find({
        where: {
          owner: user,
        },
        relations: ['orders'],
      });
      orders = restaurants
        .map((res) => res.orders)
        .flat(1)
        .filter((order) => !status || order.status === status);
    }

    return orders;
  }

  async getOrder(user: User, { orderId }: GetOrderInput) {
    const order = await this.orders.findOne({
      where: {
        id: orderId,
      },
      relations: ['restaurant'],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (!this.isAllowed(user, order)) {
      throw new Error('Permission denied to access the order');
    }
    return order;
  }
  async editOrder(user: User, { orderId, status }: EditOrderInput) {
    const order = await this.orders.findOne({
      where: {
        id: orderId,
      },
    });
    if (!order) {
      throw new Error('Order not found');
    }

    if (!this.isAllowed(user, order)) {
      throw new Error('Permission denied to access the order');
    }
    let canEdit = true;

    if (
      user.role === UserRole.Owner &&
      status !== OrderStatus.Cooking &&
      status !== OrderStatus.Cooked
    ) {
      canEdit = false;
    }

    if (
      user.role === UserRole.Delivery &&
      status !== OrderStatus.PickedUp &&
      status !== OrderStatus.Delivered
    ) {
      canEdit = false;
    }
    if (!canEdit) {
      throw new Error('Could not edit the order');
    }
    await this.orders.save({
      id: orderId,
      status,
    });

    const newOrder = { ...order, status };
    if (user.role === UserRole.Owner && status === OrderStatus.Cooked) {
      await this.pubSub.publish(NEW_COOKED_ORDER, {
        cookedOrders: newOrder,
      });
    }

    await this.pubSub.publish(ORDER_STATUS_UPDATE, { orderUpdates: newOrder });
  }

  async takeOrder(driver: User, { id }: TakeOrderInput) {
    const order = await this.orders.findOne(id);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.driver) {
      throw new Error('This order already had delivery');
    }

    const newOrder = await this.orders.save({
      ...order,
      driver,
    });

    await this.pubSub.publish(ORDER_STATUS_UPDATE, {
      orderUpdates: newOrder,
    });
  }
  async isAllowed(user: User, order: Order) {
    let allowed = true;
    if (user.role === UserRole.Client && user.id !== order.customerId) {
      allowed = false;
    }
    if (user.role === UserRole.Delivery && user.id !== order.driverId) {
      allowed = false;
    }
    if (user.role === UserRole.Owner && user.id !== order.restaurant.ownerId) {
      allowed = false;
    }
    return allowed;
  }
}
