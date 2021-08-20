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
import {
  AllRestaurantsInput,
  AllRestaurantsResult,
} from './dtos/all-restaurants.dto';
import { CreateDishInput, CreateDishResult } from './dtos/create-dish.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantResult,
} from './dtos/create-restaurant.dto';
import { DeleteDishInput, DeleteDishResult } from './dtos/delete-dish.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantResult,
} from './dtos/delete-restaurant.dto';
import { EditDishInput, EditDishResult } from './dtos/edit-dish.dto';
import {
  EditRestaurantInput,
  EditRestaurantResult,
} from './dtos/edit-restaurant.dto';
import { CategoryInput, CategoryResult } from './dtos/one-category.dto';
import {
  OneRestaurantInput,
  OneRestaurantResult,
} from './dtos/one-restaurant.dto';
import {
  SearchRestaurantsInput,
  SearchRestaurantsResult,
} from './dtos/search-restaurants.dto';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
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
      await this.restaurantService.createRestaurant(
        createRestaurantInput,
        owner,
      );
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
      await this.restaurantService.editRestaurant(input, owner);
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
      await this.restaurantService.deleteRestaurant(owner, input);
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

@Resolver(() => Dish)
export class DishResolver {
  constructor(private readonly restaurantService: RestaurantService) {}
  @Mutation(() => CreateDishResult)
  @Roles(['Owner'])
  async createDish(
    @AuthUser() owner: User,
    @Args('input') input: CreateDishInput,
  ) {
    try {
      await this.restaurantService.createDish(owner, input);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  @Mutation(() => EditDishResult)
  @Roles(['Owner'])
  async editDish(@AuthUser() owner: User, @Args('input') input: EditDishInput) {
    try {
      await this.restaurantService.editDish(owner, input);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  @Mutation(() => DeleteDishResult)
  async deleteDish(
    @AuthUser() owner: User,
    @Args('input') input: DeleteDishInput,
  ) {
    try {
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }
}
