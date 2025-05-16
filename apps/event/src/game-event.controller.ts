import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GameEventService } from './game-event.service';
import { CreateGameEventDto } from './dto/create-game-event.dto';
import { GameEvent } from './domain/game-event.domain';

@Controller('events/v1')
export class GameEventController {
  constructor(private readonly gameEventService: GameEventService) {}

  @Post()
  async create(
    @Body() createGameEventDto: CreateGameEventDto,
  ): Promise<GameEvent> {
    try {
      return await this.gameEventService.create(createGameEventDto);
    } catch (error) {
      throw new HttpException(
        'Failed to create game event',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll(): Promise<GameEvent[]> {
    try {
      return await this.gameEventService.findAll();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch game events',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<GameEvent> {
    try {
      const gameEvent = await this.gameEventService.findOne(id);
      if (!gameEvent) {
        throw new HttpException('Game event not found', HttpStatus.NOT_FOUND);
      }
      return gameEvent;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch game event',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('active/current')
  async findActive(): Promise<GameEvent[]> {
    try {
      return await this.gameEventService.findActive();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch active game events',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
