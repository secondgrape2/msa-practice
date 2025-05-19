import { RewardRequest } from '../../domain/reward-request.domain';

export const REWARD_REQUEST_SERVICE = Symbol('REWARD_REQUEST_SERVICE');

export interface RewardRequestService {
  createRequest(userId: string, eventId: string): Promise<RewardRequest>;
  findByUserId(userId: string): Promise<RewardRequest[]>;
  findByEventId(eventId: string): Promise<RewardRequest[]>;
}
