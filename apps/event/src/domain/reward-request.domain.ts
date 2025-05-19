import { RewardRequestStatus } from '@app/common/event/interfaces/reward.interface';

export interface RewardRequest {
  id: string;
  userId: string;
  eventId: string;
  rewardId?: string;
  status: RewardRequestStatus;
  requestedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RewardRequestRepository {
  create(data: Partial<RewardRequest>): Promise<RewardRequest>;
  findAll(): Promise<RewardRequest[]>;
  findById(id: string): Promise<RewardRequest | null>;
  findByUserId(userId: string): Promise<RewardRequest[]>;
  findByEventId(eventId: string): Promise<RewardRequest[]>;
  update(id: string, data: Partial<RewardRequest>): Promise<RewardRequest>;
  delete(id: string): Promise<void>;
}

export const REWARD_REQUEST_REPOSITORY = Symbol('REWARD_REQUEST_REPOSITORY');
