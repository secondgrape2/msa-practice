import { ROLE } from '@app/common/auth-core/constants/role.constants';
import { Roles } from '@app/common/auth-core/decorators/roles.decorator';
import { JwtAuthGuard } from '@app/common/auth-core/guards/jwt-auth.guard';
import { RolesGuard } from '@app/common/auth-core/guards/roles.guard';
import {
  GameEventResponseDto,
  GameEventWithRewardsResponseDto,
} from '@app/common/dto/game-event-response.dto';
import { CreateGameEventDto } from '@app/common/dto/game-event.dto';
import { RewardResponseDto } from '@app/common/dto/reward-response.dto';
import { CreateRewardDto } from '@app/common/dto/reward.dto';
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { GameEventManagementService } from './application/game-event-management.service';
import {
  GAME_EVENT_SERVICE,
  GameEventService,
} from './application/interfaces/game-event.interface';
import {
  REWARD_SERVICE,
  RewardService,
} from './application/interfaces/reward.interface';

@Controller('events/v1')
export class GameEventController {
  constructor(
    @Inject(GAME_EVENT_SERVICE)
    private readonly gameEventService: GameEventService,
    @Inject(REWARD_SERVICE)
    private readonly rewardService: RewardService,
    private readonly gameEventManagementService: GameEventManagementService,
  ) {}

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.OPERATOR, ROLE.ADMIN)
  async create(
    @Body() createGameEventDto: CreateGameEventDto,
  ): Promise<GameEventResponseDto> {
    const event = await this.gameEventService.create(createGameEventDto);
    return plainToInstance(GameEventResponseDto, event, {
      excludeExtraneousValues: true,
    });
  }

  @Post('admin/:eventId/rewards')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.OPERATOR, ROLE.ADMIN)
  async addReward(
    @Param('eventId') eventId: string,
    @Body() createRewardDto: CreateRewardDto,
  ): Promise<RewardResponseDto> {
    const reward = await this.gameEventManagementService.addRewardToEvent(
      eventId,
      createRewardDto,
    );
    return plainToInstance(RewardResponseDto, reward, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  async findAll(): Promise<GameEventResponseDto[]> {
    const events = await this.gameEventService.findAll();
    return plainToInstance(GameEventResponseDto, events, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<GameEventWithRewardsResponseDto> {
    const eventWithRewards =
      await this.gameEventManagementService.getEventWithRewards(id);
    return plainToInstance(GameEventWithRewardsResponseDto, eventWithRewards, {
      excludeExtraneousValues: true,
    });
  }

  @Get('active/current')
  async findActive(): Promise<GameEventResponseDto[]> {
    const events = await this.gameEventService.findActive();
    return plainToInstance(GameEventResponseDto, events, {
      excludeExtraneousValues: true,
    });
  }

  @Get('admin/rewards/history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.AUDITOR, ROLE.ADMIN)
  async getRewardHistory(): Promise<RewardResponseDto[]> {
    const rewards = await this.rewardService.findAll();
    return plainToInstance(RewardResponseDto, rewards, {
      excludeExtraneousValues: true,
    });
  }

  @Post(':eventId/claim')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.USER, ROLE.ADMIN)
  async claimReward(
    @Param('eventId') eventId: string,
    @Body('userId') userId: string,
  ): Promise<RewardResponseDto> {
    const reward = await this.gameEventManagementService.claimReward(
      eventId,
      userId,
    );
    return plainToInstance(RewardResponseDto, reward, {
      excludeExtraneousValues: true,
    });
  }
}
