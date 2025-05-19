import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  REWARD_REQUEST_STATUS,
  RewardRequestStatus,
} from '@app/common/event/interfaces/reward.interface';

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
  id: string;

  @ApiProperty({
    description: 'ID of the user requesting the reward',
    example: 'user123',
  })
  userId: string;

  @ApiProperty({
    description: 'ID of the event',
    example: 'event123',
  })
  eventId: string;

  @ApiProperty({
    description: 'ID of the reward (if assigned)',
    example: 'reward123',
    required: false,
  })
  rewardId?: string;

  @ApiProperty({
    description: 'Status of the reward request',
    enum: REWARD_REQUEST_STATUS,
    example: REWARD_REQUEST_STATUS.PENDING,
  })
  status: RewardRequestStatus;

  @ApiProperty({
    description: 'When the reward was requested',
    example: '2024-03-20T12:00:00Z',
  })
  requestedAt: Date;
}
