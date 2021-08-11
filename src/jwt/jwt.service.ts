import { Inject, Injectable } from '@nestjs/common';
import { JWT_CONFIG } from './jwt.constants';
import * as jwt from 'jsonwebtoken';
import { JWT_OPTIONS } from './jwt.interfaces';

@Injectable()
export class JwtService {
  constructor(@Inject(JWT_CONFIG) private readonly options: JWT_OPTIONS) {}
  sign(payload: object) {
    return jwt.sign(payload, this.options.privateKey);
  }

  verify(token: string) {
    return jwt.verify(token, this.options.privateKey);
  }
}
