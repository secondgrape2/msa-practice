import { RewardRequest } from '../../domain/reward-request.domain';
import { REWARD_REQUEST_STATUS } from '@app/common/event/interfaces/reward.interface';

export const REWARD_REQUEST_SERVICE = 'REWARD_REQUEST_SERVICE';

export interface RewardRequestService {
  createRequest(
    userId: string,
    eventId: string,
    rewardId: string,
  ): Promise<RewardRequest>;
  findByUserId(userId: string): Promise<RewardRequest[]>;
  findByEventId(eventId: string): Promise<RewardRequest[]>;
  findById(id: string): Promise<RewardRequest>;
  updateStatus(
    id: string,
    status: (typeof REWARD_REQUEST_STATUS)[keyof typeof REWARD_REQUEST_STATUS],
    options?: {
      rewardId?: string;
      failureReason?: string;
    },
  ): Promise<RewardRequest>;
}
