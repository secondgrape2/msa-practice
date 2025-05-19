import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
} from 'class-validator';
import {
  REWARD_TYPE,
  RewardType,
} from '@app/common/event/interfaces/reward.interface';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRewardDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Type of the reward',
    enum: REWARD_TYPE,
    example: REWARD_TYPE.ITEM,
    required: true,
  })
  @IsEnum(REWARD_TYPE)
  @IsNotEmpty()
  type: RewardType;

  @ApiProperty({
    description: 'Amount or quantity of the reward',
    example: 100,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({
    description: 'Description of the reward',
    example: 'Special summer festival item',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
