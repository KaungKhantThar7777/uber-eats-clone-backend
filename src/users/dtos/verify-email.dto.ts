import { ObjectType } from '@nestjs/graphql';
import { CoreResult } from 'src/common/dtos/core-result.dto';

@ObjectType()
export class VerifyEmailResult extends CoreResult {}
