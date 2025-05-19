import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

/**
 * DTO for condition parameters
 */
export class ConditionParamsDto {
  @ApiPropertyOptional({
    description: 'Number of days for time-based conditions',
    example: 7,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  days?: number;

  @ApiPropertyOptional({
    description: 'Minimum level required for level-based conditions',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  minLevel?: number;

  [key: string]: unknown;
}

/**
 * DTO for base condition rule
 */
export class BaseConditionRuleDto {
  @ApiProperty({
    description: 'Type of the condition rule',
    example: 'login_streak',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Parameters for the condition rule',
    type: ConditionParamsDto,
  })
  @IsObject()
  params: ConditionParamsDto;
}

/**
 * DTO for compound condition
 */
export class CompoundConditionDto {
  @ApiProperty({
    description: 'Logical operator for combining conditions',
    enum: ['AND', 'OR'],
    example: 'AND',
  })
  @IsEnum(['AND', 'OR'])
  operator: 'AND' | 'OR';

  @ApiProperty({
    description: 'List of condition rules to be combined',
    type: [BaseConditionRuleDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BaseConditionRuleDto)
  rules: BaseConditionRuleDto[];
}

/**
 * DTO for condition configuration
 */
export class ConditionConfigDto {
  @ApiProperty({
    description: 'Logical operator for combining conditions',
    enum: ['AND', 'OR'],
    example: 'AND',
  })
  @IsEnum(['AND', 'OR'])
  operator: 'AND' | 'OR';

  @ApiProperty({
    description: 'List of condition rules to be combined',
    type: [BaseConditionRuleDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BaseConditionRuleDto)
  rules: BaseConditionRuleDto[];
}
