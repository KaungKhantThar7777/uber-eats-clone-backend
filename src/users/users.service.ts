import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountResult,
} from './dtos/create-account.dto';
import { LoginInput, LoginResult } from './dtos/login.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  findById(id: number) {
    return this.users.findOne(id);
  }

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

  async login({ email, password }: LoginInput): Promise<LoginResult> {
    const user = await this.users.findOne({ email });
    if (!user) {
      return {
        ok: false,
        error: 'Such user does not exist',
      };
    }

    const isCorrect = user.checkPassword(password);
    if (!isCorrect) {
      return { ok: false, error: 'Incorrect password' };
    }

    const token = this.jwtService.sign({ id: user.id });
    return {
      ok: true,
      token,
    };
  }
}
