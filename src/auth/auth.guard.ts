import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtPayload } from 'jsonwebtoken';
import { JwtService } from 'src/jwt/jwt.service';
import { User } from 'src/users/entities/user.entity';
import { UserService } from 'src/users/users.service';
import { allowedRoles } from './roles.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<allowedRoles>(
      'roles',
      context.getHandler(),
    );
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const token = gqlContext['token'];
    if (!roles && !token) {
      return true;
    }
    const result = this.jwtService.verify(token);
    if (typeof result === 'object' && 'id' in result) {
      const user = await this.userService.findById(result['id']);

      gqlContext['user'] = user;
      if (!roles) {
        return true;
      }
      if (!user) {
        return false;
      }

      if (roles.includes('Any')) {
        return true;
      }

      return roles.includes(user.role);
    }
  }
}
