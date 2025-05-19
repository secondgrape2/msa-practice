import { Injectable, Inject } from '@nestjs/common';
import { CreateRewardDto } from '@app/common/event/dto/reward.dto';
import { Reward } from './domain/reward.domain';
import {
  RewardRepository,
  REWARD_REPOSITORY,
} from './infrastructure/repositories/reward.repository.interface';
import { RewardService } from './application/interfaces/reward.interface';

/**
 * Service for managing rewards
 * Handles business logic for reward operations
 */
@Injectable()
export class RewardServiceImpl implements RewardService {
  constructor(
    @Inject(REWARD_REPOSITORY)
    private readonly rewardRepository: RewardRepository,
  ) {}

  /**
   * Creates a new reward
   * @param createRewardDto - Data for creating the reward
   * @returns Promise resolving to the created reward
   */
  async create(createRewardDto: CreateRewardDto): Promise<Reward> {
    return this.rewardRepository.create(createRewardDto);
  }

  /**
   * Retrieves all rewards
   * @returns Promise resolving to an array of all rewards
   */
  async findAll(): Promise<Reward[]> {
    return this.rewardRepository.findAll();
  }

  /**
   * Retrieves a reward by its ID
   * @param id - The unique identifier of the reward
   * @returns Promise resolving to the found reward or null if not found
   */
  async findOne(id: string): Promise<Reward | null> {
    return this.rewardRepository.findById(id);
  }

  /**
   * Retrieves all rewards for a specific event
   * @param eventId - The unique identifier of the game event
   * @returns Promise resolving to an array of rewards for the specified event
   */
  async findByEventId(eventId: string): Promise<Reward[]> {
    return this.rewardRepository.findByEventId(eventId);
  }

  /**
   * Updates an existing reward
   * @param id - The unique identifier of the reward to update
   * @param updateRewardDto - Data containing the updates
   * @returns Promise resolving to the updated reward
   */
  async update(id: string, updateRewardDto: Partial<Reward>): Promise<Reward> {
    return this.rewardRepository.update(id, updateRewardDto);
  }

  /**
   * Deletes a reward
   * @param id - The unique identifier of the reward to delete
   * @returns Promise resolving when the reward is deleted
   */
  async remove(id: string): Promise<void> {
    return this.rewardRepository.delete(id);
  }

  async findById(id: string): Promise<Reward | null> {
    return this.rewardRepository.findById(id);
  }
}
