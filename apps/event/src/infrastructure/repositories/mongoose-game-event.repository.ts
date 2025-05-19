import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  GameEventEntity,
  GameEventDocument,
  toGameEventDomain,
} from '../../schemas/game-event.schema';
import { GameEventRepository } from './game-event.repository.interface';
import { GameEvent } from '../../domain/game-event.domain';
import { HandleMongoClassErrors } from '@app/common/decorators/mongo-error-class.decorator';

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

  async findActive(): Promise<GameEvent[]> {
    const now = new Date();
    const gameEvents = await this.gameEventModel
      .find({
        isActive: true,
        startAt: { $lte: now },
        endAt: { $gte: now },
      })
      .exec();
    return gameEvents.map(toGameEventDomain);
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
