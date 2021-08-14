import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreResult } from 'src/common/dtos/core-result.dto';

@InputType()
export class DeleteRestaurantInput {
  @Field(() => Int)
  id: number;
}

@ObjectType()
export class DeleteRestaurantResult extends CoreResult {}
