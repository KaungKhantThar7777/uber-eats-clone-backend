import { InputType, Field, Int, ObjectType } from '@nestjs/graphql';
import { CoreResult } from './core-result.dto';

@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 1, nullable: true })
  page?: number = 1;
}

@ObjectType()
export class PaginationResult extends CoreResult {
  @Field(() => Int)
  totalPages: number;
}
