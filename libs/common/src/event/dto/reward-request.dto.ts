import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CreateRewardRequestDto {
  @ApiProperty({
    description: 'ID of the event to request reward for',
    example: 'event123',
  })
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({
    description: 'ID of the reward to request',
    example: 'reward123',
  })
  @IsString()
  @IsNotEmpty()
  rewardId: string;
}

export class RewardRequestResponseDto {
  @ApiProperty({
    description: 'ID of the reward request',
    example: 'request123',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'ID of the user requesting the reward',
    example: 'user123',
  })
  @Expose()
  userId: string;

  @ApiProperty({
    description: 'ID of the event',
    example: 'event123',
  })
  @Expose()
  eventId: string;

  @ApiProperty({
    description: 'ID of the reward (if assigned)',
    example: 'reward123',
    required: false,
  })
  @Expose()
  rewardId?: string;

  @ApiProperty({
    description: 'Status of the reward request',
    enum: ['pending', 'success', 'failed', 'claimed'],
    example: 'pending',
  })
  @Expose()
  status: 'pending' | 'success' | 'failed' | 'claimed';

  @ApiProperty({
    description: 'When the reward was requested',
    example: '2024-03-20T12:00:00Z',
  })
  @Expose()
  requestedAt: Date;
}
