import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Roles } from 'src/auth/roles.decorator';
import { User } from 'src/users/entities/user.entity';
import {
  CreateRestaurantInput,
  CreateRestaurantResult,
} from './dtos/create-restaurant.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantResult,
} from './dtos/delete-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantResult,
} from './dtos/edit-restaurant.dto';
import { RestaurantService } from './restaurants.service';

@Resolver()
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Roles(['Owner'])
  @Mutation(() => CreateRestaurantResult)
  async createRestaurant(
    @AuthUser() owner: User,
    @Args('input') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantResult> {
    try {
      await this.restaurantService.create(createRestaurantInput, owner);
      return { ok: true };
    } catch (error) {
      console.log(error);
      return { ok: false, error: error.message };
    }
  }

  @Roles(['Owner'])
  @Mutation(() => EditRestaurantResult)
  async editRestaurant(
    @AuthUser() owner: User,
    @Args('input') input: EditRestaurantInput,
  ) {
    try {
      await this.restaurantService.edit(input, owner);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  @Roles(['Owner'])
  @Mutation(() => DeleteRestaurantResult)
  async deleteRestaurant(
    @AuthUser() owner: User,
    @Args('input') input: DeleteRestaurantInput,
  ) {
    try {
      await this.restaurantService.delete(owner, input);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }
}
