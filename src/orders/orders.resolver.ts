import { Inject } from '@nestjs/common';
import { Args, Mutation, Resolver, Query, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Roles } from 'src/auth/roles.decorator';
import {
  NEW_COOKED_ORDER,
  NEW_PENDING_ORDER,
  ORDER_STATUS_UPDATE,
  PUB_SUB,
} from 'src/common/common.constants';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderResult, CreateOrderInput } from './dtos/create-order.dto';
import { EditOrderInput, EditOrderResult } from './dtos/edit-order.dto';
import { GetOrderInput, GetOrderResult } from './dtos/get-order.dto';
import { GetOrdersResult, GetOrdersInput } from './dtos/get-orders.dto';
import { OrderUpdatesInput } from './dtos/order-updates.dto';
import { TakeOrderInput, TakeOrderResult } from './dtos/take-order.dto';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';

@Resolver()
export class OrderResolver {
  constructor(
    private readonly orderService: OrderService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Mutation(() => CreateOrderResult)
  @Roles(['Client'])
  async createOrder(
    @AuthUser() customer: User,
    @Args('input') input: CreateOrderInput,
  ) {
    try {
      await this.orderService.createOrder(customer, input);
      return {
        ok: true,
      };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  @Query(() => GetOrdersResult)
  @Roles(['Any'])
  async getOrders(
    @AuthUser() user: User,
    @Args('input') input: GetOrdersInput,
  ) {
    try {
      const orders = await this.orderService.getOrders(user, input);

      return { ok: true, orders };
    } catch (error) {
      console.log(error);
      return { ok: false, error: error.message };
    }
  }

  @Query(() => GetOrderResult)
  @Roles(['Any'])
  async getOrder(@AuthUser() user: User, @Args('input') input: GetOrderInput) {
    try {
      const order = await this.orderService.getOrder(user, input);
      return { ok: true, order };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }
  @Mutation(() => EditOrderResult)
  @Roles(['Delivery', 'Owner'])
  async editOrder(
    @AuthUser() user: User,
    @Args('input') input: EditOrderInput,
  ) {
    try {
      await this.orderService.editOrder(user, input);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  @Mutation(() => TakeOrderResult)
  @Roles(['Delivery'])
  async takeOrder(
    @AuthUser() driver: User,
    @Args('input') input: TakeOrderInput,
  ) {
    try {
      await this.orderService.takeOrder(driver, input);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  @Subscription(() => Order, {
    filter: ({ pendingOrders: { ownerId } }, _, { user }) => {
      return ownerId === user.id;
    },
    resolve: ({ pendingOrders: { order } }) => order,
  })
  @Roles(['Owner'])
  pendingOrders() {
    return this.pubSub.asyncIterator(NEW_PENDING_ORDER);
  }

  @Subscription(() => Order)
  @Roles(['Delivery'])
  cookedOrders() {
    return this.pubSub.asyncIterator(NEW_COOKED_ORDER);
  }

  @Subscription(() => Order, {
    filter: (
      { orderUpdates: order }: { orderUpdates: Order },
      { input }: { input: { id: number } },
      { user }: { user: User },
    ) => {
      if (
        order.customerId !== user.id &&
        order.driverId !== user.id &&
        order.restaurant.ownerId !== user.id
      )
        return false;
      return order.id === input.id;
    },
  })
  @Roles(['Any'])
  orderUpdates(@Args('input') input: OrderUpdatesInput) {
    return this.pubSub.asyncIterator(ORDER_STATUS_UPDATE);
  }
}
