import { Test, TestingModule } from '@nestjs/testing';
import { GameEventController } from './game-event.controller';
import { JwtAuthGuard } from '@app/common/auth-core/guards/jwt-auth.guard';
import { RolesGuard } from '@app/common/auth-core/guards/roles.guard';
import { ROLE } from '@app/common/auth-core/constants/role.constants';
import { GameEventService } from './application/interfaces/game-event.interface';
import {
  REWARD_SERVICE,
  RewardService,
} from './application/interfaces/reward.interface';
import { GAME_EVENT_SERVICE } from './application/interfaces/game-event.interface';
import {
  GameEventManagementService,
  USER_STATE_SERVICE,
} from './application/game-event-management.service';
import {
  REWARD_REQUEST_SERVICE,
  RewardRequestService,
} from './application/interfaces/reward-request.interface';
import { UserStateService } from './domain/user-state.domain';

describe('GameEventController', () => {
  let controller: GameEventController;
  let mockGameEventService: jest.Mocked<GameEventService>;
  let mockRewardService: jest.Mocked<RewardService>;
  let mockRewardRequestService: jest.Mocked<RewardRequestService>;
  let mockUserStateService: jest.Mocked<UserStateService>;
  beforeEach(async () => {
    mockGameEventService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findActive: jest.fn(),
    } as any;

    mockRewardService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByEventId: jest.fn(),
    } as any;

    mockRewardRequestService = {
      createRequest: jest.fn(),
      findByUserId: jest.fn(),
      findByEventId: jest.fn(),
    } as any;

    mockUserStateService = {
      getUserState: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameEventController],
      providers: [
        {
          provide: GAME_EVENT_SERVICE,
          useValue: mockGameEventService,
        },
        {
          provide: REWARD_SERVICE,
          useValue: mockRewardService,
        },
        {
          provide: REWARD_REQUEST_SERVICE,
          useValue: mockRewardRequestService,
        },
        {
          provide: USER_STATE_SERVICE,
          useValue: mockUserStateService,
        },
        GameEventManagementService,
      ],
    }).compile();

    controller = module.get<GameEventController>(GameEventController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Guards', () => {
    it('should not have guards applied to the controller', () => {
      const guards = Reflect.getMetadata('__guards__', GameEventController);
      expect(guards).toBeUndefined();
    });

    it('should have guards and correct roles for create event endpoint', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        GameEventController.prototype.create,
      );
      const roles = Reflect.getMetadata(
        'roles',
        GameEventController.prototype.create,
      );
      expect(guards).toContain(JwtAuthGuard);
      expect(guards).toContain(RolesGuard);
      expect(roles).toEqual([ROLE.OPERATOR, ROLE.ADMIN]);
    });

    it('should have guards and correct roles for add reward endpoint', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        GameEventController.prototype.addReward,
      );
      const roles = Reflect.getMetadata(
        'roles',
        GameEventController.prototype.addReward,
      );
      expect(guards).toContain(JwtAuthGuard);
      expect(guards).toContain(RolesGuard);
      expect(roles).toEqual([ROLE.OPERATOR, ROLE.ADMIN]);
    });

    it('should have guards and correct roles for get reward history endpoint', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        GameEventController.prototype.getRewardHistory,
      );
      const roles = Reflect.getMetadata(
        'roles',
        GameEventController.prototype.getRewardHistory,
      );
      expect(guards).toContain(JwtAuthGuard);
      expect(guards).toContain(RolesGuard);
      expect(roles).toEqual([ROLE.AUDITOR, ROLE.ADMIN]);
    });

    it('should have guards and correct roles for claim reward endpoint', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        GameEventController.prototype.requestReward,
      );
      const roles = Reflect.getMetadata(
        'roles',
        GameEventController.prototype.requestReward,
      );
      expect(guards).toContain(JwtAuthGuard);
      expect(guards).toContain(RolesGuard);
      expect(roles).toEqual([ROLE.USER, ROLE.ADMIN]);
    });

    it('should have no guards for findAll endpoint', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        GameEventController.prototype.findAll,
      );
      expect(guards).toBeUndefined();
    });

    it('should have no guards for findOne endpoint', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        GameEventController.prototype.findOne,
      );
      expect(guards).toBeUndefined();
    });

    it('should have no guards for findActive endpoint', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        GameEventController.prototype.findActive,
      );
      expect(guards).toBeUndefined();
    });
  });
});
