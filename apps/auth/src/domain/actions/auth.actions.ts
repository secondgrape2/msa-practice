import { UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import {
  BCRYPT_SALT_ROUNDS,
  TokenPayload,
  User,
} from '../../interfaces/auth.interface';

export class AuthActions {
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
}
