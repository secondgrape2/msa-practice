import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { REWARD_TYPE, RewardType } from '../constants/reward.constants';
import { RewardDetails } from '../domain/reward.domain';

export class CreateRewardDto {
  @IsNotEmpty()
  @IsString()
  eventId: string;

  @IsNotEmpty()
  @IsEnum(REWARD_TYPE)
  type: RewardType;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @Type(() => Object)
  details?: RewardDetails;
}
