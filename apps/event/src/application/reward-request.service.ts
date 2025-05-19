import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  REWARD_REQUEST_REPOSITORY,
  RewardRequest,
  RewardRequestRepository,
} from '../domain/reward-request.domain';
import { RewardRequestService } from './interfaces/reward-request.interface';
import { REWARD_REQUEST_STATUS } from '../domain/reward.domain';
import {
  PaginationOptions,
  PaginationResult,
} from '@app/common/interfaces/pagination.interface';

@Injectable()
export class RewardRequestServiceImpl implements RewardRequestService {
  constructor(
    @Inject(REWARD_REQUEST_REPOSITORY)
    private readonly rewardRequestRepository: RewardRequestRepository,
  ) {}

  async createRequest(
    userId: string,
    eventId: string,
    rewardId: string,
  ): Promise<RewardRequest> {
    return this.rewardRequestRepository.create({
      userId,
      eventId,
      rewardId,
      status: REWARD_REQUEST_STATUS.PENDING,
      requestedAt: new Date(),
    });
  }

  async findByUserId(userId: string): Promise<RewardRequest[]> {
    return this.rewardRequestRepository.findByUserId(userId);
  }

  async findByUserIdWithPagination(
    userId: string,
    options?: PaginationOptions,
  ): Promise<PaginationResult<RewardRequest>> {
    return this.rewardRequestRepository.findByUserIdWithPagination(
      userId,
      options,
    );
  }

  async findByEventId(eventId: string): Promise<RewardRequest[]> {
    return this.rewardRequestRepository.findByEventId(eventId);
  }

  async findById(id: string): Promise<RewardRequest> {
    const request = await this.rewardRequestRepository.findById(id);
    if (!request) {
      throw new HttpException(
        '보상 요청을 찾을 수 없습니다',
        HttpStatus.NOT_FOUND,
      );
    }
    return request;
  }

  async findAll(
    options?: PaginationOptions,
  ): Promise<PaginationResult<RewardRequest>> {
    return this.rewardRequestRepository.findAll(options);
  }

  async updateStatus(
    id: string,
    status: (typeof REWARD_REQUEST_STATUS)[keyof typeof REWARD_REQUEST_STATUS],
    options?: {
      rewardId?: string;
      failureReason?: string;
    },
  ): Promise<RewardRequest> {
    const request = await this.findById(id);

    return this.rewardRequestRepository.update(id, {
      status,
      ...(options?.rewardId && { rewardId: options.rewardId }),
      ...(options?.failureReason && { failureReason: options.failureReason }),
      completedAt: new Date(),
    });
  }
}
