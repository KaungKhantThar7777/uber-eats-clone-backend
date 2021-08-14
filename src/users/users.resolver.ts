import { UseGuards } from '@nestjs/common';
import { Request } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import {
  CreateAccountInput,
  CreateAccountResult,
} from './dtos/create-account.dto';
import { EditProfileInput, EditProfileResult } from './dtos/edit-profile.dto';
import { LoginInput, LoginResult } from './dtos/login.dto';
import { UserProfileResult } from './dtos/user-profile.dto';
import { VerifyEmailResult } from './dtos/verify-email.dto';
import { User } from './entities/user.entity';
import { UserService } from './users.service';

@Resolver()
export class UsersResolver {
  constructor(private readonly userService: UserService) {}
  @Query(() => User, { nullable: true })
  me(@AuthUser() user: User) {
    return user;
  }

  @Query(() => UserProfileResult)
  async userProfile(@Args('id') id: number): Promise<UserProfileResult> {
    try {
      const user = await this.userService.findById(id);
      if (!user) {
        throw new Error();
      }
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'User not found',
      };
    }
  }
  @Mutation(() => CreateAccountResult)
  createAccount(@Args('input') input: CreateAccountInput) {
    return this.userService.create(input);
  }

  @Mutation(() => LoginResult)
  login(@Args('input') input: LoginInput) {
    return this.userService.login(input);
  }

  @Roles(['Client'])
  @Mutation(() => EditProfileResult)
  async editProfile(
    @AuthUser() user: User,
    @Args('input') editProfileInput: EditProfileInput,
  ) {
    try {
      await this.userService.update(user, editProfileInput);
      return { ok: true };
    } catch (error) {
      console.log(error);
      return { ok: false, error: error.message };
    }
  }

  @Mutation(() => VerifyEmailResult)
  async verifyEmail(@Args('code') code: string) {
    try {
      await this.userService.verifyEmail(code);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }
}
