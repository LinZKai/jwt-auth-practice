import { CookieOptions } from "express";
import { ENV } from "./env";

export const REFRESH_COOKIE_NAME = "refresh_token";

export function refreshCookieOptions(): CookieOptions {
  return {
    // cookie 不能被 JavaScript 存取
    httpOnly: true,
    // 控制跨站請求時 cookie 是否會被發送
    sameSite: "lax",
    // cookie 是否只能在 HTTPS 傳輸
    secure: ENV.NODE_ENV === "production",
    path: "/api/auth",
    maxAge: ENV.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  };
}