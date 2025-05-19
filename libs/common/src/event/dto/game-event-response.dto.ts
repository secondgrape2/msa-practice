import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { RewardResponseDto } from './reward-response.dto';

export class GameEventResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Unique identifier of the game event',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Name of the game event',
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: 'Detailed description of the game event',
    example: 'Join our summer festival with special rewards!',
  })
  description: string;

  @Expose()
  @ApiProperty({
    description: 'Start date of the event',
    example: '2024-07-01T00:00:00Z',
  })
  startAt: Date;

  @Expose()
  @ApiProperty({
    description: 'End date of the event',
    example: '2024-07-31T23:59:59Z',
  })
  endAt: Date;

  @Expose()
  @ApiProperty({
    description: 'Whether the event is currently active',
    example: true,
  })
  isActive: boolean;

  @Expose()
  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}

export class GameEventWithRewardsResponseDto extends GameEventResponseDto {
  @Expose()
  @ApiProperty({
    description: 'List of rewards associated with the event',
    type: [RewardResponseDto],
  })
  rewards: RewardResponseDto[];
}
