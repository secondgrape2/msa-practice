import {
  Controller,
  Post,
  Body,
  Req,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { Request } from 'express';
import { AxiosError } from 'axios';

@Controller('api/auth/v1')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post('register')
  async register(@Body() body: any) {
    try {
      const data = await this.gatewayService.proxyToAuthService(
        '/auth/v1/register',
        'POST',
        body,
      );
      return {
        statusCode: HttpStatus.CREATED,
        data,
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new HttpException(
          {
            message: error.response?.data?.message || 'Internal server error',
          },
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        { message: 'Internal server error' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('login')
  async login(@Body() body: any, @Req() req: Request) {
    try {
      const data = await this.gatewayService.proxyToAuthService(
        '/auth/v1/login',
        'POST',
        body,
      );

      // Auth 서비스에서 설정한 쿠키를 그대로 전달
      const cookies = req.headers['set-cookie'];
      if (cookies) {
        req.res?.setHeader('Set-Cookie', cookies);
      }

      return {
        statusCode: HttpStatus.OK,
        data,
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new HttpException(
          {
            message: error.response?.data?.message || 'Internal server error',
          },
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        { message: 'Internal server error' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
