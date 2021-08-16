import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreResult } from 'src/common/dtos/core-result.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class OneRestaurantInput {
  @Field(() => Int)
  restaurantId: number;
}

@ObjectType()
export class OneRestaurantResult extends CoreResult {
  @Field(() => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}
