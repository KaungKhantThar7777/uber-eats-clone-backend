import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  PaginationInput,
  PaginationResult,
} from 'src/common/dtos/pagination.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class AllRestaurantsInput extends PaginationInput {}

@ObjectType()
export class AllRestaurantsResult extends PaginationResult {
  @Field(() => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];
}
