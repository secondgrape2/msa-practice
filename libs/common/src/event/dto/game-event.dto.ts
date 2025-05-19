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
  @ApiProperty({
    description: 'Number of days required for the condition',
    example: 7,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  days?: number;

  @ApiProperty({
    description: 'Minimum level required for the condition',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  minLevel?: number;

  [key: string]: unknown;
}

export class BaseConditionRule {
  @ApiProperty({
    description: 'Type of the condition rule',
    example: 'LEVEL',
    enum: ['LEVEL', 'DAYS', 'CUSTOM'],
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'Parameters for the condition rule',
    type: ConditionParamDto,
  })
  @IsObject()
  @IsNotEmpty()
  params: ConditionParamDto;
}

export class CompoundCondition {
  @ApiProperty({
    description: 'Logical operator to combine multiple rules',
    enum: ['AND', 'OR'],
    example: 'AND',
  })
  @IsString()
  @IsNotEmpty()
  operator: 'AND' | 'OR';

  @ApiProperty({
    description: 'List of condition rules',
    type: [BaseConditionRule],
    example: [
      {
        type: 'LEVEL',
        params: { minLevel: 10 },
      },
    ],
  })
  @IsObject({ each: true })
  @IsNotEmpty()
  rules: BaseConditionRule[];
}

export class CreateGameEventDto {
  @ApiProperty({
    description: 'Name of the game event',
    example: 'Summer Festival Event',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Detailed description of the game event',
    example: 'Join our summer festival with special rewards!',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Start date and time of the event',
    example: '2024-07-01T00:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startAt: Date;

  @ApiProperty({
    description: 'End date and time of the event',
    example: '2024-07-31T23:59:59Z',
  })
  @IsDateString()
  @IsNotEmpty()
  endAt: Date;

  @ApiProperty({
    description: 'Whether the event is currently active',
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
