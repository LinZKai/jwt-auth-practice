import dotenv from "dotenv";

dotenv.config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });

// 若 .env 有缺少內容幫忙報錯
function mustGet(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const ENV = {
  PORT: Number(process.env.PORT ?? 3000),
  NODE_ENV: process.env.NODE_ENV ?? "development",
  JWT_ACCESS_SECRET: mustGet("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: mustGet("JWT_REFRESH_SECRET"),

  ACCESS_TOKEN_TTL: process.env.ACCESS_TOKEN_TTL ?? "5m",
  REFRESH_TOKEN_TTL_DAYS: Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 7),
} as const;

export { mustGet };