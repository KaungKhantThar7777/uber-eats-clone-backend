import { Field, ObjectType } from '@nestjs/graphql';
import { CoreResult } from 'src/common/dtos/core-result.dto';
import { Category } from '../entities/category.entity';

@ObjectType()
export class AllCategoriesResult extends CoreResult {
  @Field(() => [Category], { nullable: true })
  categories?: Category[];
}
