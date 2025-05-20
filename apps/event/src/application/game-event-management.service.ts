import { CreateGameEventDto } from '@app/common/event/dto/game-event.dto';
import { CreateRewardDto } from '@app/common/event/dto/reward.dto';
import { Inject, Injectable } from '@nestjs/common';
import { GameEvent } from '../domain/game-event.domain';
import { RewardRequest } from '../domain/reward-request.domain';
import {
  Reward,
  REWARD_REQUEST_STATUS,
  RewardRequestStatus,
} from '../domain/reward.domain';
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
import {
  PaginationOptions,
  PaginationResult,
} from '@app/common/interfaces/pagination.interface';
import {
  EventNotFoundException,
  RewardNotFoundException,
  InvalidRewardEventException,
  RewardConditionNotMetException,
  DuplicateRewardRequestException,
  RewardAlreadyReceivedException,
  RewardRequestUpdateFailedException,
} from '../event.exceptions';

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
      throw new EventNotFoundException();
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
      throw new EventNotFoundException();
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
    const event = await this.gameEventService.findOne(eventId);
    if (!event) {
      throw new EventNotFoundException();
    }

    // Check if reward exists and belongs to the event
    const reward = await this.rewardService.findById(rewardId);
    if (!reward) {
      throw new RewardNotFoundException();
    }
    if (reward.eventId !== eventId) {
      throw new InvalidRewardEventException();
    }

    // Check if user meets reward conditions
    const userState = await this.userStateService.getUserState(userId);

    const meetsConditions = ConditionChecker.checkCondition(
      reward.conditionConfig,
      userState,
    );
    if (!meetsConditions) {
      throw new RewardConditionNotMetException();
    }

    // Check for existing requests
    const existingRequests =
      await this.rewardRequestService.findByUserId(userId);
    const existingRequest = existingRequests.find(
      (request) => request.eventId === eventId && request.rewardId === rewardId,
    );

    if (existingRequest) {
      // If there's a pending request, throw an error
      if (existingRequest.status === REWARD_REQUEST_STATUS.PENDING) {
        throw new DuplicateRewardRequestException();
      }

      // If there's a successful request, throw an error
      if (existingRequest.status === REWARD_REQUEST_STATUS.SUCCESS) {
        throw new RewardAlreadyReceivedException();
      }

      // If there's a failed request, update it to pending
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
      throw new RewardRequestUpdateFailedException();
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

  async findRewardRequestsByUserId(
    filter: {
      userId: string;
      status?: RewardRequestStatus;
    },
    options?: PaginationOptions,
  ): Promise<PaginationResult<RewardRequest>> {
    return this.rewardRequestService.findByUserIdWithPagination(
      filter,
      options,
    );
  }

  async findRewardRequestsByEventId(eventId: string): Promise<RewardRequest[]> {
    return this.rewardRequestService.findByEventId(eventId);
  }

  async findAllRewardRequests(
    filter: {
      status?: RewardRequestStatus;
    },
    options?: PaginationOptions,
  ): Promise<PaginationResult<RewardRequest>> {
    return this.rewardRequestService.findAll(filter, options);
  }
}
