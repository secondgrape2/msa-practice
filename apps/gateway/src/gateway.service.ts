import { SignInDto, SignUpDto } from '@app/common/auth-core/dtos';
import { CreateGameEventDto } from '@app/common/event/dto/game-event.dto';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './config';

interface ProxyResponse<T> {
  data: T;
  cookies?: string[];
}

type RequestBody =
  | SignUpDto
  | SignInDto
  | CreateGameEventDto
  | Record<string, never>;

@Injectable()
export class GatewayService {
  private readonly authServiceUrl: string;
  private readonly eventServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {
    const authUrl = this.configService.get('AUTH_SERVICE_URL');
    const eventUrl = this.configService.get('EVENT_SERVICE_URL');

    this.authServiceUrl = authUrl;
    this.eventServiceUrl = eventUrl;
  }

  async proxyToAuthService<T>(
    path: string,
    method: string,
    body?: RequestBody,
    cookies?: string,
  ): Promise<ProxyResponse<T>> {
    try {
      const response = await this.httpService.axiosRef.request({
        method,
        url: `${this.authServiceUrl}${path}`,
        data: body,
        headers: {
          ...(cookies && { Cookie: cookies }),
        },
        withCredentials: true,
      });

      return {
        data: response.data,
        cookies: response.headers['set-cookie'],
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  async proxyToEventService<T>(
    path: string,
    method: string,
    body?: RequestBody,
    cookies?: string,
  ): Promise<T> {
    try {
      const response = await this.httpService.axiosRef.request({
        method,
        url: `${this.eventServiceUrl}${path}`,
        data: body,
        headers: {
          ...(cookies && { Cookie: cookies }),
        },
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }
}
