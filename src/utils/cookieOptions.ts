import { CookieOptions } from 'express';

export const getCookieOptions = (isRefresh: boolean): CookieOptions => {
  const isProd = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: isRefresh
      ? Number(process.env.COOKIE_REFRESH_MAX_AGE)
      : Number(process.env.COOKIE_ACCESS_MAX_AGE),
  };
};
