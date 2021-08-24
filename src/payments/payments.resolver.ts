import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Roles } from 'src/auth/roles.decorator';
import { User } from 'src/users/entities/user.entity';
import {
  CreatePaymentInput,
  CreatePaymentResult,
} from './dtos/create-payment.dto';
import { GetPaymentsResult } from './dtos/get-payments.dto';
import { Payment } from './entities/payment.entity';
import { PaymentService } from './payments.service';

@Resolver()
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @Mutation(() => CreatePaymentResult)
  @Roles(['Owner'])
  async createPayment(
    @AuthUser() owner: User,
    @Args('input') input: CreatePaymentInput,
  ) {
    try {
      await this.paymentService.createPayment(owner, input);
      return {
        ok: true,
      };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  @Query(() => GetPaymentsResult)
  @Roles(['Owner'])
  async getPayments(@AuthUser() owner: User) {
    try {
      const payments = await this.paymentService.getPayments(owner);
      return { ok: true, payments };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }
}
