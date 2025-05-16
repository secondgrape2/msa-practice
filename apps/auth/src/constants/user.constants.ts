export const USER_ROLE = {
  admin: 'admin',
  user: 'user',
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const DEFAULT_USER_ROLE = USER_ROLE.user;
