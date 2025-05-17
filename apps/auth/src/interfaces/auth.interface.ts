import { Role } from '@app/common/auth-core/constants/role.constants';

/**
 * @description Represents a user entity in the system
 */
export interface User {
  /** @description Unique identifier for the user */
  id: string;
  /** @description User's email address */
  email: string;
  /** @description Hashed password */
  password: string;
  /** @description Array of role strings assigned to the user */
  roles: Role[];
  /** @description Timestamp when the user was created */
  createdAt: Date;
  /** @description Timestamp when the user was last updated */
  updatedAt: Date;
  /** @description Timestamp when the user was last logged in */
  lastLoginAt?: Date;
}

/**
 * @description Data transfer object for user registration
 */
export interface SignUpDto {
  /** @description User's email address */
  email: string;
  /** @description User's password (will be hashed) */
  password: string;
}

/**
 * @description Data transfer object for user login
 */
export interface SignInDto {
  /** @description User's email address */
  email: string;
  /** @description User's password */
  password: string;
}

/**
 * @description Service interface for authentication operations
 */
export interface AuthService {
  /** @description Register a new user */
  signUp(signUpDto: SignUpDto): Promise<User>;
  /** @description Authenticate a user and return tokens */
  signIn(signInDto: SignInDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: User;
  }>;
  /** @description Validate user credentials */
  validateUser(email: string, password: string): Promise<User>;
  /** @description Generate new access token using refresh token */
  refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; user: User }>;
}

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
  roles?: Role[];
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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  roles?: Role[];
}

export interface AuthResponse {
  id: string;
  email: string;
  roles: Role[];
  accessToken: string;
}
