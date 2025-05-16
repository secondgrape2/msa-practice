import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { SignUpDto, SignInDto } from '@app/common/auth-core/dtos';

interface ProxyResponse<T> {
  data: T;
  cookies?: string[];
}

type RequestBody = SignUpDto | SignInDto | Record<string, never>;

@Injectable()
export class GatewayService {
  private readonly authServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const url = this.configService.get('AUTH_SERVICE_URL');
    if (!url) {
      throw new Error('AUTH_SERVICE_URL is not defined');
    }
    this.authServiceUrl = url;
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
}
