import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { ENV } from "./configs/env";
import { notFoundHandler, errorHandler } from "./middlewares/error";
import { requestLogger } from "./middlewares/logger";
import router from "./routes";

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "src", "views"));

if (ENV.NODE_ENV !== "test") {
  app.use(requestLogger);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/", router);

app.use("/static", express.static(path.join(process.cwd(), "src", "public")));

app.use(notFoundHandler);
app.use(errorHandler);

export default app;