import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { Response } from 'supertest';
import { nanoid } from 'nanoid';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let dbConnection: Connection;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: (key: string) => {
          if (key === 'MONGODB_URI') return uri;
          return process.env[key];
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    dbConnection = moduleFixture.get<Connection>(getConnectionToken());
    await app.init();
  }, 30000); // Increase timeout for setup

  afterAll(async () => {
    try {
      await dbConnection.close();
      await app.close();
      await mongod.stop({ force: true });
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }, 30000); // Increase timeout for cleanup

  afterEach(async () => {
    const collections = dbConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      if (collection) {
        await collection.deleteMany({});
      }
    }
  });

  describe('POST /auth/v1/signup/email', () => {
    const signUpDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/v1/signup/email')
        .send(signUpDto)
        .expect(201)
        .expect((res: Response) => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.email).toBe(signUpDto.email);
          expect(res.body.data).not.toHaveProperty('password');
          expect(res.body.data.roles).toEqual(['user']);
          expect(res.body).not.toHaveProperty('token');
          expect(res.headers['set-cookie']).toBeDefined();
        });
    });

    it('should not create a user with existing email', async () => {
      await request(app.getHttpServer())
        .post('/auth/v1/signup/email')
        .send(signUpDto)
        .expect(201);

      return request(app.getHttpServer())
        .post('/auth/v1/signup/email')
        .send(signUpDto)
        .expect(409)
        .expect((res: Response) => {
          expect(res.body.message).toBe('User already exists');
        });
    });
  });

  describe('POST /auth/signin', () => {
    const signUpDto = {
      email: `test${nanoid()}@example.com`,
      password: 'password123',
    };

    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/auth/v1/signup/email')
        .send(signUpDto)
        .expect(201);
    });

    it('should sign in with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/v1/signin/email')
        .send(signUpDto)
        .expect(200)
        .expect((res: Response) => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.email).toBe(signUpDto.email);
          expect(res.body.data.roles).toEqual(['user']);
          expect(res.body).not.toHaveProperty('token');
          expect(res.headers['set-cookie']).toBeDefined();
        });
    });

    it('should not sign in with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/v1/signin/email')
        .send({
          email: signUpDto.email,
          password: 'wrongpassword',
        })
        .expect(401)
        .expect((res: Response) => {
          expect(res.body.message).toBe('Invalid credentials');
        });
    });
  });

  // describe('POST /auth/refresh', () => {
  //   const signUpDto = {
  //     email: `test${nanoid()}@example.com`,
  //     password: 'password123',
  //   };

  //   let refreshToken: string;

  //   beforeEach(async () => {
  //     await request(app.getHttpServer())
  //       .post('/auth/signup/email')
  //       .send(signUpDto)
  //       .expect(201);

  //     const signInResponse = await request(app.getHttpServer())
  //       .post('/auth/signin')
  //       .send(signUpDto)
  //       .expect(200);
  //     const cookie = signInResponse.headers['set-cookie'];
  //     if (cookie) {
  //       // Parse the refresh_token from the cookie array
  //       // The cookie is an array of strings, find the one containing refresh_token
  //       const refreshCookie = Array.isArray(cookie)
  //         ? cookie.find((c: string) => c.includes('refresh_token='))
  //         : null;
  //       // Extract the token value from the cookie string
  //       refreshToken = refreshCookie
  //         ? refreshCookie.split(';')[0].split('=')[1]
  //         : '';
  //     }
  //   });

  //   it('should refresh token with valid refresh token', () => {
  //     console.log(
  //       `refreshTokenrefreshTokenrefreshTokenrefreshTokenrefreshToken: ${refreshToken}`,
  //     );
  //     return request(app.getHttpServer())
  //       .post('/auth/refresh')
  //       .set('Cookie', [`refresh_token=${refreshToken}`])
  //       .expect(200)
  //       .expect((res: Response) => {
  //         expect(res.body.token).toHaveProperty('jwt');
  //         expect(res.headers['set-cookie']).toBeDefined();
  //       });
  //   });

  //   it('should not refresh token without refresh token', () => {
  //     return request(app.getHttpServer())
  //       .post('/auth/refresh')
  //       .expect(401)
  //       .expect((res: Response) => {
  //         expect(res.body.message).toBe('Refresh token not found');
  //       });
  //   });
  // });

  describe('POST /auth/v1/logout', () => {
    it('should logout successfully', async () => {
      // 1. 먼저 회원가입
      const signupResponse = await request(app.getHttpServer())
        .post('/auth/v1/signup/email')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201);

      // 2. signup 후에 응답에서 쿠키 추출
      const cookies = signupResponse.headers['set-cookie'];
      if (!cookies || !Array.isArray(cookies)) {
        throw new Error('No cookies received from signup response');
      }

      await request(app.getHttpServer())
        .post('/auth/v1/logout')
        .set('Cookie', cookies)
        .expect(200)
        .expect((res: Response) => {
          expect(res.body.message).toBe('Successfully logged out');
          expect(res.headers['set-cookie']).toBeDefined();
        });
    });
  });
});
