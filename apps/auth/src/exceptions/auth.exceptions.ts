import { HttpStatus } from '@nestjs/common';
import { BaseHttpException } from '@app/common';
import { CommonErrorCodes } from '@app/common/constants/error-codes.enum';

export class InvalidPasswordFormatException extends BaseHttpException {
  constructor() {
    super(
      'Invalid password format',
      HttpStatus.BAD_REQUEST,
      CommonErrorCodes.InvalidPasswordFormat.toString(),
    );
  }
}
export class InvalidCredentialsException extends BaseHttpException {
  constructor() {
    super(
      'Invalid credentials',
      HttpStatus.UNAUTHORIZED,
      CommonErrorCodes.UserInvalidPassword.toString(),
    );
  }
}

export class UserAlreadyExistsException extends BaseHttpException {
  constructor() {
    super(
      'User already exists',
      HttpStatus.CONFLICT,
      CommonErrorCodes.UserAlreadyExists.toString(),
    );
  }
}

export class InvalidRefreshTokenException extends BaseHttpException {
  constructor() {
    super(
      'Invalid refresh token',
      HttpStatus.UNAUTHORIZED,
      CommonErrorCodes.InvalidRefreshToken.toString(),
    );
  }
}

export class UserNotFoundException extends BaseHttpException {
  constructor() {
    super(
      'User not found',
      HttpStatus.UNPROCESSABLE_ENTITY,
      CommonErrorCodes.UserNotFound.toString(),
    );
  }
}
