import { Field, Float, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@InputType('ChoiceInput', { isAbstract: true })
@ObjectType()
class Choice {
  @Field(() => String)
  name: string;

  @Field(() => Float, { nullable: true })
  extra?: number;
}
@InputType('DishOptionsInput', { isAbstract: true })
@ObjectType()
class DishOptions {
  @Field()
  name: string;

  @Field(() => [Choice], { nullable: true })
  choices: Choice[];

  @Field(() => Float, { nullable: true })
  extra?: number;
}

@ObjectType()
@Entity()
export class Dish extends CoreEntity {
  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  @Length(5, 140)
  description: string;

  @Field()
  @Column()
  @IsNumber()
  price: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  photo?: string;

  @Field(() => [DishOptions], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: DishOptions[];

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menu)
  restaurant: Restaurant;

  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;
}
