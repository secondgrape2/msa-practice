import { CreateGameEventDto } from '@app/common/event/dto/game-event.dto';
import { CreateRewardDto } from '@app/common/event/dto/reward.dto';
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import cookieParser from 'cookie-parser';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Types } from 'mongoose';
import request from 'supertest';
import { ROLE } from '@app/common/auth-core/constants/role.constants';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { REWARD_TYPE } from '../src/domain/reward.domain';
import { CONDITION_TYPE } from '../src/domain/reward.domain';

describe('GameEventController (Integration)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let dbConnection: Connection;
  let adminToken: string;
  let userToken: string;
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
    adminToken = jwt.sign(
      {
        sub: 'admin-id',
        email: 'admin@example.com',
        roles: [ROLE.ADMIN],
      },
      JWT_SECRET,
      { expiresIn: 86400 },
    );

    userToken = jwt.sign(
      {
        sub: 'user-id',
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
        quantity: 1,
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
        quantity: 1,
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
        quantity: 1,
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
        quantity: 1,
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
        quantity: 1,
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

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      const event = response.body[0];
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

    beforeEach(async () => {
      // Create an event and reward for testing
      const createEventDto: CreateGameEventDto = {
        name: 'Test Event for History',
        description: 'Test Description for History',
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
        quantity: 1,
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

      // Create a reward request
      const rewardRequestResponse = await request(app.getHttpServer())
        .post('/events/v1/rewards/request')
        .set('Cookie', [`access_token=${userToken}`])
        .send({
          eventId: createdEventId,
          rewardId: createdRewardId,
        })
        .expect(201);
    });

    it("should return user's own reward request history", async () => {
      const response = await request(app.getHttpServer())
        .get('/events/v1/rewards/my-history')
        .set('Cookie', [`access_token=${userToken}`])
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const rewardRequest = response.body[0];
      expect(rewardRequest).toHaveProperty('id');
      expect(rewardRequest).toHaveProperty('userId', 'user-id');
      expect(rewardRequest).toHaveProperty('eventId', createdEventId);
      expect(rewardRequest).toHaveProperty('rewardId', createdRewardId);
      expect(rewardRequest).toHaveProperty('status');
      expect(rewardRequest).toHaveProperty('requestedAt');
    });

    it('should return 403 when accessed without proper role', async () => {
      const auditorToken = jwt.sign(
        {
          sub: 'auditor-id',
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
        quantity: 1,
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

      // Create reward requests from multiple users
      await request(app.getHttpServer())
        .post('/events/v1/rewards/request')
        .set('Cookie', [`access_token=${userToken}`])
        .send({
          eventId: createdEventId,
          rewardId: createdRewardId,
        });

      const anotherUserToken = jwt.sign(
        {
          sub: 'another-user-id',
          email: 'another@example.com',
          roles: [ROLE.USER],
        },
        'test-secret',
        { expiresIn: 86400 },
      );

      await request(app.getHttpServer())
        .post('/events/v1/rewards/request')
        .set('Cookie', [`access_token=${anotherUserToken}`])
        .send({
          eventId: createdEventId,
          rewardId: createdRewardId,
        });
    });

    it('should return all reward request history for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/events/v1/admin/rewards/request/history')
        .set('Cookie', [`access_token=${adminToken}`])
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(1);

      const rewardRequest = response.body[0];
      expect(rewardRequest).toHaveProperty('id');
      expect(rewardRequest).toHaveProperty('userId');
      expect(rewardRequest).toHaveProperty('eventId', createdEventId);
      expect(rewardRequest).toHaveProperty('rewardId', createdRewardId);
      expect(rewardRequest).toHaveProperty('status');
      expect(rewardRequest).toHaveProperty('requestedAt');
    });

    it('should return all reward request history for auditor', async () => {
      const auditorToken = jwt.sign(
        {
          sub: 'auditor-id',
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

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(1);
    });

    it('should return 403 when accessed by regular user', async () => {
      await request(app.getHttpServer())
        .get('/events/v1/admin/rewards/request/history')
        .set('Cookie', [`access_token=${userToken}`])
        .expect(403);
    });
  });
});
