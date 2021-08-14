import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateRestaurantInput } from './dtos/create-restaurant.dto';
import { DeleteRestaurantInput } from './dtos/delete-restaurant.dto';
import { EditRestaurantInput } from './dtos/edit-restaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private readonly categories: CategoryRepository,
  ) {}
  async create(restaurantDto: CreateRestaurantInput, owner: User) {
    const restaurant = this.restaurants.create(restaurantDto);
    restaurant.owner = owner;
    const category = await this.categories.getOrCreate(
      restaurantDto.categoryName,
    );
    restaurant.category = category;
    return this.restaurants.save(restaurant);
  }

  async edit(input: EditRestaurantInput, owner: User) {
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

  async delete(owner: User, { id }: DeleteRestaurantInput) {
    const restaurant = await this.restaurants.findOne(id);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    if (restaurant.ownerId !== owner.id) {
      throw new Error('Only owner can delete his/her restaurant.');
    }

    await this.restaurants.delete(id);
  }
}
