import { RewardType } from '@app/common/event/interfaces/reward.interface';

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
 *   discountType: 'percentage',
 *   minimumPurchaseAmount: 10000
 * }
 */
export interface CouponRewardDetails {
  /** Unique code for the coupon */
  couponCode: string;
  /** Amount of discount to be applied */
  discountAmount: number;
  /** Type of discount (percentage or fixed amount) */
  discountType: 'percentage' | 'fixed';
  /** Optional minimum purchase amount required to use the coupon */
  minimumPurchaseAmount?: number;
  /** Optional expiry date for the coupon */
  expiryDate?: Date;
}

/**
 * Union type representing all possible reward detail types
 * Each reward type has its own specific detail structure
 */
export type RewardDetails =
  | PointRewardDetails
  | ItemRewardDetails
  | CouponRewardDetails;

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
  /** Number of times this reward can be claimed */
  quantity: number;
  /** Type-specific details of the reward */
  details?: RewardDetails;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}
