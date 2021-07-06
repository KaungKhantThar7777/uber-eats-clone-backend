import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MutationResult {
  @Field(() => String, { nullable: true })
  error?: string;

  @Field()
  ok: boolean;
}
