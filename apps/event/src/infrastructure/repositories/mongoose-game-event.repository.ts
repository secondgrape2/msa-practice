import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  GameEventEntity,
  GameEventDocument,
  toGameEventDomain,
} from '../../schemas/game-event.schema';
import { GameEventRepository } from './game-event.repository.interface';
import { GameEvent } from '../../domain/game-event.domain';
import { HandleMongoClassErrors } from '@app/common/decorators/mongo-error-class.decorator';
import {
  PaginationOptions,
  PaginationResult,
} from '@app/common/interfaces/pagination.interface';

@Injectable()
@HandleMongoClassErrors()
export class MongooseGameEventRepository implements GameEventRepository {
  constructor(
    @InjectModel(GameEventEntity.name)
    private readonly gameEventModel: Model<GameEventDocument>,
  ) {}

  async create(data: Partial<GameEvent>): Promise<GameEvent> {
    const gameEvent = await this.gameEventModel.create(data);
    return toGameEventDomain(gameEvent);
  }

  async findAll(): Promise<GameEvent[]> {
    const gameEvents = await this.gameEventModel.find().exec();
    return gameEvents.map(toGameEventDomain);
  }

  async findById(id: string): Promise<GameEvent | null> {
    const gameEvent = await this.gameEventModel.findById(id).exec();
    return gameEvent ? toGameEventDomain(gameEvent) : null;
  }

  private async findWithPagination(
    filter: FilterQuery<GameEvent>,
    options: PaginationOptions,
  ): Promise<PaginationResult<GameEvent>> {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const gameEvents = await this.gameEventModel.aggregate([
      {
        $match: filter,
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);
    const total = await this.gameEventModel.countDocuments(filter).exec();
    return { items: gameEvents.map(toGameEventDomain), total };
  }

  async findActive(
    options: PaginationOptions,
  ): Promise<PaginationResult<GameEvent>> {
    const { page, limit } = options;
    const now = new Date();
    return this.findWithPagination(
      {
        isActive: true,
        startAt: { $lte: now },
        endAt: { $gte: now },
      },
      options,
    );
  }

  async update(id: string, data: Partial<GameEvent>): Promise<GameEvent> {
    const gameEvent = await this.gameEventModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!gameEvent) {
      throw new Error('Game event not found');
    }
    return toGameEventDomain(gameEvent);
  }

  async delete(id: string): Promise<void> {
    await this.gameEventModel.findByIdAndDelete(id).exec();
  }
}
