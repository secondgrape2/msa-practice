import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RolesGuard } from '@app/common/auth-core/guards/roles.guard';
import { Roles } from '@app/common/auth-core/decorators/roles.decorator';
import { ROLE } from '@app/common/auth-core/constants/role.constants';
import { JwtAuthGuard } from '@app/common/auth-core/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateGameEventDto } from '@app/common/event/dto/game-event.dto';
import {
  GameEventResponseDto,
  GameEventWithRewardsResponseDto,
} from '@app/common/event/dto/game-event-response.dto';
import { GatewayService } from './gateway.service';
import { AuthenticatedUser } from '@app/common/auth-core/interfaces/user.interface';
import { ReqUser } from '@app/common/auth-core/decorators/req-user.decorator';
import { AuthenticatedRequest } from '@app/common/auth-core/interfaces/user.interface';

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
    @ReqUser() user: AuthenticatedUser,
  ) {
    return this.gatewayService.proxyToEventService<GameEventResponseDto>(
      '/events/v1/admin',
      'POST',
      createEventDto,
      req.headers.cookie,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all game events' })
  @ApiResponse({ status: HttpStatus.OK, type: [GameEventResponseDto] })
  @HttpCode(HttpStatus.OK)
  async findEvents(@Req() req: AuthenticatedRequest) {
    return this.gatewayService.proxyToEventService<GameEventResponseDto[]>(
      '/events/v1',
      'GET',
      undefined,
      req.headers.cookie,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific game event with rewards' })
  @ApiResponse({ status: HttpStatus.OK, type: GameEventWithRewardsResponseDto })
  @HttpCode(HttpStatus.OK)
  async getEvent(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.gatewayService.proxyToEventService<GameEventWithRewardsResponseDto>(
      `/events/v1/${id}`,
      'GET',
      undefined,
      req.headers.cookie,
    );
  }
}
