import bcrypt from 'bcrypt';
import {
  BCRYPT_SALT_ROUNDS,
  TokenPayload,
  User,
} from '../../interfaces/auth.interface';
import {
  InvalidCredentialsException,
  InvalidPasswordFormatException,
  InvalidRefreshTokenException,
  UserAlreadyExistsException,
} from '../../exceptions/auth.exceptions';

export class AuthActions {
  static async validatePasswordFormat(password: string): Promise<void> {
    const validPasswordRegex =
      /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,64}$/;
    if (!password.match(validPasswordRegex)) {
      throw new InvalidPasswordFormatException();
    }
  }

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
      throw new InvalidRefreshTokenException();
    }
  }

  static validateUserCredentials(
    user: User | null,
    isPasswordValid: boolean,
  ): User {
    if (!user || !isPasswordValid) {
      throw new InvalidCredentialsException();
    }
    return user;
  }

  static validateUniqueUser(existingUser: User | null): void {
    if (existingUser) {
      throw new UserAlreadyExistsException();
    }
  }
}
