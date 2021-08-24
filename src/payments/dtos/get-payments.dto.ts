import { Field, ObjectType } from '@nestjs/graphql';
import { CoreResult } from 'src/common/dtos/core-result.dto';
import { Payment } from '../entities/payment.entity';

@ObjectType()
export class GetPaymentsResult extends CoreResult {
  @Field(() => [Payment])
  payments: Payment[];
}
