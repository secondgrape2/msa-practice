import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { REWARD_TYPE, RewardType } from '../constants/reward.constants';

export class RewardResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Unique identifier of the reward',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'ID of the game event this reward belongs to',
  })
  eventId: string;

  @Expose()
  @ApiProperty({
    description: 'Type of the reward',
    enum: REWARD_TYPE,
  })
  type: RewardType;

  @Expose()
  @ApiProperty({
    description: 'Amount or quantity of the reward',
    example: 100,
    minimum: 0,
  })
  amount: number;

  @Expose()
  @ApiProperty({
    description: 'Detailed description of the reward',
    example: 'Special summer festival item',
  })
  description: string;
}
