import { RewardRequestStatus } from './reward.domain';
import { PaginationOptions } from '@app/common/interfaces/pagination.interface';
import { PaginationResult } from '@app/common/interfaces/pagination.interface';

export interface RewardRequest {
  id: string;
  userId: string;
  eventId: string;
  rewardId: string;
  status: RewardRequestStatus;
  failureReason?: string;
  completedAt?: Date;
  requestedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RewardRequestRepository {
  create(
    data: Omit<RewardRequest, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<RewardRequest>;
  findByUserId(userId: string): Promise<RewardRequest[]>;
  findByUserIdWithPagination(
    userId: string,
    options?: PaginationOptions,
  ): Promise<PaginationResult<RewardRequest>>;
  findByEventId(eventId: string): Promise<RewardRequest[]>;
  findById(id: string): Promise<RewardRequest | null>;
  findAll(
    options?: PaginationOptions,
  ): Promise<PaginationResult<RewardRequest>>;
  update(id: string, data: Partial<RewardRequest>): Promise<RewardRequest>;
}

export const REWARD_REQUEST_REPOSITORY = Symbol('REWARD_REQUEST_REPOSITORY');
