import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { JWT_CONFIG } from './jwt.constants';
import { JwtService } from './jwt.service';
import * as jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'TOKEN'),
  verify: jest.fn(() => ({ id: 1 })),
}));

describe('JwtService', () => {
  const privateKey = 'testKey';
  let service: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: JWT_CONFIG,
          useValue: { privateKey },
        },
      ],
    }).compile();

    service = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should sign a token', () => {
    service.sign({ id: 1 });
    expect(jwt.sign).toHaveBeenCalledTimes(1);
    expect(jwt.sign).toHaveBeenCalledWith({ id: 1 }, privateKey);
  });
  it('should verify a token', () => {
    service.verify('Token');
    expect(jwt.verify).toHaveBeenCalledTimes(1);
    expect(jwt.verify).toHaveBeenCalledWith('Token', privateKey);
  });
});
