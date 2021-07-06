import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountResult,
} from './dtos/create-account.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async create({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountResult> {
    try {
      const isExist = await this.users.findOne({ email });
      if (isExist) {
        return {
          ok: false,
          error: 'User already exists',
        };
      }

      const user = this.users.create({ email, password, role });
      await this.users.save(user);
      return { ok: true };
    } catch (error) {
      console.log(error);
      return { ok: false, error: "Couldn't create account" };
    }
  }
}
