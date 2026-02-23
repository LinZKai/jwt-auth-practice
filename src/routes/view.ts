import { Router } from "express";
import { ENV } from "../configs/env";

const router = Router();

router.get("/auth", (req, res) => {
  res.render("auth", {
    title: "Auth Playground",
    env: ENV.NODE_ENV,
  });
});

export default router;