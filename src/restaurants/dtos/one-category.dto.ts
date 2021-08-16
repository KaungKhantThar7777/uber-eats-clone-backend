import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  PaginationInput,
  PaginationResult,
} from 'src/common/dtos/pagination.dto';
import { Category } from '../entities/category.entity';

@InputType()
export class CategoryInput extends PaginationInput {
  @Field()
  slug: string;
}

@ObjectType()
export class CategoryResult extends PaginationResult {
  @Field(() => Category, { nullable: true })
  category?: Category;
}
