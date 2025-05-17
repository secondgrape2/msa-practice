import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RolesGuard } from '@app/common/auth-core/guards/roles.guard';
import { Roles } from '@app/common/auth-core/decorators/roles.decorator';
import { ROLE } from '@app/common/auth-core/constants/role.constants';
import { JwtAuthGuard } from '@app/common/auth-core/guards/jwt-auth.guard';
import { RequestWithUser } from '@app/common/auth-core/interfaces/request.interface';

@Controller('api/events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventGatewayController {
  constructor() {}

  @Post()
  @Roles(ROLE.OPERATOR, ROLE.ADMIN)
  async createEvent(
    @Body() createEventDto: any,
    @Request() req: RequestWithUser,
  ) {
    // TODO: Forward the request to the event service
    console.log(req.user);
    return {
      message: 'Event creation endpoint',
      user: req.user,
    };
  }

  @Get()
  async findEvents(@Request() req: RequestWithUser) {
    // TODO:Forward the request to the event service
    return {
      message: 'Get events endpoint',
      user: req.user,
    };
  }

  @Get(':id')
  async getEvent(@Request() req: RequestWithUser) {
    // TODO: Forward the request to the event service
    return {
      message: 'Get single event endpoint',
      user: req.user,
    };
  }
}
