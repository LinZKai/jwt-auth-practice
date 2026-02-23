import { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on("finish", () => {
    const ms = Date.now() - start;
    const method = req.method;
    const path = req.originalUrl;
    const status = res.statusCode;

    const ua = req.headers["user-agent"] ?? "";
    const ip = req.ip;

    console.log(
      `{${method}} ${path} -> ${status} ${ms}ms ip=${ip} ua="${ua}"`
    );
  });

  next();
}