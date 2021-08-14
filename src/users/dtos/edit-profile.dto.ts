import { InputType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { CoreResult } from 'src/common/dtos/core-result.dto';
import { User } from '../entities/user.entity';

@InputType()
export class EditProfileInput extends PartialType(
  PickType(User, ['email', 'password'], InputType),
) {}

@ObjectType()
export class EditProfileResult extends CoreResult {}
