import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateRestaurantInput } from './dtos/create-restaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}
  async create(restaurantDto: CreateRestaurantInput, owner: User) {
    const restaurant = this.restaurants.create(restaurantDto);
    restaurant.owner = owner;
    const categoryName = restaurantDto.categoryName.trim().toLowerCase();
    const categorySlug = categoryName.replace(/ /g, '-');
    let category = await this.categories.findOne({ slug: categorySlug });
    if (!category) {
      category = this.categories.create({
        name: categoryName,
        slug: categorySlug,
      });
      await this.categories.save(category);
    }

    restaurant.category = category;
    return this.restaurants.save(restaurant);
  }
}
