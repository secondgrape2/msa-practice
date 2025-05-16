import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

@Controller('/auth/health')
export class HealthController {
  @Get()
  @HttpCode(HttpStatus.OK)
  check() {
    return {
      status: 'ok',
      service: 'auth',
      timestamp: new Date().toISOString(),
    };
  }
}
