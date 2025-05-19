import { ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  days?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minLevel?: number;

  [key: string]: unknown;
}

/**
 * DTO for base condition rule
 */
export class BaseConditionRuleDto {
  @IsString()
  type: string;

  @IsObject()
  params: ConditionParamsDto;
}

/**
 * DTO for compound condition
 */
export class CompoundConditionDto {
  @IsEnum(['AND', 'OR'])
  operator: 'AND' | 'OR';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BaseConditionRuleDto)
  rules: BaseConditionRuleDto[];
}

/**
 * DTO for condition configuration
 */
export class ConditionConfigDto {
  @IsEnum(['AND', 'OR'])
  operator: 'AND' | 'OR';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BaseConditionRuleDto)
  rules: BaseConditionRuleDto[];
}
