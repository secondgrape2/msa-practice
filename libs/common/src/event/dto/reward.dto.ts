import { Type } from 'class-transformer';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsDate,
  Min,
  IsObject,
  IsNotEmpty,
} from 'class-validator';
import { ConditionConfigDto } from './condition.dto';

/**
 * DTO for point reward details
 */
export class PointRewardDetailsDto {
  @IsNumber()
  @Min(0)
  pointAmount: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiryDate?: Date;
}

/**
 * DTO for item reward details
 */
export class ItemRewardDetailsDto {
  @IsString()
  itemId: string;

  @IsString()
  itemName: string;

  @IsNumber()
  @Min(1)
  itemQuantity: number;
}

/**
 * DTO for coupon reward details
 */
export class CouponRewardDetailsDto {
  @IsString()
  couponCode: string;

  @IsNumber()
  @Min(0)
  discountAmount: number;

  @IsEnum(['percentage', 'fixed'])
  discountType: 'percentage' | 'fixed';

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiryDate?: Date;
}

/**
 * DTO for reward type
 */
export class RewardTypeDto {
  @IsString()
  type: string;
}

/**
 * DTO for condition type
 */
export class ConditionTypeDto {
  @IsString()
  type: string;
}

/**
 * DTO for creating a new reward
 */
export class CreateRewardDto {
  @IsEnum(['point', 'item', 'coupon'])
  @IsNotEmpty()
  type: 'point' | 'item' | 'coupon';

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => PointRewardDetailsDto)
  pointDetails?: PointRewardDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ItemRewardDetailsDto)
  itemDetails?: ItemRewardDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CouponRewardDetailsDto)
  couponDetails?: CouponRewardDetailsDto;

  @IsEnum(['level', 'login_streak'])
  conditionType: 'level' | 'login_streak';

  @ValidateNested()
  @Type(() => ConditionConfigDto)
  conditionConfig: ConditionConfigDto;

  @IsString()
  @IsNotEmpty()
  conditionsDescription: string;
}
