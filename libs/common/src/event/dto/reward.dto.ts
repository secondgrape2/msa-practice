import { Expose, Type } from 'class-transformer';
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
  Validate,
} from 'class-validator';
import { ConditionConfigDto } from './condition.dto';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for point reward details
 */
export class PointRewardDetailsDto {
  @ApiProperty({
    description: 'Amount of points to be rewarded',
    example: 1000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Expose()
  pointAmount: number;

  @ApiProperty({
    description: 'Expiry date of the points',
    example: '2024-12-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @Expose()
  expiryDate?: Date;
}

/**
 * DTO for item reward details
 */
export class ItemRewardDetailsDto {
  @ApiProperty({
    description: 'Unique identifier of the item',
    example: 'item_123',
  })
  @IsString()
  @Expose()
  itemId: string;

  @ApiProperty({
    description: 'Name of the item',
    example: 'Premium Sword',
  })
  @IsString()
  @Expose()
  itemName: string;

  @ApiProperty({
    description: 'Quantity of the item to be rewarded',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @Expose()
  itemQuantity: number;
}

/**
 * DTO for coupon reward details
 */
export class CouponRewardDetailsDto {
  @ApiProperty({
    description: 'Unique code for the coupon',
    example: 'SUMMER2024',
  })
  @IsString()
  @Expose()
  couponCode: string;

  @ApiProperty({
    description: 'Amount of discount',
    example: 20,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Expose()
  discountAmount: number;

  @ApiProperty({
    description: 'Type of discount (percentage or fixed amount)',
    enum: ['percentage', 'fixed'],
    example: 'percentage',
  })
  @IsEnum(['percentage', 'fixed'])
  @Expose()
  discountType: 'percentage' | 'fixed';

  @ApiProperty({
    description: 'Expiry date of the coupon',
    example: '2024-12-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @Expose()
  expiryDate?: Date;
}

/**
 * DTO for reward type
 */
export class RewardTypeDto {
  @ApiProperty({
    description: 'Type of the reward',
    example: 'point',
  })
  @IsString()
  @Expose()
  type: string;
}

/**
 * DTO for condition type
 */
export class ConditionTypeDto {
  @ApiProperty({
    description: 'Type of the condition',
    example: 'level',
  })
  @IsString()
  @Expose()
  type: string;
}

/**
 * DTO for creating a new reward
 */
export class CreateRewardDto {
  @ApiProperty({
    description: 'Type of the reward',
    enum: ['point', 'item', 'coupon'],
    example: 'point',
  })
  @IsEnum(['point', 'item', 'coupon'])
  @IsNotEmpty()
  @Expose()
  type: 'point' | 'item' | 'coupon';

  @ApiProperty({
    description: 'Name of the reward',
    example: 'Summer Festival Points',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Detailed description of the reward',
    example: 'Get 1000 points for participating in the summer festival',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Expose()
  description?: string;

  @ApiProperty({
    description: 'Details for point type reward',
    type: PointRewardDetailsDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PointRewardDetailsDto)
  @Expose()
  pointDetails?: PointRewardDetailsDto;

  @ApiProperty({
    description: 'Details for item type reward',
    type: ItemRewardDetailsDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ItemRewardDetailsDto)
  @Expose()
  itemDetails?: ItemRewardDetailsDto;

  @ApiProperty({
    description: 'Details for coupon type reward',
    type: CouponRewardDetailsDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CouponRewardDetailsDto)
  @Expose()
  couponDetails?: CouponRewardDetailsDto;

  @ApiProperty({
    description: 'Type of condition for the reward',
    enum: ['level', 'login_streak'],
    example: 'level',
  })
  @IsEnum(['level', 'login_streak'])
  @Expose()
  conditionType: 'level' | 'login_streak';

  @ApiProperty({
    description: 'Configuration for the condition',
    type: ConditionConfigDto,
  })
  @ValidateNested()
  @Type(() => ConditionConfigDto)
  @Expose()
  conditionConfig: ConditionConfigDto;

  @ApiProperty({
    description: 'Description of the conditions',
    example: 'Get 1000 points for participating in the summer festival',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  conditionsDescription: string;
}
