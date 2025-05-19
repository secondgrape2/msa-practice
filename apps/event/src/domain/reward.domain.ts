import { BaseConditionRule, ConditionConfig } from './game-event.domain';

/**
 * Enum for reward types
 */
export const REWARD_TYPE = {
  POINT: 'point',
  ITEM: 'item',
  COUPON: 'coupon',
} as const;
export type RewardType = (typeof REWARD_TYPE)[keyof typeof REWARD_TYPE];

export const REWARD_REQUEST_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  CLAIMED: 'claimed',
} as const;

export type RewardRequestStatus =
  (typeof REWARD_REQUEST_STATUS)[keyof typeof REWARD_REQUEST_STATUS];

/**
 * Represents the details for a point-based reward
 * @example { pointAmount: 1000, expiryDate: '2024-12-31' }
 */
export interface PointRewardDetails {
  /** Amount of points to be awarded */
  pointAmount: number;
  /** Optional expiry date for the points */
  expiryDate?: Date;
}

/**
 * Represents the details for an item-based reward
 * @example { itemId: 'item_123', itemName: 'Premium Sword', itemQuantity: 1 }
 */
export interface ItemRewardDetails {
  /** Unique identifier of the item */
  itemId: string;
  /** Name of the item */
  itemName: string;
  /** Quantity of the item to be awarded */
  itemQuantity: number;
}

/**
 * Represents the details for a coupon-based reward
 * @example {
 *   couponCode: 'SUMMER2024',
 *   discountAmount: 20,
 *   discountType: 'percentage'
 * }
 */
export interface CouponRewardDetails {
  /** Unique code for the coupon */
  couponCode: string;
  /** Amount of discount to be applied */
  discountAmount: number;
  /** Type of discount (percentage or fixed amount) */
  discountType: 'percentage' | 'fixed';
  /** Optional expiry date for the coupon */
  expiryDate?: Date;
}

/**
 * Represents the logical operator for combining multiple condition rules
 * @example 'AND' - All rules must be satisfied
 * @example 'OR' - At least one rule must be satisfied
 */
export type ConditionOperator = 'AND' | 'OR';

/**
 * Represents a compound condition that combines multiple rules with a logical operator
 * @example {
 *   operator: 'AND',
 *   rules: [
 *     { type: 'LOGIN_STREAK', params: { days: 7 } },
 *     { type: 'USER_LEVEL', params: { minLevel: 10 } }
 *   ]
 * }
 */
export interface CompoundCondition {
  /** The logical operator to combine rules */
  operator: ConditionOperator;
  /** Array of condition rules to be evaluated */
  rules: BaseConditionRule[];
}

export const CONDITION_TYPE = {
  LEVEL: 'level',
  LOGIN_STREAK: 'login_streak',
} as const;

export type ConditionType =
  (typeof CONDITION_TYPE)[keyof typeof CONDITION_TYPE];

/**
 * Represents a reward that can be earned from completing game events
 * @example {
 *   type: 'POINT',
 *   name: 'Login Bonus',
 *   description: 'Login for 7 consecutive days',
 *   quantity: 1,
 *   details: { pointAmount: 1000 }
 * }
 */
export interface Reward {
  /** Unique identifier for the reward */
  id: string;
  /** ID of the associated game event */
  eventId: string;
  /** Type of the reward (POINT, ITEM, or COUPON) */
  type: RewardType;
  /** Name of the reward */
  name: string;
  /** Optional detailed description of the reward */
  description?: string;
  /** Point details of the reward */
  pointDetails?: PointRewardDetails;
  /** Item details of the reward */
  itemDetails?: ItemRewardDetails;
  /** Coupon details of the reward */
  couponDetails?: CouponRewardDetails;
  /** Condition type for the reward */
  conditionType: ConditionType;
  /** Condition configuration for the reward */
  conditionConfig: ConditionConfig;
  /** Description of the conditions for the reward */
  conditionsDescription: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}
