import { CreateGameEventDto } from '@app/common/event/dto/game-event.dto';
import { CreateRewardDto } from '@app/common/event/dto/reward.dto';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { GameEvent } from '../domain/game-event.domain';
import { RewardRequest } from '../domain/reward-request.domain';
import { Reward } from '../domain/reward.domain';
import {
  GAME_EVENT_SERVICE,
  GameEventService,
} from './interfaces/game-event.interface';
import { REWARD_SERVICE, RewardService } from './interfaces/reward.interface';
import {
  REWARD_REQUEST_SERVICE,
  RewardRequestService,
} from './interfaces/reward-request.interface';

@Injectable()
export class GameEventManagementService {
  constructor(
    @Inject(GAME_EVENT_SERVICE)
    private readonly gameEventService: GameEventService,
    @Inject(REWARD_SERVICE)
    private readonly rewardService: RewardService,
    @Inject(REWARD_REQUEST_SERVICE)
    private readonly rewardRequestService: RewardRequestService,
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
  ): Promise<RewardRequest> {
    // Check if event exists and is active
    const event = await this.gameEventService.findOne(eventId);
    if (!event) {
      throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
    }
    if (!event.isActive) {
      throw new HttpException('Event is not active', HttpStatus.BAD_REQUEST);
    }

    // Create reward request through the service
    return this.rewardRequestService.createRequest(userId, eventId);
  }

  async findRewardRequestsByUserId(userId: string): Promise<RewardRequest[]> {
    return this.rewardRequestService.findByUserId(userId);
  }

  async findRewardRequestsByEventId(eventId: string): Promise<RewardRequest[]> {
    return this.rewardRequestService.findByEventId(eventId);
  }

  async claimReward(eventId: string, userId: string): Promise<Reward> {
    const event = await this.gameEventService.findOne(eventId);
    if (!event) {
      throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
    }

    const rewards = await this.rewardService.findByEventId(eventId);
    if (rewards.length === 0) {
      throw new HttpException('No rewards available', HttpStatus.NOT_FOUND);
    }

    // TODO: Implement reward claiming logic
    // This would typically involve:
    // 1. Checking if the user is eligible for the reward
    // 2. Selecting the appropriate reward
    // 3. Marking the reward as claimed
    // 4. Returning the claimed reward

    throw new HttpException('Not implemented', HttpStatus.NOT_IMPLEMENTED);
  }
}
