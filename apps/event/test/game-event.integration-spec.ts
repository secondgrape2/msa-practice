import { CreateGameEventDto } from '@app/common/event/dto/game-event.dto';
import { CreateRewardDto } from '@app/common/event/dto/reward.dto';
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import cookieParser from 'cookie-parser';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Connection, Types } from 'mongoose';
import request from 'supertest';
import { ROLE } from '@app/common/auth-core/constants/role.constants';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { REWARD_TYPE } from '../src/domain/reward.domain';
import { CONDITION_TYPE } from '../src/domain/reward.domain';
import { REWARD_REQUEST_COLLECTION_NAME } from '../src/schemas/reward-request.schema';

describe('GameEventController (Integration)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let dbConnection: Connection;
  let adminToken: string;
  let userToken: string;
  let userId: string;
  let createdEventId: string;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const JWT_SECRET = 'test-secret';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: (key: string) => {
          if (key === 'MONGODB_URI') return uri;
          if (key === 'JWT_ACCESS_TOKEN_SECRET') return JWT_SECRET;
          return process.env[key];
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    dbConnection = moduleFixture.get<Connection>(getConnectionToken());
    await app.init();

    // Create test tokens
    const adminId = new mongoose.Types.ObjectId().toString();
    adminToken = jwt.sign(
      {
        sub: adminId,
        email: 'admin@example.com',
        roles: [ROLE.ADMIN],
      },
      JWT_SECRET,
      { expiresIn: 86400 },
    );

    userId = new mongoose.Types.ObjectId().toString();
    userToken = jwt.sign(
      {
        sub: userId,
        email: 'user@example.com',
        roles: [ROLE.USER],
      },
      JWT_SECRET,
      { expiresIn: 86400 },
    );
  }, 30000);

  afterAll(async () => {
    try {
      await dbConnection.close();
      await app.close();
      await mongod.stop({ force: true });
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }, 30000);

  afterEach(async () => {
    const collections = dbConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      if (collection) {
        await collection.deleteMany({});
      }
    }
  });

  describe('POST /events/v1/admin', () => {
    it('should create a new game event', async () => {
      const createEventDto: CreateGameEventDto = {
        name: 'Test Event',
        description: 'Test Description',
        startAt: new Date('2024-01-01T00:00:00Z'),
        endAt: new Date('2024-12-31T23:59:59Z'),
        isActive: true,
      };

      const response = await request(app.getHttpServer())
        .post('/events/v1/admin')
        .set('Cookie', [`access_token=${adminToken}`])
        .send(createEventDto)
        .expect(201);

      createdEventId = response.body.id;
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createEventDto.name);
      expect(response.body.description).toBe(createEventDto.description);
      expect(new Date(response.body.startAt)).toEqual(createEventDto.startAt);
      expect(new Date(response.body.endAt)).toEqual(createEventDto.endAt);
      expect(response.body.isActive).toBe(true);
    });

    it('should return 403 when user is not admin', async () => {
      const createEventDto: CreateGameEventDto = {
        name: 'Test Event',
        description: 'Test Description',
        startAt: new Date('2024-01-01T00:00:00Z'),
        endAt: new Date('2024-12-31T23:59:59Z'),
        isActive: true,
      };

      await request(app.getHttpServer())
        .post('/events/v1/admin')
        .set('Cookie', [`access_token=${userToken}`])
        .send(createEventDto)
        .expect(403);
    });
  });

  describe('POST /events/v1/:eventId/rewards', () => {
    beforeEach(async () => {
      // Create an event for each test
      const createEventDto: CreateGameEventDto = {
        name: 'Test Event for Rewards',
        description: 'Test Description for Rewards',
        startAt: new Date('2024-01-01T00:00:00Z'),
        endAt: new Date('2024-12-31T23:59:59Z'),
        isActive: true,
      };

      const response = await request(app.getHttpServer())
        .post('/events/v1/admin')
        .set('Cookie', [`access_token=${adminToken}`])
        .send(createEventDto);

      createdEventId = response.body.id;
    });

    it('should create a point reward', async () => {
      const createRewardDto: CreateRewardDto = {
        type: REWARD_TYPE.POINT,
        name: 'Login Bonus',
        description: 'Daily login bonus',
        pointDetails: {
          pointAmount: 1000,
          expiryDate: new Date('2024-12-31T23:59:59Z'),
        },
        conditionType: CONDITION_TYPE.LEVEL,
        conditionConfig: {
          operator: 'AND',
          rules: [
            {
              type: 'level',
              params: { minLevel: 5 },
            },
          ],
        },
        conditionsDescription: '레벨 5 이상',
      };

      const response = await request(app.getHttpServer())
        .post(`/events/v1/${createdEventId}/rewards`)
        .set('Cookie', [`access_token=${adminToken}`])
        .send(createRewardDto)
        .expect(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.type).toBe(REWARD_TYPE.POINT);
      expect(response.body.name).toBe(createRewardDto.name);
      expect(response.body.description).toBe(createRewardDto.description);
      if (createRewardDto.pointDetails) {
        expect(response.body.pointDetails).toEqual({
          pointAmount: createRewardDto.pointDetails.pointAmount,
          expiryDate: createRewardDto.pointDetails.expiryDate?.toISOString(),
        });
      }
      expect(response.body.conditionType).toBe(createRewardDto.conditionType);
      expect(response.body.conditionConfig).toEqual(
        createRewardDto.conditionConfig,
      );
      expect(response.body.conditionsDescription).toBe(
        createRewardDto.conditionsDescription,
      );
    });

    it('should create an item reward', async () => {
      const createRewardDto: CreateRewardDto = {
        type: REWARD_TYPE.ITEM,
        name: 'Premium Sword',
        description: 'Legendary sword for warriors',
        itemDetails: {
          itemId: 'sword_001',
          itemName: 'Premium Sword',
          itemQuantity: 1,
        },
        conditionType: CONDITION_TYPE.LEVEL,
        conditionConfig: {
          operator: 'AND',
          rules: [
            {
              type: 'level',
              params: { minLevel: 10 },
            },
          ],
        },
        conditionsDescription: '레벨 10 이상',
      };

      const response = await request(app.getHttpServer())
        .post(`/events/v1/${createdEventId}/rewards`)
        .set('Cookie', [`access_token=${adminToken}`])
        .send(createRewardDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.type).toBe(REWARD_TYPE.ITEM);
      expect(response.body.name).toBe(createRewardDto.name);
      expect(response.body.description).toBe(createRewardDto.description);
      if (createRewardDto.itemDetails) {
        expect(response.body.itemDetails).toEqual(createRewardDto.itemDetails);
      }
      expect(response.body.conditionType).toBe(createRewardDto.conditionType);
      expect(response.body.conditionConfig).toEqual(
        createRewardDto.conditionConfig,
      );
      expect(response.body.conditionsDescription).toBe(
        createRewardDto.conditionsDescription,
      );
    });

    it('should create a coupon reward', async () => {
      const createRewardDto: CreateRewardDto = {
        type: REWARD_TYPE.COUPON,
        name: 'Summer Discount',
        description: '20% off on all items',
        couponDetails: {
          couponCode: 'SUMMER2024',
          discountAmount: 20,
          discountType: 'percentage',
          expiryDate: new Date('2024-08-31T23:59:59Z'),
        },
        conditionType: CONDITION_TYPE.LOGIN_STREAK,
        conditionConfig: {
          operator: 'AND',
          rules: [
            {
              type: 'login_streak',
              params: { minStreak: 7 },
            },
          ],
        },
        conditionsDescription: '7일 연속 로그인',
      };

      const response = await request(app.getHttpServer())
        .post(`/events/v1/${createdEventId}/rewards`)
        .set('Cookie', [`access_token=${adminToken}`])
        .send(createRewardDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.type).toBe(REWARD_TYPE.COUPON);
      expect(response.body.name).toBe(createRewardDto.name);
      expect(response.body.description).toBe(createRewardDto.description);
      if (createRewardDto.couponDetails) {
        expect(response.body.couponDetails).toEqual({
          ...createRewardDto.couponDetails,
          expiryDate: createRewardDto.couponDetails.expiryDate?.toISOString(),
        });
      }
      expect(response.body.conditionType).toBe(createRewardDto.conditionType);
      expect(response.body.conditionConfig).toEqual(
        createRewardDto.conditionConfig,
      );
      expect(response.body.conditionsDescription).toBe(
        createRewardDto.conditionsDescription,
      );
    });

    it('should return 403 when user is not admin', async () => {
      const createRewardDto: CreateRewardDto = {
        type: REWARD_TYPE.POINT,
        name: 'Login Bonus',
        description: 'Daily login bonus',
        pointDetails: {
          pointAmount: 1000,
        },
        conditionType: CONDITION_TYPE.LEVEL,
        conditionConfig: {
          operator: 'AND',
          rules: [
            {
              type: 'level',
              params: { minLevel: 5 },
            },
          ],
        },
        conditionsDescription: '레벨 5 이상',
      };

      await request(app.getHttpServer())
        .post(`/events/v1/${createdEventId}/rewards`)
        .set('Cookie', [`access_token=${userToken}`])
        .send(createRewardDto)
        .expect(403);
    });

    it('should return 422 when event does not exist', async () => {
      const nonExistentEventId = new Types.ObjectId().toString();
      const createRewardDto: CreateRewardDto = {
        type: REWARD_TYPE.POINT,
        name: 'Login Bonus',
        description: 'Daily login bonus',
        pointDetails: {
          pointAmount: 1000,
        },
        conditionType: CONDITION_TYPE.LEVEL,
        conditionConfig: {
          operator: 'AND',
          rules: [
            {
              type: 'level',
              params: { minLevel: 5 },
            },
          ],
        },
        conditionsDescription: '레벨 5 이상',
      };

      await request(app.getHttpServer())
        .post(`/events/v1/${nonExistentEventId}/rewards`)
        .set('Cookie', [`access_token=${adminToken}`])
        .send(createRewardDto)
        .expect(422);
    });
  });

  describe('GET /events/v1', () => {
    it('should return all game events', async () => {
      // Create test events first
      const now = new Date();
      const createEventDto: CreateGameEventDto = {
        name: 'Test Event 1',
        description: 'Test Description 1',
        startAt: new Date(now.getTime() - 1000 * 60 * 60 * 24),
        endAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30),
        isActive: true,
      };

      await request(app.getHttpServer())
        .post('/events/v1/admin')
        .set('Cookie', [`access_token=${adminToken}`])
        .send(createEventDto);

      const response = await request(app.getHttpServer())
        .get('/events/v1')
        .expect(200);

      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.items.length).toBe(1);
      const event = response.body.items[0];
      expect(event).toHaveProperty('id');
      expect(event.name).toBe('Test Event 1');
      expect(event.description).toBe('Test Description 1');
      expect(event).toHaveProperty('startAt');
      expect(event).toHaveProperty('endAt');
      expect(event.isActive).toBe(true);
    });
  });

  describe('GET /events/v1/:id', () => {
    let createdEventId: string;

    beforeEach(async () => {
      // Create an event for each test
      const createEventDto: CreateGameEventDto = {
        name: 'Test Event for Get',
        description: 'Test Description for Get',
        startAt: new Date('2024-01-01T00:00:00Z'),
        endAt: new Date('2024-12-31T23:59:59Z'),

        isActive: true,
      };

      const response = await request(app.getHttpServer())
        .post('/events/v1/admin')
        .set('Cookie', [`access_token=${adminToken}`])
        .send(createEventDto);

      createdEventId = response.body.id;
    });

    it('should return a specific game event with rewards', async () => {
      const response = await request(app.getHttpServer())
        .get(`/events/v1/${createdEventId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdEventId);
      expect(response.body).toHaveProperty('name', 'Test Event for Get');
      expect(response.body).toHaveProperty(
        'description',
        'Test Description for Get',
      );
      expect(response.body).toHaveProperty('rewards');
      expect(Array.isArray(response.body.rewards)).toBe(true);
    });

    it('should return 404 for non-existent event', async () => {
      const nonExistentId = new Types.ObjectId().toString();
      await request(app.getHttpServer())
        .get(`/events/v1/${nonExistentId}`)
        .expect(422);
    });
  });

  describe('GET /events/v1/rewards/my-history', () => {
    let createdEventId: string;
    let createdRewardId: string;
    let pendingRewardId: string;

    beforeEach(async () => {
      // Create an event and reward for testing
      const createEventDto: CreateGameEventDto = {
        name: 'Test Event for History',
        description: 'Test Description for History',
        startAt: new Date('2024-01-01T00:00:00Z'),
        endAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        isActive: true,
      };

      const eventResponse = await request(app.getHttpServer())
        .post('/events/v1/admin')
        .set('Cookie', [`access_token=${adminToken}`])
        .send(createEventDto);

      createdEventId = eventResponse.body.id;

      const createRewardDto: CreateRewardDto = {
        type: REWARD_TYPE.POINT,
        name: 'Test Reward',
        description: 'Test Reward Description',
        pointDetails: {
          pointAmount: 1000,
        },
        conditionType: CONDITION_TYPE.LEVEL,
        conditionConfig: {
          operator: 'AND',
          rules: [
            {
              type: 'level',
              params: { minLevel: 1 },
            },
          ],
        },
        conditionsDescription: '레벨 1 이상',
      };

      const firstRewardResponse = await request(app.getHttpServer())
        .post(`/events/v1/${createdEventId}/rewards`)
        .set('Cookie', [`access_token=${adminToken}`])
        .send(createRewardDto)
        .expect(201);

      createdRewardId = firstRewardResponse.body.id;

      // Create multiple reward requests with different statuses, success, failed, pending
      const request1 = await request(app.getHttpServer())
        .post('/events/v1/rewards/request')
        .set('Cookie', [`access_token=${userToken}`])
        .send({
          eventId: createdEventId,
          rewardId: createdRewardId,
        })
        .expect(201);

      // Update the status of the first request to success in DB
      await dbConnection.collection(REWARD_REQUEST_COLLECTION_NAME).updateOne(
        {
          _id: new Types.ObjectId(request1.body.id),
          userId: new Types.ObjectId(userId),
        },
        { $set: { status: 'success' } },
      );

      const secondRewardResponse = await request(app.getHttpServer())
        .post(`/events/v1/${createdEventId}/rewards`)
        .set('Cookie', [`access_token=${adminToken}`])
        .send(createRewardDto)
        .expect(201);

      createdRewardId = secondRewardResponse.body.id;

      // Create another reward request, failed
      const request2 = await request(app.getHttpServer())
        .post('/events/v1/rewards/request')
        .set('Cookie', [`access_token=${userToken}`])
        .send({
          eventId: createdEventId,
          rewardId: createdRewardId,
        })
        .expect(201);

      // Update the status of the second request to failed in DB
      await dbConnection.collection(REWARD_REQUEST_COLLECTION_NAME).updateOne(
        {
          _id: new Types.ObjectId(request2.body.id),
          userId: new Types.ObjectId(userId),
        },
        { $set: { status: 'failed' } },
      );

      const thirdRewardResponse = await request(app.getHttpServer())
        .post(`/events/v1/${createdEventId}/rewards`)
        .set('Cookie', [`access_token=${adminToken}`])
        .send(createRewardDto)
        .expect(201);

      createdRewardId = thirdRewardResponse.body.id;

      // Create another reward request, pending
      const request3 = await request(app.getHttpServer())
        .post('/events/v1/rewards/request')
        .set('Cookie', [`access_token=${userToken}`])
        .send({
          eventId: createdEventId,
          rewardId: createdRewardId,
        })
        .expect(201);

      pendingRewardId = request3.body.id;
    });

    it("should return user's own reward request history", async () => {
      const response = await request(app.getHttpServer())
        .get('/events/v1/rewards/my-history')
        .set('Cookie', [`access_token=${userToken}`])
        .expect(200);

      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.items.length).toBeGreaterThan(2);

      // Check if the response contains the pending reward request
      for (const item of response.body.items) {
        if (item.rewardId === pendingRewardId) {
          expect(item).toHaveProperty('id');
          expect(item).toHaveProperty('userId', userId);
          expect(item).toHaveProperty('eventId', createdEventId);
          expect(item).toHaveProperty('rewardId', pendingRewardId);
          expect(item).toHaveProperty('status');
          expect(item).toHaveProperty('requestedAt');
        }
      }
    });

    it('should filter reward requests by status', async () => {
      // Get all pending requests
      const pendingResponse = await request(app.getHttpServer())
        .get('/events/v1/rewards/my-history')
        .query({ status: 'pending' })
        .set('Cookie', [`access_token=${userToken}`])
        .expect(200);

      expect(Array.isArray(pendingResponse.body.items)).toBe(true);
      pendingResponse.body.items.forEach((request: any) => {
        expect(request.status).toBe('pending');
      });

      // Get all success requests
      const successResponse = await request(app.getHttpServer())
        .get('/events/v1/rewards/my-history')
        .query({ status: 'success' })
        .set('Cookie', [`access_token=${userToken}`])
        .expect(200);

      expect(Array.isArray(successResponse.body.items)).toBe(true);
      successResponse.body.items.forEach((request: any) => {
        expect(request.status).toBe('success');
      });

      // Get all failed requests
      const failedResponse = await request(app.getHttpServer())
        .get('/events/v1/rewards/my-history')
        .query({ status: 'failed' })
        .set('Cookie', [`access_token=${userToken}`])
        .expect(200);

      expect(Array.isArray(failedResponse.body.items)).toBe(true);
      failedResponse.body.items.forEach((request: any) => {
        expect(request.status).toBe('failed');
      });
    });

    it('should return 403 when accessed without proper role', async () => {
      const auditorId = new mongoose.Types.ObjectId().toString();
      const auditorToken = jwt.sign(
        {
          sub: auditorId,
          email: 'auditor@example.com',
          roles: [ROLE.AUDITOR],
        },
        'test-secret',
        { expiresIn: 86400 },
      );

      await request(app.getHttpServer())
        .get('/events/v1/rewards/my-history')
        .set('Cookie', [`access_token=${auditorToken}`])
        .expect(403);
    });
  });

  describe('GET /events/v1/admin/rewards/request/history', () => {
    let createdEventId: string;
    let createdRewardId: string;

    beforeEach(async () => {
      // Create an event and reward for testing
      const createEventDto: CreateGameEventDto = {
        name: 'Test Event for Admin History',
        description: 'Test Description for Admin History',
        startAt: new Date('2024-01-01T00:00:00Z'),
        endAt: new Date('2024-12-31T23:59:59Z'),
        isActive: true,
      };

      const eventResponse = await request(app.getHttpServer())
        .post('/events/v1/admin')
        .set('Cookie', [`access_token=${adminToken}`])
        .send(createEventDto);

      createdEventId = eventResponse.body.id;

      const createRewardDto: CreateRewardDto = {
        type: REWARD_TYPE.POINT,
        name: 'Test Reward',
        description: 'Test Reward Description',
        pointDetails: {
          pointAmount: 1000,
        },
        conditionType: CONDITION_TYPE.LEVEL,
        conditionConfig: {
          operator: 'AND',
          rules: [
            {
              type: 'level',
              params: { minLevel: 1 },
            },
          ],
        },
        conditionsDescription: '레벨 1 이상',
      };

      const rewardResponse = await request(app.getHttpServer())
        .post(`/events/v1/${createdEventId}/rewards`)
        .set('Cookie', [`access_token=${adminToken}`])
        .send(createRewardDto);

      createdRewardId = rewardResponse.body.id;

      // Create reward requests from multiple users with different statuses
      const request1 = await request(app.getHttpServer())
        .post('/events/v1/rewards/request')
        .set('Cookie', [`access_token=${userToken}`])
        .send({
          eventId: createdEventId,
          rewardId: createdRewardId,
        });

      // Update the status of the first request to success in DB
      await dbConnection.collection(REWARD_REQUEST_COLLECTION_NAME).updateOne(
        {
          _id: new Types.ObjectId(request1.body.id),
          userId: new Types.ObjectId(userId),
        },
        { $set: { status: 'success' } },
      );

      const anotherUserId = new mongoose.Types.ObjectId().toString();
      const anotherUserToken = jwt.sign(
        {
          sub: anotherUserId,
          email: 'another@example.com',
          roles: [ROLE.USER],
        },
        'test-secret',
        { expiresIn: 86400 },
      );

      const request2 = await request(app.getHttpServer())
        .post('/events/v1/rewards/request')
        .set('Cookie', [`access_token=${anotherUserToken}`])
        .send({
          eventId: createdEventId,
          rewardId: createdRewardId,
        });

      // Update the status of the second request to failed in DB
      await dbConnection.collection(REWARD_REQUEST_COLLECTION_NAME).updateOne(
        {
          _id: new Types.ObjectId(request2.body.id),
          userId: new Types.ObjectId(anotherUserId),
        },
        { $set: { status: 'failed' } },
      );

      // Add a small delay to ensure DB updates are complete
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it('should return all reward request history for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/events/v1/admin/rewards/request/history')
        .set('Cookie', [`access_token=${adminToken}`])
        .expect(200);

      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.items.length).toBeGreaterThan(1);

      const rewardRequest = response.body.items[0];
      expect(rewardRequest).toHaveProperty('id');
      expect(rewardRequest).toHaveProperty('userId');
      expect(rewardRequest).toHaveProperty('eventId', createdEventId);
      expect(rewardRequest).toHaveProperty('rewardId', createdRewardId);
      expect(rewardRequest).toHaveProperty('status');
      expect(rewardRequest).toHaveProperty('requestedAt');
    });

    it('should filter reward requests by status for admin', async () => {
      // Get all pending requests
      const pendingResponse = await request(app.getHttpServer())
        .get('/events/v1/admin/rewards/request/history')
        .query({ status: 'pending' })
        .set('Cookie', [`access_token=${adminToken}`])
        .expect(200);

      expect(Array.isArray(pendingResponse.body.items)).toBe(true);
      pendingResponse.body.items.forEach((request: any) => {
        expect(request.status).toBe('pending');
      });

      // Get all success requests
      const successResponse = await request(app.getHttpServer())
        .get('/events/v1/admin/rewards/request/history')
        .query({ status: 'success' })
        .set('Cookie', [`access_token=${adminToken}`])
        .expect(200);

      expect(Array.isArray(successResponse.body.items)).toBe(true);
      successResponse.body.items.forEach((request: any) => {
        expect(request.status).toBe('success');
      });

      // Get all failed requests
      const failedResponse = await request(app.getHttpServer())
        .get('/events/v1/admin/rewards/request/history')
        .query({ status: 'failed' })
        .set('Cookie', [`access_token=${adminToken}`])
        .expect(200);

      expect(Array.isArray(failedResponse.body.items)).toBe(true);
      failedResponse.body.items.forEach((request: any) => {
        expect(request.status).toBe('failed');
      });
    });

    it('should return all reward request history for auditor', async () => {
      const auditorId = new mongoose.Types.ObjectId().toString();
      const auditorToken = jwt.sign(
        {
          sub: auditorId,
          email: 'auditor@example.com',
          roles: [ROLE.AUDITOR],
        },
        'test-secret',
        { expiresIn: 86400 },
      );

      const response = await request(app.getHttpServer())
        .get('/events/v1/admin/rewards/request/history')
        .set('Cookie', [`access_token=${auditorToken}`])
        .expect(200);

      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.items.length).toBeGreaterThan(1);
    });

    it('should return 403 when accessed by regular user', async () => {
      await request(app.getHttpServer())
        .get('/events/v1/admin/rewards/request/history')
        .set('Cookie', [`access_token=${userToken}`])
        .expect(403);
    });
  });
});
