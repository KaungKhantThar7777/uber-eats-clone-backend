import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { MutationResult } from 'src/common/dtos/mutation-result.dto';
import { User } from '../entities/user.entity';

@InputType()
export class LoginInput extends PickType(User, ['email', 'password']) {}

@ObjectType()
export class LoginResult extends MutationResult {
  @Field(() => String, { nullable: true })
  token?: string;
}
