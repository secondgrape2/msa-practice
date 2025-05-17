import { Injectable, Inject } from '@nestjs/common';
import { CreateGameEventDto } from '@app/common/dto/game-event.dto';
import { GameEvent } from './domain/game-event.domain';
import {
  GameEventRepository,
  GAME_EVENT_REPOSITORY,
} from './infrastructure/repositories/game-event.repository.interface';

@Injectable()
export class GameEventService {
  constructor(
    @Inject(GAME_EVENT_REPOSITORY)
    private readonly gameEventRepository: GameEventRepository,
  ) {}

  async create(createGameEventDto: CreateGameEventDto): Promise<GameEvent> {
    return this.gameEventRepository.create(createGameEventDto);
  }

  async findAll(): Promise<GameEvent[]> {
    return this.gameEventRepository.findAll();
  }

  async findOne(id: string): Promise<GameEvent | null> {
    return this.gameEventRepository.findById(id);
  }

  async findActive(): Promise<GameEvent[]> {
    return this.gameEventRepository.findActive();
  }
}
