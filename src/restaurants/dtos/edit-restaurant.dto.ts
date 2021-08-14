import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { CoreResult } from 'src/common/dtos/core-result.dto';
import { CreateRestaurantInput } from './create-restaurant.dto';

@InputType()
export class EditRestaurantInput extends PartialType(CreateRestaurantInput) {
  @Field()
  restaurantId: number;
}

@ObjectType()
export class EditRestaurantResult extends CoreResult {}
