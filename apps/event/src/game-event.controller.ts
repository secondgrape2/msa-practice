import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { GameEventService } from './game-event.service';
import { GameEvent } from './domain/game-event.domain';
import { RewardService } from './reward.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { Reward } from './domain/reward.domain';
import { RolesGuard } from '@app/common/auth-core/guards/roles.guard';
import { JwtAuthGuard } from '@app/common/auth-core/guards/jwt-auth.guard';
import { Roles } from '@app/common/auth-core/decorators/roles.decorator';
import { ROLE } from '@app/common/auth-core/constants/role.constants';
import { CreateGameEventDto } from '@app/common/dto/game-event.dto';

@Controller('events/v1')
export class GameEventController {
  constructor(
    private readonly gameEventService: GameEventService,
    private readonly rewardService: RewardService,
  ) {}

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.OPERATOR, ROLE.ADMIN)
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

  @Post('admin/:eventId/rewards')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.OPERATOR, ROLE.ADMIN)
  async addReward(
    @Param('eventId') eventId: string,
    @Body() createRewardDto: CreateRewardDto,
  ): Promise<Reward> {
    try {
      // Verify event exists
      const event = await this.gameEventService.findOne(eventId);
      if (!event) {
        throw new HttpException('Game event not found', HttpStatus.NOT_FOUND);
      }

      // Set eventId from path parameter
      createRewardDto.eventId = eventId;
      return await this.rewardService.create(createRewardDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to add reward to game event',
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
  async findOne(
    @Param('id') id: string,
  ): Promise<GameEvent & { rewards: Reward[] }> {
    try {
      const gameEvent = await this.gameEventService.findOne(id);
      if (!gameEvent) {
        throw new HttpException('Game event not found', HttpStatus.NOT_FOUND);
      }

      // Fetch associated rewards
      const rewards = await this.rewardService.findByEventId(id);

      return {
        ...gameEvent,
        rewards,
      };
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

  @Get('admin/rewards/history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.AUDITOR, ROLE.ADMIN)
  async getRewardHistory(): Promise<Reward[]> {
    try {
      return await this.rewardService.findAll();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch reward history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':eventId/claim')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.USER, ROLE.ADMIN)
  async claimReward(@Param('eventId') eventId: string): Promise<Reward> {
    try {
      const event = await this.gameEventService.findOne(eventId);
      if (!event) {
        throw new HttpException('Game event not found', HttpStatus.NOT_FOUND);
      }

      // TODO: Implement reward claiming logic
      throw new HttpException(
        'Reward claiming not implemented yet',
        HttpStatus.NOT_IMPLEMENTED,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to claim reward',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
