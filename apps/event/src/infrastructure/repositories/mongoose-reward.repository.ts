import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RewardEntity,
  RewardDocument,
  toRewardDomain,
} from '../../schemas/reward.schema';
import { RewardRepository } from './reward.repository.interface';
import { Reward } from '../../domain/reward.domain';
import { HandleMongoClassErrors } from '@app/common/decorators/mongo-error-class.decorator';

@Injectable()
@HandleMongoClassErrors()
export class MongooseRewardRepository implements RewardRepository {
  constructor(
    @InjectModel(RewardEntity.name)
    private readonly rewardModel: Model<RewardDocument>,
  ) {}

  async create(data: Partial<Reward>): Promise<Reward> {
    const reward = await this.rewardModel.create(data);
    return toRewardDomain(reward);
  }

  async findAll(): Promise<Reward[]> {
    const rewards = await this.rewardModel.find().exec();
    return rewards.map(toRewardDomain);
  }

  async findById(id: string): Promise<Reward | null> {
    const reward = await this.rewardModel.findById(id).exec();
    return reward ? toRewardDomain(reward) : null;
  }

  async findByEventId(eventId: string): Promise<Reward[]> {
    const rewards = await this.rewardModel.find({ eventId }).exec();
    return rewards.map(toRewardDomain);
  }

  async update(id: string, data: Partial<Reward>): Promise<Reward> {
    const reward = await this.rewardModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!reward) {
      throw new Error('Reward not found');
    }
    return toRewardDomain(reward);
  }

  async delete(id: string): Promise<void> {
    await this.rewardModel.findByIdAndDelete(id).exec();
  }
}
