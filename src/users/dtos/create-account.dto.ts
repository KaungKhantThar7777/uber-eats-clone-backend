import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { MutationResult } from 'src/common/dtos/mutation-result.dto';
import { User } from '../entities/user.entity';

@InputType()
export class CreateAccountInput extends PickType(
  User,
  ['email', 'password', 'role'],
  InputType,
) {}

@ObjectType()
export class CreateAccountResult extends MutationResult {}
