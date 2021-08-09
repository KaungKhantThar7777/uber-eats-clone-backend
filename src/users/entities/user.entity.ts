import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import * as argon2 from 'argon2';
import { IsEmail, IsEnum, Length } from 'class-validator';

export enum UserRole {
  Client = 'Client',
  Owner = 'Owner',
  Delivery = 'Delivery',
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType({ isAbstract: true })
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

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    console.log(this.password);
    this.password = await argon2.hash(this.password);
  }

  checkPassword(password: string) {
    console.log(password);
    return argon2.verify(this.password, password);
  }
}
