import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Verification } from './entities/verification.entity';

import { UserService } from './users.service';
const mockRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(({ id }) => {
    return `${id}-token`;
  }),
  verify: jest.fn(),
});

const mockMailService = () => ({
  sendVerification: jest.fn(),
});

type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;
describe('UserService', () => {
  let userService: UserService;
  let userRepo: MockRepository<User>;
  let verificationRepo: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService(),
        },
        {
          provide: MailService,
          useValue: mockMailService(),
        },
      ],
    }).compile();
    userService = module.get(UserService);
    userRepo = module.get(getRepositoryToken(User));
    verificationRepo = module.get(getRepositoryToken(Verification));
    mailService = module.get(MailService);
    jwtService = module.get(JwtService);
  });

  describe('create', () => {
    const createAccountArgs = {
      email: 'test@eg.com',
      password: '1234',
      role: UserRole.Client,
    };
    it('should fail if user exists', async () => {
      userRepo.findOne.mockResolvedValue({ id: 1, email: 'test@eg.com' });
      const res = await userService.create(createAccountArgs);

      expect(res).toMatchObject({
        ok: false,
        error: 'User already exists',
      });
    });

    it('should create successfully', async () => {
      userRepo.findOne.mockResolvedValue(undefined);
      userRepo.create.mockReturnValue(createAccountArgs);
      verificationRepo.create.mockReturnValue({ code: 'code' });
      verificationRepo.save.mockReturnValue({ code: 'code' });

      const result = await userService.create(createAccountArgs);

      expect(userRepo.create).toHaveBeenCalledTimes(1);
      expect(userRepo.create).toHaveBeenCalledWith(createAccountArgs);

      expect(userRepo.save).toHaveBeenCalledTimes(1);
      expect(userRepo.save).toHaveBeenCalledWith(createAccountArgs);

      expect(verificationRepo.create).toHaveBeenCalledTimes(1);
      expect(verificationRepo.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(verificationRepo.save).toHaveBeenCalledTimes(1);
      expect(verificationRepo.save).toHaveBeenCalledWith({ code: 'code' });

      expect(mailService.sendVerification).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerification).toHaveBeenCalledWith(
        createAccountArgs.email,
        [
          { key: 'code', value: 'code' },
          { key: 'username', value: createAccountArgs.email },
        ],
      );

      expect(result).toEqual({ ok: true });
    });

    it('should fail on an exception', async () => {
      userRepo.save.mockRejectedValue(new Error('test_error'));
      const result = await userService.create(createAccountArgs);
      expect(result).toEqual({ ok: false, error: "Couldn't create account" });
    });
  });

  describe('login', () => {
    const loginArgs = {
      email: 'example@eg.com',
      password: '12345',
    };
    it('should fail if user does not exist', async () => {
      userRepo.findOne.mockReturnValue(null);

      const result = await userService.login(loginArgs);
      expect(result).toMatchObject(result);
    });
    it('should fail if password is incorrect', async () => {
      const mockedUser = {
        checkPassword: jest
          .fn()
          .mockImplementation(() => Promise.resolve(false)),
      };
      userRepo.findOne.mockResolvedValue(mockedUser);
      const result = await userService.login(loginArgs);
      expect(result).toEqual({ ok: false, error: 'Incorrect password' });
    });

    it('should return token if login successful', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest
          .fn()
          .mockImplementation(() => Promise.resolve(true)),
      };
      userRepo.findOne.mockReturnValue(mockedUser);

      const result = await userService.login(loginArgs);

      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith({ id: 1 });

      expect(result).toEqual({
        ok: true,
        token: '1-token',
      });
    });
  });
  describe('update', () => {
    it('should change email', async () => {
      const oldUser: any = {
        id: 1,
        email: 'eg@old.com',
        verified: true,
      };
      const newUser = {
        email: 'eg@new.com',
      };
      const newVerification = {
        code: 'new_code',
      };
      verificationRepo.create.mockReturnValue(newVerification);
      verificationRepo.save.mockResolvedValue(newVerification);
      await userService.update(oldUser, newUser);

      expect(verificationRepo.create).toHaveBeenCalledTimes(1);
      expect(verificationRepo.create).toHaveBeenCalledWith({
        user: { ...oldUser, ...newUser },
      });

      expect(verificationRepo.save).toHaveBeenCalledTimes(1);
      expect(verificationRepo.save).toHaveBeenCalledWith(newVerification);

      expect(mailService.sendVerification).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerification).toHaveBeenCalledWith(newUser.email, [
        { key: 'code', value: newVerification.code },
        { key: 'username', value: newUser.email },
      ]);

      expect(userRepo.save).toHaveBeenCalledTimes(1);
      expect(userRepo.save).toHaveBeenCalledWith({ ...oldUser, ...newUser });
    });

    it('should change password', async () => {
      const oldUser: any = {
        id: 1,
        email: 'eg@old.com',
        verified: true,
      };
      const newUser = {
        password: '1111',
      };
      await userService.update(oldUser, newUser);

      expect(userRepo.save).toHaveBeenCalledTimes(1);
      expect(userRepo.save).toHaveBeenCalledWith({ ...oldUser, ...newUser });
    });

    it('should fail on an exception', async () => {
      const oldUser: any = {
        id: 1,
        email: 'eg@old.com',
        verified: true,
      };
      const newUser = {
        email: 'eg@new.com',
      };
      const newVerification = {
        code: 'new_code',
      };
      verificationRepo.create.mockReturnValue(newVerification);
      verificationRepo.save.mockRejectedValue('test_error');

      const result = await userService.update(oldUser, newUser);
      expect(result).toEqual({
        ok: false,
        error: 'Could not edit profile. Something went wrong!!',
      });
    });
  });
  describe('verifyEmail', () => {
    it('should verify email', async () => {
      const mockedVerification = {
        verified: false,
        user: 1,
      };
      verificationRepo.findOne.mockResolvedValue(mockedVerification);

      await userService.verifyEmail('code');

      expect(userRepo.update).toHaveBeenCalledTimes(1);
      expect(userRepo.update).toHaveBeenCalledWith(1, { verified: true });

      expect(verificationRepo.remove).toHaveBeenCalledTimes(1);
      expect(verificationRepo.remove).toHaveBeenCalledWith(mockedVerification);
    });

    it('should fail if verification does not exist', async () => {
      verificationRepo.findOne.mockResolvedValue(null);
      await expect(userService.verifyEmail('code')).rejects.toThrow(
        "Your verification code doesn't exist anymore.",
      );
    });
  });
});
