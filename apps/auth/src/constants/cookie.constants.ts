export const COOKIE_SAME_SITE = {
  strict: 'strict',
  lax: 'lax',
} as const;

export type CookieSameSite =
  (typeof COOKIE_SAME_SITE)[keyof typeof COOKIE_SAME_SITE];

export const COOKIE_OPTIONS = {
  httpOnly: true,
  // secure: true,
  sameSite: COOKIE_SAME_SITE.strict,
  path: '/',
} as const;

export const ACCESS_TOKEN_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 15 * 60 * 1000, // 15 minutes
} as const;

export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

export const COOKIE_NAMES = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
} as const;
