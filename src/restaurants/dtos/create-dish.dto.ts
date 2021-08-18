import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreResult } from 'src/common/dtos/core-result.dto';
import { Dish } from '../entities/dish.entity';

@InputType()
export class CreateDishInput extends PickType(
  Dish,
  ['name', 'price', 'description', 'options'],
  InputType,
) {
  @Field(() => Int)
  restaurantId: number;
}

@ObjectType()
export class CreateDishResult extends CoreResult {}
