import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  PaginationInput,
  PaginationResult,
} from 'src/common/dtos/pagination.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class SearchRestaurantsInput extends PaginationInput {
  @Field()
  query: string;
}

@ObjectType()
export class SearchRestaurantsResult extends PaginationResult {
  @Field(() => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];
}
