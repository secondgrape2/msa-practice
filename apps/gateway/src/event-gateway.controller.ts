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
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GatewayService } from './gateway.service';

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
