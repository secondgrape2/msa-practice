import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsObject,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ConditionParamDto {
  @IsOptional()
  @IsNumber()
  days?: number;

  @IsOptional()
  @IsNumber()
  minLevel?: number;

  [key: string]: unknown;
}

export class BaseConditionRule {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsObject()
  @IsNotEmpty()
  params: ConditionParamDto;
}

export class CompoundCondition {
  @IsString()
  @IsNotEmpty()
  operator: 'AND' | 'OR';

  @IsObject({ each: true })
  @IsNotEmpty()
  rules: BaseConditionRule[];
}

export class CreateGameEventDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  conditionsDescription: string;

  @IsOptional()
  @IsString()
  conditionType?: string;

  @IsNotEmpty()
  conditionConfig: CompoundCondition;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
