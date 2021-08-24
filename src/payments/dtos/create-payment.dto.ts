import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreResult } from 'src/common/dtos/core-result.dto';
import { Payment } from '../entities/payment.entity';

@InputType()
export class CreatePaymentInput extends PickType(
  Payment,
  ['transactionId', 'restaurantId'],
  InputType,
) {}

@ObjectType()
export class CreatePaymentResult extends CoreResult {}
