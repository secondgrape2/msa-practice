export const REWARD_REQUEST_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  CLAIMED: 'claimed',
} as const;

export type RewardRequestStatus =
  (typeof REWARD_REQUEST_STATUS)[keyof typeof REWARD_REQUEST_STATUS];

export const REWARD_TYPE = {
  POINT: 'point',
  ITEM: 'item',
  COUPON: 'coupon',
} as const;

export type RewardType = (typeof REWARD_TYPE)[keyof typeof REWARD_TYPE];
