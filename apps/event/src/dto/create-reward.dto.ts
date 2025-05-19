import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RewardDetails } from '../domain/reward.domain';
import {
  REWARD_TYPE,
  RewardType,
} from '@app/common/event/interfaces/reward.interface';

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
