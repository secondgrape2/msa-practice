import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';

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

  async proxyToAuthService(
    path: string,
    method: string,
    body?: any,
    headers?: any,
  ) {
    try {
      const response = await this.httpService.axiosRef.request({
        method,
        url: `${this.authServiceUrl}${path}`,
        data: body,
        headers,
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
