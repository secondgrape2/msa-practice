import { REWARD_REQUEST_STATUS } from '@app/common/event/interfaces/reward.interface';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  REWARD_REQUEST_REPOSITORY,
  RewardRequest,
  RewardRequestRepository,
} from '../domain/reward-request.domain';
import { RewardRequestService } from './interfaces/reward-request.interface';

@Injectable()
export class RewardRequestServiceImpl implements RewardRequestService {
  constructor(
    @Inject(REWARD_REQUEST_REPOSITORY)
    private readonly rewardRequestRepository: RewardRequestRepository,
  ) {}

  async createRequest(userId: string, eventId: string): Promise<RewardRequest> {
    // Check for duplicate requests
    const existingRequests =
      await this.rewardRequestRepository.findByUserId(userId);
    const hasExistingRequest = existingRequests.some(
      (request) =>
        request.eventId === eventId &&
        (request.status === REWARD_REQUEST_STATUS.PENDING ||
          request.status === REWARD_REQUEST_STATUS.SUCCESS),
    );

    if (hasExistingRequest) {
      throw new HttpException(
        'Reward request already exists for this event',
        HttpStatus.CONFLICT,
      );
    }

    // Create new request
    return this.rewardRequestRepository.create({
      userId,
      eventId,
      status: REWARD_REQUEST_STATUS.PENDING,
      requestedAt: new Date(),
    });
  }

  async findByUserId(userId: string): Promise<RewardRequest[]> {
    return this.rewardRequestRepository.findByUserId(userId);
  }

  async findByEventId(eventId: string): Promise<RewardRequest[]> {
    return this.rewardRequestRepository.findByEventId(eventId);
  }
}
