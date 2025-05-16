export const REWARD_TYPE = {
  POINT: 'point',
  ITEM: 'item',
  COUPON: 'coupon',
} as const;

export type RewardType = (typeof REWARD_TYPE)[keyof typeof REWARD_TYPE];
