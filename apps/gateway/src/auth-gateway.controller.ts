import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  HttpStatus,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { Request, Response } from 'express';
import { AxiosError } from 'axios';
import { JwtAuthGuard } from '@app/common/auth-core/guards/jwt-auth.guard';
import { SignUpDto, SignInDto } from '@app/common/auth-core/dtos';

@Controller('api/auth/v1')
export class AuthGatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post('signup/email')
  async register(@Body() signUpDto: SignUpDto) {
    try {
      const { data } = await this.gatewayService.proxyToAuthService(
        '/auth/v1/signup/email',
        'POST',
        signUpDto,
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

  @Post('signin/email')
  async login(
    @Body() signInDto: SignInDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const { data, cookies } = await this.gatewayService.proxyToAuthService(
        '/auth/v1/signin/email',
        'POST',
        signInDto,
        req.headers.cookie,
      );

      if (cookies) {
        res.setHeader('Set-Cookie', cookies);
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

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    try {
      const { data, cookies } = await this.gatewayService.proxyToAuthService(
        '/auth/v1/logout',
        'POST',
        {},
        req.headers.cookie,
      );
      if (cookies) {
        res.setHeader('Set-Cookie', cookies);
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

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const { data, cookies } = await this.gatewayService.proxyToAuthService(
        '/auth/v1/refresh',
        'POST',
        {},
        req.headers.cookie,
      );

      if (cookies) {
        res.setHeader('Set-Cookie', cookies);
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
