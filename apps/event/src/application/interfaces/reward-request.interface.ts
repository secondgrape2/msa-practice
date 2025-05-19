import {
  PaginationOptions,
  PaginationResult,
} from '@app/common/interfaces/pagination.interface';
import { RewardRequest } from '../../domain/reward-request.domain';
import { REWARD_REQUEST_STATUS } from '../../domain/reward.domain';

export const REWARD_REQUEST_SERVICE = 'REWARD_REQUEST_SERVICE';

export interface RewardRequestService {
  createRequest(
    userId: string,
    eventId: string,
    rewardId: string,
  ): Promise<RewardRequest>;
  findByUserId(userId: string): Promise<RewardRequest[]>;
  findByUserIdWithPagination(
    userId: string,
    options?: PaginationOptions,
  ): Promise<PaginationResult<RewardRequest>>;
  findByEventId(eventId: string): Promise<RewardRequest[]>;
  findById(id: string): Promise<RewardRequest>;
  findAll(
    options?: PaginationOptions,
  ): Promise<PaginationResult<RewardRequest>>;
  updateStatus(
    id: string,
    status: (typeof REWARD_REQUEST_STATUS)[keyof typeof REWARD_REQUEST_STATUS],
    options?: {
      rewardId?: string;
      failureReason?: string;
    },
  ): Promise<RewardRequest>;
}
