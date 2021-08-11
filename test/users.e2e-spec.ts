import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { Verification } from 'src/users/entities/verification.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let verificationRepo: Repository<Verification>;
  const GRAPHQL_ENPOINT = '/graphql';
  const email = 'kaungkhantthar77@gmail.com';
  const password = '55555';
  let token: string;
  let code: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    verificationRepo = module.get(getRepositoryToken(Verification));
    await app.init();
  });
  afterAll(async () => {
    await getConnection().dropDatabase();
    await app.close();
  });
  describe('createAccount', () => {
    it('should ok when no exist user', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENPOINT)
        .send({
          query: `
          mutation{
            createAccount(input:{email:"${email}",password:"55555",role:Client}){
              error
              ok
            }
          }
        `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(true);
          expect(res.body.data.createAccount.error).toBe(null);
        });
    });

    it('should fail when user exists', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENPOINT)
        .send({
          query: `
          mutation{
            createAccount(input:{email:"${email}",password:"${password}",role:Client}){
              error
              ok
            }
          }
        `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(false);
          expect(res.body.data.createAccount.error).toBe('User already exists');
        });
    });
  });
  describe('login', () => {
    it('should login with correct credentials', async () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENPOINT)
        .send({
          query: `
        mutation{
          login(input:{email:"${email}",password:"${password}"}){
            error
            ok
            token
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            data: { login },
          } = res.body;
          expect(login.ok).toBe(true);
          expect(login.error).toBe(null);
          expect(login.token).toEqual(expect.any(String));
          token = login.token;
        });
    });

    it('should fail login with incorrect credentials', async () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENPOINT)
        .send({
          query: `
        mutation{
          login(input:{email:"${email}",password:"12345"}){
            error
            ok
            token
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            data: { login },
          } = res.body;
          expect(login.ok).toBe(false);
          expect(login.error).toBe('Incorrect password');
          expect(login.token).toEqual(null);
        });
    });
  });
  describe('userProfile', () => {
    it('should see user profile with token', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENPOINT)
        .set('token', token)
        .send({
          query: `
        {
          userProfile(id:1){
            ok
            error
            user{
              id
            }
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            data: {
              userProfile: { ok, error, user },
            },
          } = res.body;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(user.id).toBe(1);
        });
    });

    it('should not see user profile without token', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENPOINT)
        .send({
          query: `
        {
          userProfile(id:1){
            ok
            error
            user{
              id
            }
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          const { errors, data } = res.body;
          expect(data).toBe(null);
          expect(errors[0].message).toBe('Forbidden resource');
        });
    });
  });
  describe('me', () => {
    it('should find my profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENPOINT)
        .set('token', token)
        .send({
          query: `
          {
            me{
              email
            }
          }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            data: { me },
          } = res.body;
          expect(me.email).toBe(email);
        });
    });

    it('should not find my profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENPOINT)
        .send({
          query: `
          {
            me{
              email
            }
          }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            data: { me },
          } = res.body;
          expect(me).toBe(null);
        });
    });
  });
  describe('verifyEmail', () => {
    beforeAll(async () => {
      const verification = await verificationRepo.findOne(1);
      code = verification.code;
    });
    it('should verify with code', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENPOINT)
        .send({
          query: `
            mutation{
              verifyEmail(code:"${code}"){
                error
                ok
              }
            }
         `,
        })
        .expect(200)
        .expect((res) => {
          const {
            data: { verifyEmail },
          } = res.body;

          expect(verifyEmail.ok).toBe(true);
          expect(verifyEmail.error).toBe(null);
        });
    });

    it('should fail verify with incorrect code', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENPOINT)
        .send({
          query: `
            mutation{
              verifyEmail(code:"1234"){
                error
                ok
              }
            }

      `,
        })
        .expect(200)
        .expect((res) => {
          const {
            data: { verifyEmail },
          } = res.body;

          expect(verifyEmail.ok).toBe(false);
          expect(verifyEmail.error).toBe(
            "Your verification code doesn't exist anymore.",
          );
        });
    });
  });
  describe('editProfile', () => {
    const newEmail = 'new@example.com';
    it('should change email', async () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENPOINT)
        .set('token', token)
        .send({
          query: `
            mutation{
              editProfile(input:{
                email:"${newEmail}"
              }){
                error
                ok
              }
            }
        `,
        })
        .expect(200)
        .expect((res) => {
          console.log(res);
        });
    });
  });
});
