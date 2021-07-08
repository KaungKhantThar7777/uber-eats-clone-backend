import { UnauthorizedException } from '@nestjs/common';
import { NestMiddleware } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UserService } from 'src/users/users.service';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if ('token' in req.headers) {
      try {
        const result = this.jwtService.verify(req.headers['token'] as string);
        if (typeof result === 'object' && 'id' in result) {
          const user = await this.userService.findById(result['id']);
          req['user'] = user;
        }
      } catch (error) {
        throw new UnauthorizedException();
      }
    }
    next();
  }
}
