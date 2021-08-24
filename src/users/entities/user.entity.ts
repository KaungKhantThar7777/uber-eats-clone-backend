import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import * as argon2 from 'argon2';
import { IsEmail, IsEnum, Length } from 'class-validator';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Payment } from 'src/payments/entities/payment.entity';

export enum UserRole {
  Client = 'Client',
  Owner = 'Owner',
  Delivery = 'Delivery',
}

registerEnumType(UserRole, { name: 'UserRole' });

@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Field()
  @Column()
  @IsEmail()
  email: string;

  @Field()
  @Column()
  @Length(5)
  password: string;

  @Field(() => UserRole)
  @Column({ type: 'enum', enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @Field()
  @Column({ default: false })
  verified: boolean;

  @Field(() => [Restaurant])
  @OneToMany(() => Restaurant, (restaurant) => restaurant.owner)
  restaurants: Restaurant[];

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @OneToMany(() => Order, (order) => order.driver)
  rides: Order[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    this.password = await argon2.hash(this.password);
  }

  checkPassword(password: string) {
    console.log(password);
    return argon2.verify(this.password, password);
  }
}
