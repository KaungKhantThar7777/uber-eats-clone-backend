import { InputType, Int, ObjectType, PickType, Field } from '@nestjs/graphql';
import { CoreResult } from 'src/common/dtos/core-result.dto';
import { Order } from '../entities/order.entity';

@InputType()
export class EditOrderInput extends PickType(Order, ['status'], InputType) {
  @Field()
  orderId: number;
}

@ObjectType()
export class EditOrderResult extends CoreResult {}
