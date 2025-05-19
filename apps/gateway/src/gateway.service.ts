import { SignInDto, SignUpDto } from '@app/common/auth-core/dtos';
import { CreateGameEventDto } from '@app/common/event/dto/game-event.dto';
import { CreateRewardDto } from '@app/common/event/dto/reward.dto';
import { CreateRewardRequestDto } from '@app/common/event/dto/reward-request.dto';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'; // HttpStatus, Logger 추가
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './config';
import { AxiosError } from 'axios'; // AxiosError 타입 import

interface ProxyResponse<T> {
  data: T;
  cookies?: string[];
}

type RequestBody =
  | SignUpDto
  | SignInDto
  | CreateGameEventDto
  | CreateRewardDto
  | CreateRewardRequestDto
  | Record<string, never>;

interface ErrorResponse {
  message?: string;
  [key: string]: any;
}

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);
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

  private handleError(error: any, serviceName: string): never {
    this.logger.error(
      `Error proxying to ${serviceName}: ${error.message}`,
      error.stack,
    );

    if (error instanceof HttpException) {
      throw error;
    }

    if (error.isAxiosError) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const message =
          (axiosError.response.data as ErrorResponse)?.message ||
          axiosError.response.data ||
          'Error from downstream service';
        throw new HttpException(message, axiosError.response.status);
      } else if (axiosError.request) {
        throw new HttpException(
          `No response from ${serviceName}`,
          HttpStatus.SERVICE_UNAVAILABLE, // 또는 BAD_GATEWAY
        );
      } else {
        throw new HttpException(
          `Error setting up request to ${serviceName}: ${axiosError.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    throw new HttpException(
      'An unexpected error occurred in the gateway',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
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
      this.handleError(error, 'AuthService');
    }
  }

  async proxyToEventService<T>(
    path: string,
    method: string,
    body?: RequestBody,
    cookies?: string,
    queryParams?: Record<string, string | undefined>,
  ): Promise<T> {
    try {
      const response = await this.httpService.axiosRef.request({
        method,
        url: `${this.eventServiceUrl}${path}`,
        data: body,
        params: queryParams,
        headers: {
          ...(cookies && { Cookie: cookies }),
        },
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      this.handleError(error, 'EventService');
    }
  }
}
