import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreResult } from 'src/common/dtos/core-result.dto';
import { User } from '../entities/user.entity';

@InputType()
export class LoginInput extends PickType(User, ['email', 'password']) {}

@ObjectType()
export class LoginResult extends CoreResult {
  @Field(() => String, { nullable: true })
  token?: string;
}
