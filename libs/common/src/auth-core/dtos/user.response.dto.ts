import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: 'user123',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
  })
  email: string;

  @Expose()
  @ApiProperty({
    description: 'List of roles assigned to the user',
    type: [String],
    example: ['user', 'admin'],
  })
  roles: string[];

  @Expose()
  @ApiProperty({
    description: 'Creation timestamp of the user account',
    example: '2024-03-20T12:00:00Z',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: 'Last update timestamp of the user account',
    example: '2024-03-20T12:00:00Z',
  })
  updatedAt: Date;
}
