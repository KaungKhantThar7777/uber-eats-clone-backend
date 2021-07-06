import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CreateAccountInput,
  CreateAccountResult,
} from './dtos/create-account.dto';
import { UserService } from './users.service';

@Resolver()
export class UsersResolver {
  constructor(private readonly userService: UserService) {}
  @Query(() => String)
  hi() {
    return 'hello world';
  }

  @Mutation(() => CreateAccountResult)
  createAccount(@Args('input') input: CreateAccountInput) {
    return this.userService.create(input);
  }
}
