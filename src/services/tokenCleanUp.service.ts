import { prisma } from "../configs/prisma";

export async function cleanupExpiredTokens() {
  await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
}

export async function enforceMaxActiveTokens(userId: string, maxActive: number) {
  // 找出該 user 仍有效且未撤銷的 tokens（由新到舊）
  const active = await prisma.refreshToken.findMany({
    where: {
      userId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    select: { tokenHash: true },
  });

  if (active.length <= maxActive) return;

  const toRevoke = active.slice(maxActive).map(t => t.tokenHash);

  await prisma.refreshToken.updateMany({
    where: { tokenHash: { in: toRevoke } },
    data: { revokedAt: new Date() },
  });
}