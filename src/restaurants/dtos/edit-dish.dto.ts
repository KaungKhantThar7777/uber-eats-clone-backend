import {
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CoreResult } from 'src/common/dtos/core-result.dto';
import { Dish } from '../entities/dish.entity';

@InputType()
export class EditDishInput extends PartialType(
  PickType(Dish, ['name', 'options', 'description', 'price'], InputType),
) {
  @Field(() => Int)
  dishId: number;
}

@ObjectType()
export class EditDishResult extends CoreResult {}
