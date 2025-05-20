import { User } from '../../interfaces/auth.interface';
import { AuthActions } from './auth.actions';
import { ROLE } from '@app/common/auth-core/constants/role.constants';
import {
  InvalidRefreshTokenException,
  InvalidCredentialsException,
  UserAlreadyExistsException,
  InvalidPasswordFormatException,
} from '../../exceptions/auth.exceptions';

describe('AuthActions', () => {
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    roles: [ROLE.USER],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
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
        InvalidRefreshTokenException,
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
        InvalidCredentialsException,
      );
    });

    it('should throw for invalid password', () => {
      expect(() =>
        AuthActions.validateUserCredentials(mockUser, false),
      ).toThrow(InvalidCredentialsException);
    });
  });

  describe('validateUniqueUser', () => {
    it('should not throw for unique user', () => {
      expect(() => AuthActions.validateUniqueUser(null)).not.toThrow();
    });

    it('should throw for existing user', () => {
      expect(() => AuthActions.validateUniqueUser(mockUser)).toThrow(
        UserAlreadyExistsException,
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

  describe('validatePasswordFormat', () => {
    it('should not throw for valid password format', async () => {
      const validPasswords = [
        'Password123!',
        'Test1234@',
        'Abc12345#',
        'ValidPass1$',
      ];

      for (const password of validPasswords) {
        await expect(
          AuthActions.validatePasswordFormat(password),
        ).resolves.not.toThrow();
      }
    });

    it('should throw for password without special character', async () => {
      const invalidPassword = 'Password123';
      await expect(
        AuthActions.validatePasswordFormat(invalidPassword),
      ).rejects.toThrow(InvalidPasswordFormatException);
    });

    it('should throw for password without letter', async () => {
      const invalidPassword = '12345678!';
      await expect(
        AuthActions.validatePasswordFormat(invalidPassword),
      ).rejects.toThrow(InvalidPasswordFormatException);
    });

    it('should throw for password shorter than 8 characters', async () => {
      const invalidPassword = 'Pass1!';
      await expect(
        AuthActions.validatePasswordFormat(invalidPassword),
      ).rejects.toThrow(InvalidPasswordFormatException);
    });

    it('should throw for password longer than 64 characters', async () => {
      const invalidPassword = 'P'.repeat(65) + '1!';
      await expect(
        AuthActions.validatePasswordFormat(invalidPassword),
      ).rejects.toThrow(InvalidPasswordFormatException);
    });
  });
});
