import { ROLE } from '@app/common/auth-core/constants/role.constants';
import { Roles } from '@app/common/auth-core/decorators/roles.decorator';
import { JwtAuthGuard } from '@app/common/auth-core/guards/jwt-auth.guard';
import { RolesGuard } from '@app/common/auth-core/guards/roles.guard';
import { AuthenticatedRequest } from '@app/common/auth-core/interfaces/user.interface';
import {
  GameEventResponseDto,
  GameEventWithRewardsResponseDto,
} from '@app/common/event/dto/game-event-response.dto';
import { CreateGameEventDto } from '@app/common/event/dto/game-event.dto';
import { RewardResponseDto } from '@app/common/event/dto/reward-response.dto';
import { CreateRewardDto } from '@app/common/event/dto/reward.dto';
import { RewardRequestResponseDto } from '@app/common/event/dto/reward-request.dto';
import { CreateRewardRequestDto } from '@app/common/event/dto/reward-request.dto';
import { RewardRequestFilterDto } from '@app/common/event/dto/reward-request.dto';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GatewayService } from './gateway.service';
import { PaginationDto } from '@app/common/dto/pagination.dto';

@ApiTags('Events')
@Controller('api/events/v1')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventGatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post()
  @Roles(ROLE.OPERATOR, ROLE.ADMIN)
  @ApiOperation({ summary: 'Create a new game event' })
  @ApiResponse({ status: HttpStatus.CREATED, type: GameEventResponseDto })
  @HttpCode(HttpStatus.CREATED)
  async createEvent(
    @Body() createEventDto: CreateGameEventDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.gatewayService.proxyToEventService<GameEventResponseDto>(
      '/events/v1/admin',
      'POST',
      createEventDto,
      req.headers.cookie,
    );
  }

  @Post(':eventId/rewards')
  @Roles(ROLE.OPERATOR, ROLE.ADMIN)
  @ApiOperation({ summary: 'Add a reward to an event' })
  @ApiResponse({ status: HttpStatus.CREATED, type: RewardResponseDto })
  @ApiParam({
    name: 'eventId',
    type: String,
    description: 'The ID of the event',
  })
  @HttpCode(HttpStatus.CREATED)
  async addReward(
    @Param('eventId') eventId: string,
    @Body() createRewardDto: CreateRewardDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.gatewayService.proxyToEventService<RewardResponseDto>(
      `/events/v1/${eventId}/rewards`,
      'POST',
      createRewardDto,
      req.headers.cookie,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all active game events' })
  @ApiResponse({ status: HttpStatus.OK, type: [GameEventResponseDto] })
  @HttpCode(HttpStatus.OK)
  async findEvents(
    @Req() req: AuthenticatedRequest,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.gatewayService.proxyToEventService<GameEventResponseDto[]>(
      '/events/v1',
      'GET',
      undefined,
      req.headers.cookie,
      {
        page: paginationDto.page?.toString(),
        limit: paginationDto.limit?.toString(),
      },
    );
  }

  @Get('rewards/my-history')
  @Roles(ROLE.USER, ROLE.ADMIN)
  @ApiOperation({ summary: "Get user's own reward request history" })
  @ApiResponse({ status: HttpStatus.OK, type: [RewardRequestResponseDto] })
  @HttpCode(HttpStatus.OK)
  async getMyRewardHistory(
    @Req() req: AuthenticatedRequest,
    @Query() filterDto: RewardRequestFilterDto,
  ) {
    return this.gatewayService.proxyToEventService<RewardRequestResponseDto[]>(
      '/events/v1/rewards/my-history',
      'GET',
      undefined,
      req.headers.cookie,
      {
        page: filterDto.page?.toString(),
        limit: filterDto.limit?.toString(),
        status: filterDto.status,
      },
    );
  }

  @Get('admin/rewards/request/history')
  @Roles(ROLE.AUDITOR, ROLE.ADMIN)
  @ApiOperation({ summary: 'Get all reward request history (Admin only)' })
  @ApiResponse({ status: HttpStatus.OK, type: [RewardRequestResponseDto] })
  @HttpCode(HttpStatus.OK)
  async getRewardHistory(
    @Req() req: AuthenticatedRequest,
    @Query() filterDto: RewardRequestFilterDto,
  ) {
    return this.gatewayService.proxyToEventService<RewardRequestResponseDto[]>(
      '/events/v1/admin/rewards/request/history',
      'GET',
      undefined,
      req.headers.cookie,
      {
        page: filterDto.page?.toString(),
        limit: filterDto.limit?.toString(),
        status: filterDto.status,
      },
    );
  }

  @Get(':eventId')
  @ApiOperation({ summary: 'Get a specific game event with rewards' })
  @ApiResponse({ status: HttpStatus.OK, type: GameEventWithRewardsResponseDto })
  @ApiParam({
    name: 'eventId',
    type: String,
    description: 'The ID of the event',
  })
  @HttpCode(HttpStatus.OK)
  async getEvent(
    @Param('eventId') eventId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.gatewayService.proxyToEventService<GameEventWithRewardsResponseDto>(
      `/events/v1/${eventId}`,
      'GET',
      undefined,
      req.headers.cookie,
    );
  }

  @Post('rewards/request')
  @Roles(ROLE.USER, ROLE.ADMIN)
  @ApiOperation({ summary: 'Request a reward for an event' })
  @ApiResponse({ status: HttpStatus.CREATED, type: RewardRequestResponseDto })
  @HttpCode(HttpStatus.CREATED)
  async requestReward(
    @Body() createRewardRequestDto: CreateRewardRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.gatewayService.proxyToEventService<RewardRequestResponseDto>(
      '/events/v1/rewards/request',
      'POST',
      createRewardRequestDto,
      req.headers.cookie,
    );
  }
}
