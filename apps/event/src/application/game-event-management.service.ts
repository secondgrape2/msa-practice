import { CreateGameEventDto } from '@app/common/event/dto/game-event.dto';
import { CreateRewardDto } from '@app/common/event/dto/reward.dto';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { GameEvent } from '../domain/game-event.domain';
import { RewardRequest } from '../domain/reward-request.domain';
import { Reward } from '../domain/reward.domain';
import { ConditionChecker } from '../domain/condition-checker';
import { UserStateService } from '../domain/user-state.domain';
import {
  GAME_EVENT_SERVICE,
  GameEventService,
} from './interfaces/game-event.interface';
import { REWARD_SERVICE, RewardService } from './interfaces/reward.interface';
import {
  REWARD_REQUEST_SERVICE,
  RewardRequestService,
} from './interfaces/reward-request.interface';
import { REWARD_REQUEST_STATUS } from '@app/common/event/interfaces/reward.interface';

export const USER_STATE_SERVICE = 'USER_STATE_SERVICE';

@Injectable()
export class GameEventManagementService {
  constructor(
    @Inject(GAME_EVENT_SERVICE)
    private readonly gameEventService: GameEventService,
    @Inject(REWARD_SERVICE)
    private readonly rewardService: RewardService,
    @Inject(REWARD_REQUEST_SERVICE)
    private readonly rewardRequestService: RewardRequestService,
    @Inject(USER_STATE_SERVICE)
    private readonly userStateService: UserStateService,
  ) {}

  async createEventWithReward(
    createGameEventDto: CreateGameEventDto,
    createRewardDto: CreateRewardDto,
  ): Promise<GameEvent> {
    const event = await this.gameEventService.create(createGameEventDto);
    await this.rewardService.create({
      ...createRewardDto,
      eventId: event.id,
    });
    return event;
  }

  async getEventWithRewards(
    id: string,
  ): Promise<GameEvent & { rewards: Reward[] }> {
    const event = await this.gameEventService.findOne(id);
    if (!event) {
      throw new HttpException(
        'Event not found',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const rewards = await this.rewardService.findByEventId(id);
    return { ...event, rewards };
  }

  async addRewardToEvent(
    eventId: string,
    createRewardDto: CreateRewardDto,
  ): Promise<Reward> {
    const event = await this.gameEventService.findOne(eventId);
    if (!event) {
      throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
    }

    return this.rewardService.create({
      ...createRewardDto,
      eventId,
    });
  }

  async createRewardRequest(
    userId: string,
    eventId: string,
    rewardId: string,
  ): Promise<RewardRequest> {
    const userState = await this.userStateService.getUserState(userId);
    const event = await this.gameEventService.findOne(eventId);
    if (!event) {
      throw new HttpException(
        'Event not found',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const meetsConditions = ConditionChecker.checkCondition(
      event.conditionConfig,
      userState,
    );
    if (!meetsConditions) {
      throw new HttpException(
        'User does not meet the event conditions',
        HttpStatus.FORBIDDEN,
      );
    }

    const existingRequests =
      await this.rewardRequestService.findByUserId(userId);
    const existingRequest = existingRequests.find(
      (request) => request.eventId === eventId,
    );

    if (existingRequest) {
      if (existingRequest.status === REWARD_REQUEST_STATUS.PENDING) {
        throw new HttpException(
          'Already a request in progress',
          HttpStatus.CONFLICT,
        );
      }

      if (existingRequest.status === REWARD_REQUEST_STATUS.SUCCESS) {
        throw new HttpException('Already received reward', HttpStatus.CONFLICT);
      }

      if (existingRequest.status === REWARD_REQUEST_STATUS.FAILED) {
        return this.rewardRequestService.updateStatus(
          existingRequest.id,
          REWARD_REQUEST_STATUS.PENDING,
        );
      }
    }

    // Create new request
    return this.rewardRequestService.createRequest(userId, eventId, rewardId);
  }

  async processRewardRequest(
    requestId: string,
    success: boolean,
    options?: {
      rewardId?: string;
      failureReason?: string;
    },
  ): Promise<RewardRequest> {
    const request = await this.rewardRequestService.findById(requestId);

    if (request.status !== REWARD_REQUEST_STATUS.PENDING) {
      throw new HttpException(
        'Only pending reward requests can be updated',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newStatus = success
      ? REWARD_REQUEST_STATUS.SUCCESS
      : REWARD_REQUEST_STATUS.FAILED;

    return this.rewardRequestService.updateStatus(
      requestId,
      newStatus,
      options,
    );
  }

  async findRewardRequestsByUserId(userId: string): Promise<RewardRequest[]> {
    return this.rewardRequestService.findByUserId(userId);
  }

  async findRewardRequestsByEventId(eventId: string): Promise<RewardRequest[]> {
    return this.rewardRequestService.findByEventId(eventId);
  }
}
