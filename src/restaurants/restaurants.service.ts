import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { ILike, Repository } from 'typeorm';
import { CategoryInput } from './dtos/one-category.dto';
import { CreateRestaurantInput } from './dtos/create-restaurant.dto';
import { DeleteRestaurantInput } from './dtos/delete-restaurant.dto';
import { EditRestaurantInput } from './dtos/edit-restaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';
import { AllRestaurantsInput } from './dtos/all-restaurants.dto';
import { OneRestaurantInput } from './dtos/one-restaurant.dto';
import { SearchRestaurantsInput } from './dtos/search-restaurants.dto';
import { CreateDishInput } from './dtos/create-dish.dto';
import { Dish } from './entities/dish.entity';
import { EditDishInput } from './dtos/edit-dish.dto';
import { DeleteDishInput } from './dtos/delete-dish.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    private readonly categories: CategoryRepository,
  ) {}
  restaurantsCount(category: Category) {
    return this.restaurants.count({ category });
  }

  async createRestaurant(restaurantDto: CreateRestaurantInput, owner: User) {
    const restaurant = this.restaurants.create(restaurantDto);
    restaurant.owner = owner;
    const category = await this.categories.getOrCreate(
      restaurantDto.categoryName,
    );
    restaurant.category = category;
    return this.restaurants.save(restaurant);
  }

  async editRestaurant(input: EditRestaurantInput, owner: User) {
    const restaurant = await this.restaurants.findOne(input.restaurantId);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    if (restaurant.ownerId !== owner.id) {
      throw new Error('Only owner can edit his/her restaurant.');
    }

    let category: Category = null;
    if (input.categoryName) {
      category = await this.categories.getOrCreate(input.categoryName);
    }

    await this.restaurants.save([
      {
        id: input.restaurantId,
        ...input,
        ...(category && { category }),
      },
    ]);
  }

  async deleteRestaurant(owner: User, { id }: DeleteRestaurantInput) {
    const restaurant = await this.restaurants.findOne(id);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    if (restaurant.ownerId !== owner.id) {
      throw new Error('Only owner can delete his/her restaurant.');
    }

    await this.restaurants.delete(id);
  }

  async allCategories() {
    return this.categories.find({});
  }

  async findCategoryBySlug({ slug, page }: CategoryInput) {
    const category = await this.categories.findOne({ slug });
    if (!category) {
      throw new Error('Category does not exist');
    }

    const restaurants = await this.restaurants.find({
      where: {
        category,
      },
      take: 25,
      skip: (page - 1) * 25,
    });
    category.restaurants = restaurants;
    return category;
  }

  async allRestaurants({ page }: AllRestaurantsInput) {
    const results = await this.restaurants.findAndCount({
      skip: (page - 1) * 25,
      take: 25,
    });
    return results;
  }

  findRestaurantById(input: OneRestaurantInput) {
    return this.restaurants.findOne(
      { id: input.restaurantId },
      {
        relations: ['menu'],
      },
    );
  }

  async searchRestaurants(input: SearchRestaurantsInput) {
    const results = await this.restaurants.findAndCount({
      where: {
        name: ILike(`%${input.query}%`),
      },
    });

    if (results[0].length < 0) throw new Error('No restaurants found');

    return results;
  }

  async createDish(owner: User, { restaurantId, ...input }: CreateDishInput) {
    const restaurant = await this.restaurants.findOne(restaurantId);
    if (!restaurant) throw new Error('Restaurant not found');

    if (owner.id !== restaurant.ownerId) {
      throw new Error("Only restaurant's owner can add dish");
    }

    await this.dishes.save(this.dishes.create({ restaurant, ...input }));
  }

  async editDish(owner: User, { dishId, ...rest }: EditDishInput) {
    console.log(owner);
    await this.checkDishOwner(dishId, owner.id);

    await this.dishes.save([
      {
        id: dishId,
        ...rest,
      },
    ]);
  }

  async deleteDish(owner: User, { dishId }: DeleteDishInput) {
    await this.checkDishOwner(dishId, owner.id);

    await this.dishes.delete(dishId);
  }

  async checkDishOwner(dishId, ownerId) {
    const dish = await this.dishes.findOne(dishId, {
      relations: ['restaurant'],
    });
    if (!dish) {
      throw new Error('Dish not found');
    }
    if (dish.restaurant.ownerId !== ownerId) {
      throw new Error("Can't edit dish others' dishes.");
    }
  }
}
