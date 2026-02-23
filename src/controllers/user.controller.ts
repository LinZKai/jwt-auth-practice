import { Response } from "express";
import { AuthedRequest } from "../middlewares/auth";

export async function me(req: AuthedRequest, res: Response) {
  // 這裡先直接回 JWT 裡的資訊
  // 下一步我們可以改成：用 req.user.sub 去 DB 查 user（更完整）
  return res.json({
    user: req.user,
  });
}