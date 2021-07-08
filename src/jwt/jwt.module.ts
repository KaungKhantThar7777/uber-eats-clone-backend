import { Global } from '@nestjs/common';
import { DynamicModule, Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { UserService } from 'src/users/users.service';
import { JWT_CONFIG } from './jwt.constants';
import { JWT_OPTIONS } from './jwt.interfaces';
import { JwtService } from './jwt.service';

@Module({})
@Global()
export class JwtModule {
  static forRoot(options: JWT_OPTIONS): DynamicModule {
    return {
      module: JwtModule,
      providers: [{ provide: JWT_CONFIG, useValue: options }, JwtService],
      exports: [JwtService],
    };
  }
}
