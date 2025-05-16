import { EnvironmentVariables } from '../config';

export const COOKIE_SAME_SITE = {
  strict: 'strict',
  lax: 'lax',
  none: 'none',
} as const;

export type CookieSameSite =
  (typeof COOKIE_SAME_SITE)[keyof typeof COOKIE_SAME_SITE];

export const COOKIE_NAMES = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
} as const;

export type CookieName = (typeof COOKIE_NAMES)[keyof typeof COOKIE_NAMES];

export interface CookieOptions {
  expires?: Date;
  httpOnly: boolean;
  secure: boolean;
  sameSite: CookieSameSite;
  path: string;
  domain?: string;
  maxAge?: number;
}

const getDomainFromOrigin = (origin: string): string | undefined => {
  try {
    const url = new URL(origin);
    return url.hostname;
  } catch {
    return undefined;
  }
};

export const getCookieOptions = (origin?: string): CookieOptions => {
  const domain = origin ? getDomainFromOrigin(origin) : undefined;

  return {
    httpOnly: true,
    secure: true,
    sameSite: COOKIE_SAME_SITE.strict,
    path: '/',
    ...(domain && { domain }),
  };
};

export const getAccessTokenCookieOptions = (
  origin?: string,
): CookieOptions => ({
  ...getCookieOptions(origin),
  maxAge: 15 * 60 * 1000, // 15 minutes
});

export const getRefreshTokenCookieOptions = (
  origin?: string,
): CookieOptions => ({
  ...getCookieOptions(origin),
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

export const removeCookieOption = (origin?: string) => {
  const domain = origin ? getDomainFromOrigin(origin) : undefined;
  const option: CookieOptions = {
    expires: new Date(1970, 1, 1),
    httpOnly: true,
    path: '/',
    ...(domain && { domain }),
    secure: true,
    sameSite: COOKIE_SAME_SITE.strict,
  };

  return option;
};
