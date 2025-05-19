import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RewardRequestEntity,
  RewardRequestDocument,
  toRewardRequestDomain,
} from '../../schemas/reward-request.schema';
import {
  RewardRequest,
  RewardRequestRepository,
} from '../../domain/reward-request.domain';

@Injectable()
export class MongooseRewardRequestRepository
  implements RewardRequestRepository
{
  constructor(
    @InjectModel(RewardRequestEntity.name)
    private readonly rewardRequestModel: Model<RewardRequestDocument>,
  ) {}

  async create(data: Partial<RewardRequest>): Promise<RewardRequest> {
    const rewardRequest = await this.rewardRequestModel.create(data);
    return toRewardRequestDomain(rewardRequest);
  }

  async findAll(): Promise<RewardRequest[]> {
    const rewardRequests = await this.rewardRequestModel.find().exec();
    return rewardRequests.map(toRewardRequestDomain);
  }

  async findById(id: string): Promise<RewardRequest | null> {
    const rewardRequest = await this.rewardRequestModel.findById(id).exec();
    return rewardRequest ? toRewardRequestDomain(rewardRequest) : null;
  }

  async findByUserId(userId: string): Promise<RewardRequest[]> {
    const rewardRequests = await this.rewardRequestModel
      .find({ userId })
      .exec();
    return rewardRequests.map(toRewardRequestDomain);
  }

  async findByEventId(eventId: string): Promise<RewardRequest[]> {
    const rewardRequests = await this.rewardRequestModel
      .find({ eventId })
      .exec();
    return rewardRequests.map(toRewardRequestDomain);
  }

  async update(
    id: string,
    data: Partial<RewardRequest>,
  ): Promise<RewardRequest> {
    const rewardRequest = await this.rewardRequestModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!rewardRequest) {
      throw new Error('Reward request not found');
    }
    return toRewardRequestDomain(rewardRequest);
  }

  async delete(id: string): Promise<void> {
    await this.rewardRequestModel.findByIdAndDelete(id).exec();
  }
}
