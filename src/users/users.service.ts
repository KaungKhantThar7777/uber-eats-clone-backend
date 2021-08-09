import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountResult,
} from './dtos/create-account.dto';
import { EditProfileInput } from './dtos/edit-profile.dto';
import { LoginInput, LoginResult } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
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

      const verification = await this.verifications.save(
        this.verifications.create({
          user,
        }),
      );
      await this.mailService.sendVerification(user.email, [
        { key: 'code', value: verification.code },
        { key: 'username', value: user.email },
      ]);

      return { ok: true };
    } catch (error) {
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

    const isCorrect = await user.checkPassword(password);

    if (!isCorrect) {
      return { ok: false, error: 'Incorrect password' };
    }

    const token = this.jwtService.sign({ id: user.id });
    return {
      ok: true,
      token,
    };
  }

  async update(user: User, { email, password }: EditProfileInput) {
    try {
      if (email) {
        user.email = email;
        user.verified = false;
        const verification = await this.verifications.save(
          this.verifications.create({
            user,
          }),
        );
        await this.mailService.sendVerification(user.email, [
          { key: 'code', value: verification.code },
          { key: 'username', value: user.email },
        ]);
      }
      if (password) {
        user.password = password;
      }
      await this.users.save(user);
    } catch (error) {
      return {
        ok: false,
        error: 'Could not edit profile. Something went wrong!!',
      };
    }
  }

  async verifyEmail(code: string) {
    const verification = await this.verifications.findOne(
      { code },
      { loadRelationIds: true },
    );
    if (!verification) {
      throw new Error("Your verification code doesn't exist anymore.");
    }
    await this.users.update(verification.user, { verified: true });
    await this.verifications.remove(verification);
  }
}
