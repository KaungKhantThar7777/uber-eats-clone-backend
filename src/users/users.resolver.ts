import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CreateAccountInput,
  CreateAccountResult,
} from './dtos/create-account.dto';
import { LoginInput, LoginResult } from './dtos/login.dto';
import { UserService } from './users.service';

@Resolver()
export class UsersResolver {
  constructor(private readonly userService: UserService) {}
  @Query(() => String)
  @Mutation(() => CreateAccountResult)
  createAccount(@Args('input') input: CreateAccountInput) {
    return this.userService.create(input);
  }

  @Mutation(() => LoginResult)
  login(@Args('input') input: LoginInput) {
    return this.userService.login(input);
  }
}
