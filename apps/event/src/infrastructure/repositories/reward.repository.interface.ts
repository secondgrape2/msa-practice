import { Reward } from '../../domain/reward.domain';

/**
 * Symbol token for dependency injection of the reward repository
 */
export const REWARD_REPOSITORY = Symbol('REWARD_REPOSITORY');

/**
 * Repository interface for managing reward data
 * Provides methods for CRUD operations and specific queries for rewards
 */
export interface RewardRepository {
  /**
   * Creates a new reward
   * @param data - Partial reward data to create
   * @returns Promise resolving to the created reward
   */
  create(data: Partial<Reward>): Promise<Reward>;

  /**
   * Retrieves all rewards
   * @returns Promise resolving to an array of all rewards
   */
  findAll(): Promise<Reward[]>;

  /**
   * Retrieves a reward by its ID
   * @param id - The unique identifier of the reward
   * @returns Promise resolving to the found reward or null if not found
   */
  findById(id: string): Promise<Reward | null>;

  /**
   * Retrieves all rewards associated with a specific event
   * @param eventId - The unique identifier of the game event
   * @returns Promise resolving to an array of rewards for the specified event
   */
  findByEventId(eventId: string): Promise<Reward[]>;

  /**
   * Updates an existing reward
   * @param id - The unique identifier of the reward to update
   * @param data - Partial reward data containing the updates
   * @returns Promise resolving to the updated reward
   */
  update(id: string, data: Partial<Reward>): Promise<Reward>;

  /**
   * Deletes a reward by its ID
   * @param id - The unique identifier of the reward to delete
   * @returns Promise resolving when the reward is deleted
   */
  delete(id: string): Promise<void>;
}
