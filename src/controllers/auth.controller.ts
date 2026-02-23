import { Request, Response, NextFunction } from "express";
import { REFRESH_COOKIE_NAME, refreshCookieOptions } from "../configs/cookies";
import { registerUser, loginUser, refreshSession, logoutSession } from "../services/auth.service";

function getCreds(req: Request) {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");
  return { email, password };
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = getCreds(req);
    if (!email || password.length < 8) {
      return res.status(400).json({ error: "Invalid email or password (min 8 chars)" });
    }

    const user = await registerUser(email, password);
    return res.status(201).json({ message: "registered", user });
  } catch (err: any) {
    // Prisma unique constraint (email)
    if (err?.code === "P2002") {
      return res.status(409).json({ error: "Email already exists" });
    }
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = getCreds(req);
    if (!email || !password) return res.status(400).json({ error: "Missing email/password" });

    const result = await loginUser(email, password);
    if (!result) return res.status(401).json({ error: "Invalid credentials" });

    // refresh token 放 HttpOnly cookie
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, refreshCookieOptions());

    return res.json({
      message: "login ok",
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    if (!token) return res.status(401).json({ error: "Missing refresh token cookie, please login again" });

    const result = await refreshSession(token);
    if (!result) return res.status(401).json({ error: "Invalid refresh token" });

    // rotation：寫入新的 refresh cookie
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, refreshCookieOptions());

    return res.json({
      message: "refreshed",
      accessToken: result.accessToken,
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    await logoutSession(token);

    // 清 cookie（同名同 path 才會清得掉）
    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });

    return res.json({ message: "logout ok" });
  } catch (err) {
    next(err);
  }
}