import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CoreResult {
  @Field(() => String, { nullable: true })
  error?: string;

  @Field()
  ok: boolean;
}
