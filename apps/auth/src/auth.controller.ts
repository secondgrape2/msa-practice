import {
  Controller,
  Post,
  Body,
  Req,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Inject,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './interfaces/auth.interface';
import { SignUpDto, SignInDto } from '@app/common/auth-core/dtos';
import { AuthCookieInterceptor } from './interceptors/auth-cookie.interceptor';
import { COOKIE_NAMES, removeCookieOption } from './constants/cookie.constants';
import { AUTH_SERVICE } from './constants/auth.constants';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  AuthResponse,
  AuthLoginResponse,
  createAuthResponse,
  createAuthLoginResponse,
} from '@app/common/auth-core/dtos/auth.response.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '@app/common/auth-core/guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth/v1')
export class AuthController {
  private readonly origin: string | undefined;
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.origin = this.configService.get('API_SERVER_ORIGIN', { infer: true });
  }

  @Post('signup/email')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(AuthCookieInterceptor)
  @ApiOperation({ summary: 'Sign up with email' })
  @ApiResponse({ status: HttpStatus.CREATED, type: AuthResponse })
  async signUp(@Body() signUpDto: SignUpDto) {
    const user = await this.authService.signUp(signUpDto);
    const { accessToken, refreshToken } = await this.authService.signIn({
      email: signUpDto.email,
      password: signUpDto.password,
    });
    return createAuthLoginResponse(user, {
      jwt: accessToken,
      jwtRefresh: refreshToken,
    });
  }

  @Post('signin/email')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(AuthCookieInterceptor)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiResponse({ status: HttpStatus.OK, type: AuthLoginResponse })
  async signIn(@Body() signInDto: SignInDto) {
    const { user, accessToken, refreshToken } =
      await this.authService.signIn(signInDto);
    return createAuthLoginResponse(user, {
      jwt: accessToken,
      jwtRefresh: refreshToken,
    });
  }

  // @Post('refresh')
  // @HttpCode(HttpStatus.OK)
  // @UseInterceptors(AuthCookieInterceptor)
  // @ApiOperation({ summary: 'Refresh access token' })
  // @ApiResponse({ status: HttpStatus.OK, type: AuthLoginResponse })
  // async refresh(@Req() req: Request) {
  //   const cookies = req;
  //   console.log(`cookies: ${JSON.stringify(cookies)}`);
  //   const refresh_token = cookies[COOKIE_NAMES.refreshToken];
  //   if (!refresh_token) {
  //     throw new UnauthorizedException('Refresh token not found');
  //   }

  //   console.log(`refresh_token: ${refresh_token}`);

  //   const { access_token, user } =
  //     await this.authService.refreshToken(refresh_token);
  //   return createAuthLoginResponse(user, {
  //     jwt: access_token,
  //     jwtRefresh: refresh_token,
  //   });
  // }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log out' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully logged out',
  })
  async logOut(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_NAMES.accessToken, removeCookieOption(this.origin));
    res.clearCookie(COOKIE_NAMES.refreshToken, removeCookieOption(this.origin));

    res.status(HttpStatus.OK).json({ message: 'Successfully logged out' });
  }
}
