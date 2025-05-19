import { CompoundCondition } from '@app/common/event/dto/game-event.dto';

/**
 * Represents the logical operator for combining multiple condition rules
 * @example 'AND' - All rules must be satisfied
 * @example 'OR' - At least one rule must be satisfied
 */
export type ConditionOperator = 'AND' | 'OR';

/**
 * Represents a single condition rule with its type and parameters
 * @example { type: 'LOGIN_STREAK', params: { days: 7 } }
 * @example { type: 'USER_LEVEL', params: { minLevel: 10 } }
 */
export interface ConditionParams {
  days?: number;
  minLevel?: number;
  [key: string]: unknown;
}

export interface BaseConditionRule {
  /** The type of condition rule (e.g., 'LOGIN_STREAK', 'USER_LEVEL') */
  type: string;
  /** Parameters specific to the condition type */
  params: ConditionParams;
}

/**
 * Represents the configuration for event conditions
 * Can be either a compound condition or an array of base condition rules
 */
export type ConditionConfig = CompoundCondition;

/**
 * Represents a game event with its conditions and metadata
 * @example {
 *   name: '7-Day Login Streak',
 *   description: 'Login for 7 consecutive days',
 *   conditionsDescription: 'Login for 7 consecutive days',
 *   conditionConfig: {
 *     operator: 'AND',
 *     rules: [{ type: 'LOGIN_STREAK', params: { days: 7 } }]
 *   }
 * }
 */
export interface GameEvent {
  /** Unique identifier for the game event */
  id: string;
  /** Name of the game event */
  name: string;
  /** Optional detailed description of the game event */
  description?: string;
  /** Start date of the event */
  startAt: Date;
  /** End date of the event */
  endAt: Date;
  /** Whether the event is currently active */
  isActive: boolean;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

export interface CreateGameEvent
  extends Omit<GameEvent, 'id' | 'createdAt' | 'updatedAt'> {}
