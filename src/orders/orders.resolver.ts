import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Roles } from 'src/auth/roles.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderResult, CreateOrderInput } from './dtos/create-order.dto';
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
}
