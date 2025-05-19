import { Injectable, Inject } from '@nestjs/common';
import { CreateGameEventDto } from '@app/common/event/dto/game-event.dto';
import { GameEvent } from './domain/game-event.domain';
import {
  GameEventRepository,
  GAME_EVENT_REPOSITORY,
} from './infrastructure/repositories/game-event.repository.interface';
import { GameEventService } from './application/interfaces/game-event.interface';
import {
  PaginationOptions,
  PaginationResult,
} from '@app/common/interfaces/pagination.interface';

@Injectable()
export class GameEventServiceImpl implements GameEventService {
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

  async findActiveWithPagination(
    options: PaginationOptions,
  ): Promise<PaginationResult<GameEvent>> {
    return this.gameEventRepository.findActive(options);
  }
}
