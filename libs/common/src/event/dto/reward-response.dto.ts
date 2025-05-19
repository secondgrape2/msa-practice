import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  CouponRewardDetailsDto,
  ItemRewardDetailsDto,
  PointRewardDetailsDto,
  RewardTypeDto,
} from './reward.dto';
import { ConditionTypeDto } from './reward.dto';
import { ConditionConfigDto } from './condition.dto';

export class RewardResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Unique identifier of the reward',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'ID of the associated game event',
  })
  eventId: string;

  @Expose()
  @ApiProperty({
    description: 'Type of the reward',
    type: RewardTypeDto,
  })
  type: string;

  @Expose()
  @ApiProperty({
    description: 'Name of the reward',
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: 'Description of the reward',
    required: false,
  })
  description?: string;

  @Expose()
  @ApiProperty({
    description: 'Number of times this reward can be claimed',
  })
  quantity: number;

  @Expose()
  @ApiProperty({
    description: 'Type-specific details of the reward',
    required: false,
  })
  pointDetails?: PointRewardDetailsDto;

  @Expose()
  @ApiProperty({
    description: 'Type-specific details of the reward',
    required: false,
  })
  itemDetails?: ItemRewardDetailsDto;

  @Expose()
  @ApiProperty({
    description: 'Type-specific details of the reward',
    required: false,
  })
  couponDetails?: CouponRewardDetailsDto;

  @Expose()
  @ApiProperty({
    description: 'Type of the condition',
    type: ConditionTypeDto,
  })
  conditionType: string;

  @Expose()
  @ApiProperty({
    description: 'Configuration for the reward conditions',
    type: ConditionConfigDto,
  })
  conditionConfig: ConditionConfigDto;

  @Expose()
  @ApiProperty({
    description: 'Description of the conditions for the reward',
  })
  conditionsDescription: string;

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
