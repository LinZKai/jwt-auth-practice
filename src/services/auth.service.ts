import bcrypt from "bcrypt";
import { prisma } from "../configs/prisma";
import { cleanupExpiredTokens, enforceMaxActiveTokens } from "./tokenCleanUp.service";
import { hashToken, refreshExpiresAt, signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/token";
import user from "../routes/user";

const BCRYPT_ROUNDS = 12;

export async function registerUser(email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  return prisma.user.create({
    data: { email, passwordHash },
    select: { id: true, email: true, createdAt: true },
  });
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;

  const payload = { sub: user.id, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: refreshExpiresAt(),
    },
  });

  await cleanupExpiredTokens();
  await enforceMaxActiveTokens(user.id, 5);

  return { user: { id: user.id, email: user.email }, accessToken, refreshToken };
}

/**
 * Refresh rotation:
 * - 驗證 cookie 裡的 refresh token
 * - DB 找到 tokenHash 且未 revoked 且未過期
 * - revoke 舊的
 * - 發新的 refresh token + access token
 * - DB 存新 refresh token hash
 */
export async function refreshSession(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken); // signature & exp
  const tokenHash = hashToken(refreshToken);

  const row = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!row) return null;
  if (row.revokedAt) return null;
  if (row.expiresAt.getTime() < Date.now()) return null;

  // 先撤銷舊的（避免重放）
  await prisma.refreshToken.update({
    where: { tokenHash },
    data: { revokedAt: new Date() },
  });

  const newPayload = { sub: payload.sub, email: payload.email };
  const newAccessToken = signAccessToken(newPayload);
  const newRefreshToken = signRefreshToken(newPayload);

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(newRefreshToken),
      userId: payload.sub,
      expiresAt: refreshExpiresAt(),
    },
  });

  await cleanupExpiredTokens();
await enforceMaxActiveTokens(payload.sub, 5);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export async function logoutSession(refreshToken?: string) {
  if (!refreshToken) return;

  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}