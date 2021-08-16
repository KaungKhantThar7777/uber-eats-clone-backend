import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Roles } from 'src/auth/roles.decorator';
import { User } from 'src/users/entities/user.entity';
import { AllCategoriesResult } from './dtos/all-categories.dto';
import { CategoryInput, CategoryResult } from './dtos/one-category.dto';
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
import { Category } from './entities/category.entity';
import { RestaurantService } from './restaurants.service';
import {
  AllRestaurantsInput,
  AllRestaurantsResult,
} from './dtos/all-restaurants.dto';
import {
  OneRestaurantInput,
  OneRestaurantResult,
} from './dtos/one-restaurant.dto';
import {
  SearchRestaurantsResult,
  SearchRestaurantsInput,
} from './dtos/search-restaurants.dto';

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

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @ResolveField(() => Int)
  restaurantsCount(@Parent() category: Category): Promise<number> {
    return this.restaurantService.restaurantsCount(category);
  }

  @Query(() => AllCategoriesResult)
  async allCategories() {
    try {
      const categories = await this.restaurantService.allCategories();
      return {
        ok: true,
        categories,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  @Query(() => CategoryResult)
  async oneCategory(@Args('input') input: CategoryInput) {
    try {
      const category = await this.restaurantService.findCategoryBySlug(input);
      const totalResult = await this.restaurantService.restaurantsCount(
        category,
      );
      return { ok: true, category, totalPages: Math.ceil(totalResult / 25) };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  @Query(() => AllRestaurantsResult)
  async allRestaurants(@Args('input') input: AllRestaurantsInput) {
    try {
      const [restaurants, totalResult] =
        await this.restaurantService.allRestaurants(input);

      return {
        ok: true,
        restaurants,
        totalPages: Math.ceil(totalResult / 25),
      };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  @Query(() => OneRestaurantResult)
  async oneRestaurant(@Args('input') input: OneRestaurantInput) {
    try {
      const restaurant = await this.restaurantService.findRestaurantById(input);
      return { ok: true, restaurant };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  @Query(() => SearchRestaurantsResult)
  async searchRestaurants(@Args('input') input: SearchRestaurantsInput) {
    try {
      const [restaurants, totalResult] =
        await this.restaurantService.searchRestaurants(input);
      return {
        ok: true,
        restaurants,
        totalPages: Math.ceil(totalResult / 25),
      };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }
}
