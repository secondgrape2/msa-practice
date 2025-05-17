import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { REWARD_TYPE, RewardType } from '../constants/reward.constants';

export class CreateRewardDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(REWARD_TYPE)
  @IsNotEmpty()
  type: RewardType;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsOptional()
  eventId?: string;
}
