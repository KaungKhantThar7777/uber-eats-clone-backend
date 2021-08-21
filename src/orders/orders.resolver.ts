import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Roles } from 'src/auth/roles.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderResult, CreateOrderInput } from './dtos/create-order.dto';
import { EditOrderInput, EditOrderResult } from './dtos/edit-order.dto';
import { GetOrderInput, GetOrderResult } from './dtos/get-order.dto';
import { GetOrdersResult, GetOrdersInput } from './dtos/get-orders.dto';
import { OrderService } from './orders.service';

@Resolver()
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

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
}
