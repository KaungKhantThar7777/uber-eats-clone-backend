import {
  Field,
  InputType,
  ObjectType,
  OmitType,
  PickType,
} from '@nestjs/graphql';
import { CoreResult } from 'src/common/dtos/core-result.dto';
import { Column } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class CreateRestaurantInput extends PickType(
  Restaurant,
  ['name', 'address', 'coverImg'],
  InputType,
) {
  @Field()
  @Column()
  categoryName: string;
}

@ObjectType()
export class CreateRestaurantResult extends CoreResult {}
