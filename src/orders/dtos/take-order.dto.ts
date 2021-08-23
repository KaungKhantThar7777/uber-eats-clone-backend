import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreResult } from 'src/common/dtos/core-result.dto';

@InputType()
export class TakeOrderInput {
  @Field(() => Int)
  id: number;
}

@ObjectType()
export class TakeOrderResult extends CoreResult {}
