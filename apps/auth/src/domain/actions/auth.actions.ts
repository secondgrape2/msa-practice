import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../user.domain';
import bcrypt from 'bcrypt';

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
  roles: string[];
}

export interface RefreshTokenPayload {
  sub: string;
  type: TokenType.REFRESH;
}

export type TokenPayload = {
  sub: string;
  email?: string;
  roles?: string[];
  type?: string;
};

export type TokenResult = {
  token: string;
  expiresIn: string;
};

export type AuthResult = {
  user: User;
  access_token: string;
  refresh_token: string;
};

export const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class AuthActions {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  static async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static createAccessTokenPayload(user: User): TokenPayload {
    return {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };
  }

  static createRefreshTokenPayload(user: User): TokenPayload {
    return {
      sub: user.id,
      type: 'refresh',
    };
  }

  static validateRefreshToken(payload: TokenPayload): void {
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  static validateUserCredentials(
    user: User | null,
    isPasswordValid: boolean,
  ): User {
    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  static validateUniqueUser(existingUser: User | null): void {
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }
  }

  getJwtToken(user: User, tokenType: TokenType): string {
    const payload =
      tokenType === TokenType.ACCESS
        ? AuthActions.createAccessTokenPayload(user)
        : AuthActions.createRefreshTokenPayload(user);

    const secret = this.configService.get<string>(
      tokenType === TokenType.ACCESS
        ? 'JWT_ACCESS_TOKEN_SECRET'
        : 'JWT_REFRESH_TOKEN_SECRET',
    );

    const expirationTime = this.configService.get<string>(
      tokenType === TokenType.ACCESS
        ? 'JWT_ACCESS_TOKEN_EXPIRATION_TIME'
        : 'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
    );

    if (!secret || !expirationTime) {
      throw new Error(`Missing JWT configuration for ${tokenType} token`);
    }

    return this.jwtService.sign(payload, {
      secret,
      expiresIn: Number(expirationTime) / 1000,
    });
  }

  async generateTokens(
    user: User,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(AuthActions.createAccessTokenPayload(user), {
        expiresIn: '15m',
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      }),
      this.jwtService.signAsync(AuthActions.createRefreshTokenPayload(user), {
        expiresIn: '7d',
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      }),
    ]);

    return { access_token, refresh_token };
  }
}
