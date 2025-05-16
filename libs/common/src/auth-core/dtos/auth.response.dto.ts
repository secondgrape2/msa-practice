import { Exclude, Expose, Type, plainToInstance } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user.response.dto';
import { User } from '../domain/user.domain';

export class AuthResponse<T extends UserResponseDto = UserResponseDto> {
  @Expose()
  @ApiProperty({ type: UserResponseDto })
  @Type(() => UserResponseDto)
  readonly data: T;

  constructor(data: T) {
    this.data = data;
  }
}

export class AuthLoginResponse<
  T extends UserResponseDto = UserResponseDto,
> extends AuthResponse<T> {
  @Expose()
  @ApiProperty({
    type: 'object',
    properties: {
      jwt: { type: 'string' },
      jwtRefresh: { type: 'string' },
    },
  })
  readonly token: {
    jwt: string;
    jwtRefresh: string;
  };

  constructor(data: T, token: { jwt: string; jwtRefresh: string }) {
    super(data);
    this.token = token;
  }
}

export const userToResponseUserDto = (user: User): UserResponseDto => {
  return plainToInstance(UserResponseDto, user, {
    excludeExtraneousValues: true,
  });
};

export const createAuthResponse = (
  user: User,
): AuthResponse<UserResponseDto> => {
  const data = userToResponseUserDto(user);
  return new AuthResponse(data);
};

export const createAuthLoginResponse = (
  user: User,
  token: { jwt: string; jwtRefresh: string },
): AuthLoginResponse<UserResponseDto> => {
  const data = userToResponseUserDto(user);
  return new AuthLoginResponse(data, token);
};
