import { Response } from "express";
import { AuthedRequest } from "../middlewares/auth";

export async function me(req: AuthedRequest, res: Response) {
  return res.json({
    user: req.user,
  });
}
