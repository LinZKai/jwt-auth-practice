import { Request, Response, NextFunction } from "express";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: "NOT_FOUND",
    path: req.path,
  });
}

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  console.error("Unhandled error:", err);

  res.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
  });
}