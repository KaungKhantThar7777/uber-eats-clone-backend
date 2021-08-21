import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreResult } from 'src/common/dtos/core-result.dto';
import { Order } from '../entities/order.entity';

@InputType()
export class GetOrderInput {
  @Field(() => Int)
  orderId: number;
}

@ObjectType()
export class GetOrderResult extends CoreResult {
  @Field(() => Order, { nullable: true })
  order?: Order;
}
