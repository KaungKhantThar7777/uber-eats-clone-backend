import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { LessThan, Repository } from 'typeorm';
import { CreatePaymentInput } from './dtos/create-payment.dto';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
  ) {}

  async createPayment(
    owner: User,
    { restaurantId, transactionId }: CreatePaymentInput,
  ) {
    const restaurant = await this.restaurants.findOne(restaurantId);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }
    if (restaurant.ownerId !== owner.id) {
      throw new Error('Permission denied');
    }
    await this.payments.save(
      this.payments.create({
        transactionId,
        user: owner,
        restaurant,
      }),
    );

    restaurant.isPromoted = true;
    const date = new Date();
    date.setDate(date.getDate() + 7);
    restaurant.promotedUntil = date;

    await this.restaurants.save(restaurant);
  }
  getPayments(owner: User) {
    return this.payments.find({ user: owner });
  }

  @Cron('10 * * * * *')
  async checkPromotedRestaurants() {
    const restaurants = await this.restaurants.find({
      isPromoted: true,
      promotedUntil: LessThan(new Date()),
    });

    restaurants.forEach((restaurant) => {
      restaurant.isPromoted = false;
      restaurant.promotedUntil = null;
    });
    await this.restaurants.save(restaurants);
  }
}
