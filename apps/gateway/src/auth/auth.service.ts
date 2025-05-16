import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { EnvironmentVariables } from '../config';

@Injectable()
export class AuthService {
  private readonly authServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {
    this.authServiceUrl = this.configService.get('AUTH_SERVICE_URL');
  }

  async validateToken(token: string): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/auth/validate`, {
          headers: {
            Cookie: `access_token=${token}`,
          },
        }),
      );
      return data;
    } catch (error) {
      return null;
    }
  }
}
