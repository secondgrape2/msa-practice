import { Reward } from '../../domain/reward.domain';
import { CreateRewardDto } from '@app/common/event/dto/reward.dto';

/**
 * @description Service interface for managing rewards.
 */
export const REWARD_SERVICE = Symbol('REWARD_SERVICE');

/**
 * @description Interface defining the contract for reward operations.
 */
export interface RewardService {
  /**
   * @description Creates a new reward.
   * @param createRewardDto - Data for creating the reward
   * @returns Promise resolving to the created Reward
   */
  create(createRewardDto: Partial<Reward>): Promise<Reward>;

  /**
   * @description Retrieves all rewards.
   * @returns Promise resolving to an array of Reward
   */
  findAll(): Promise<Reward[]>;

  /**
   * @description Retrieves all rewards for a specific event.
   * @param eventId - The unique identifier of the game event
   * @returns Promise resolving to an array of rewards for the specified event
   */
  findByEventId(eventId: string): Promise<Reward[]>;

  findById(id: string): Promise<Reward | null>;

  update(id: string, data: Partial<Reward>): Promise<Reward>;
}
