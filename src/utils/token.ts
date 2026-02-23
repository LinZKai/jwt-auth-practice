import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ENV } from "../configs/env";

export type JWTTokenPayload = {
  sub: string; // userId
  email: string;
};

export function signAccessToken(payload: JWTTokenPayload) {
  return jwt.sign(payload, ENV.JWT_ACCESS_SECRET, { expiresIn: ENV.ACCESS_TOKEN_TTL } as jwt.SignOptions);
}

export function signRefreshToken(payload: JWTTokenPayload) {
  return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, { expiresIn: `${ENV.REFRESH_TOKEN_TTL_DAYS}d` });
}

export function verifyRefreshToken(token: string): JWTTokenPayload {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET) as JWTTokenPayload;
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function refreshExpiresAt() {
  const ms = ENV.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + ms);
}