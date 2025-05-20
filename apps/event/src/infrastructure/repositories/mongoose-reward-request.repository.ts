import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import {
  RewardRequestEntity,
  RewardRequestDocument,
  toRewardRequestDomain,
} from '../../schemas/reward-request.schema';
import {
  RewardRequest,
  RewardRequestRepository,
} from '../../domain/reward-request.domain';
import { HandleMongoClassErrors } from '@app/common/decorators/mongo-error-class.decorator';
import {
  PaginationOptions,
  PaginationResult,
} from '@app/common/interfaces/pagination.interface';
import { RewardRequestStatus } from '../../domain/reward.domain';

@Injectable()
@HandleMongoClassErrors()
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

  async findAll(
    filter: {
      status?: RewardRequestStatus;
    },
    options?: PaginationOptions,
  ): Promise<PaginationResult<RewardRequest>> {
    return this.findWithPagination(filter, options);
  }

  async findById(id: string): Promise<RewardRequest | null> {
    const rewardRequest = await this.rewardRequestModel.findById(id).exec();
    return rewardRequest ? toRewardRequestDomain(rewardRequest) : null;
  }

  private async filterUndefined(
    filter: FilterQuery<RewardRequest>,
  ): Promise<FilterQuery<RewardRequest>> {
    return Object.fromEntries(
      Object.entries(filter).filter(
        ([_, value]) => value !== undefined && value !== null,
      ),
    );
  }

  private async findWithPagination(
    filter: FilterQuery<RewardRequest>,
    options?: PaginationOptions,
  ): Promise<PaginationResult<RewardRequest>> {
    const filteredFilter = await this.filterUndefined(filter);
    const { page = 1, limit = 10 } = options ?? {};
    const skip = (page - 1) * limit;
    const rewardRequests = await this.rewardRequestModel.aggregate([
      {
        $match: filteredFilter,
      },
      {
        $limit: limit,
      },
      {
        $skip: skip,
      },
    ]);
    const total = await this.rewardRequestModel
      .countDocuments(filteredFilter)
      .exec();
    return { items: rewardRequests.map(toRewardRequestDomain), total };
  }

  async findByUserId(userId: string): Promise<RewardRequest[]> {
    const rewardRequests = await this.rewardRequestModel
      .find({ userId })
      .exec();
    return rewardRequests.map(toRewardRequestDomain);
  }

  async findByUserIdWithPagination(
    filter: {
      userId: string;
      status?: RewardRequestStatus;
    },
    options?: PaginationOptions,
  ): Promise<PaginationResult<RewardRequest>> {
    const { userId, status } = filter;
    return this.findWithPagination(
      {
        userId: new Types.ObjectId(userId),
        status,
      },
      options,
    );
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
