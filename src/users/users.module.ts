import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from 'src/jwt/jwt.module';
import { JwtService } from 'src/jwt/jwt.service';
import { User } from './entities/user.entity';
import { UsersResolver } from './users.resolver';
import { UserService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ConfigModule],
  providers: [UsersResolver, UserService],
})
export class UsersModule {}
