import { Injectable } from '@nestjs/common';
import { Mutation } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderResult } from './dtos/create-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

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
      console.log('here final total', finalTotal);

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

    console.log(order);
    await this.orders.save(order);
  }
}
