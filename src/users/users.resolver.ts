import { UseGuards } from '@nestjs/common';
import { Request } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  CreateAccountInput,
  CreateAccountResult,
} from './dtos/create-account.dto';
import { LoginInput, LoginResult } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { UserService } from './users.service';

@Resolver()
export class UsersResolver {
  constructor(private readonly userService: UserService) {}
  @Query(() => User, { nullable: true })
  me(@AuthUser() user: User) {
    return user;
  }
  @Mutation(() => CreateAccountResult)
  createAccount(@Args('input') input: CreateAccountInput) {
    return this.userService.create(input);
  }

  @Mutation(() => LoginResult)
  login(@Args('input') input: LoginInput) {
    return this.userService.login(input);
  }
}
