import { UnauthorizedException } from '@nestjs/common';
import { User } from '../user.domain';
import { AuthActions } from './auth.actions';
import * as bcrypt from 'bcrypt';

describe('AuthActions', () => {
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    roles: ['user'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('createAccessTokenPayload', () => {
    it('should create access token payload', () => {
      const payload = AuthActions.createAccessTokenPayload(mockUser);
      expect(payload).toEqual({
        sub: mockUser.id,
        email: mockUser.email,
        roles: mockUser.roles,
      });
    });
  });

  describe('createRefreshTokenPayload', () => {
    it('should create refresh token payload', () => {
      const payload = AuthActions.createRefreshTokenPayload(mockUser);
      expect(payload).toEqual({
        sub: mockUser.id,
        type: 'refresh',
      });
    });
  });

  describe('validateRefreshToken', () => {
    it('should not throw for valid refresh token', () => {
      const payload = { sub: '1', type: 'refresh' };
      expect(() => AuthActions.validateRefreshToken(payload)).not.toThrow();
    });

    it('should throw for invalid token type', () => {
      const payload = { sub: '1', type: 'access' };
      expect(() => AuthActions.validateRefreshToken(payload)).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateUserCredentials', () => {
    it('should return user for valid credentials', () => {
      const result = AuthActions.validateUserCredentials(mockUser, true);
      expect(result).toBe(mockUser);
    });

    it('should throw for null user', () => {
      expect(() => AuthActions.validateUserCredentials(null, true)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw for invalid password', () => {
      expect(() =>
        AuthActions.validateUserCredentials(mockUser, false),
      ).toThrow(UnauthorizedException);
    });
  });

  describe('validateUniqueUser', () => {
    it('should not throw for unique user', () => {
      expect(() => AuthActions.validateUniqueUser(null)).not.toThrow();
    });

    it('should throw for existing user', () => {
      expect(() => AuthActions.validateUniqueUser(mockUser)).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('hashPassword', () => {
    it('should hash password', async () => {
      const password = 'testPassword123';
      const hashedPassword = await AuthActions.hashPassword(password);
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.startsWith('$2b$')).toBe(true);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'testPassword123';
      const hash1 = await AuthActions.hashPassword(password);
      const hash2 = await AuthActions.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'testPassword123';
      const hashedPassword = await AuthActions.hashPassword(password);

      const result = await AuthActions.comparePassword(
        password,
        hashedPassword,
      );
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword123';
      const hashedPassword = await AuthActions.hashPassword(password);

      const result = await AuthActions.comparePassword(
        wrongPassword,
        hashedPassword,
      );
      expect(result).toBe(false);
    });
  });
});
