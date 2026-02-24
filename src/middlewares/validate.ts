import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        details: parsed.error.issues.map(i => ({
          path: i.path.join("."),
          message: i.message,
        })),
      });
    }
    req.body = parsed.data;
    next();
  };
}
