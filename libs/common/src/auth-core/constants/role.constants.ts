/**
 * @description Role constants for user authorization
 * USER: Can request rewards
 * OPERATOR: Can register events and rewards
 * AUDITOR: Can only view reward history
 * ADMIN: Has access to all features
 */
export const ROLE = {
  /** @description Can request rewards */
  USER: 'user',
  /** @description Can register events and rewards */
  OPERATOR: 'operator',
  /** @description Can only view reward history */
  AUDITOR: 'auditor',
  /** @description Has access to all features */
  ADMIN: 'admin',
} as const;

/** @description Type definition for role values */
export type Role = (typeof ROLE)[keyof typeof ROLE];
