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
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

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
  @ApiProperty({
    description: 'Name of the game event',
    example: 'Summer Festival Event',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Detailed description of the game event',
    example: 'Join our summer festival with special rewards!',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Start date and time of the event',
    example: '2024-07-01T00:00:00Z',
    required: true,
  })
  @IsDateString()
  @IsNotEmpty()
  startAt: Date;

  @ApiProperty({
    description: 'End date and time of the event',
    example: '2024-07-31T23:59:59Z',
    required: true,
  })
  @IsDateString()
  @IsNotEmpty()
  endAt: Date;

  @IsNotEmpty()
  @IsString()
  conditionsDescription: string;

  @IsOptional()
  @IsString()
  conditionType?: string;

  @IsNotEmpty()
  conditionConfig: CompoundCondition;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
