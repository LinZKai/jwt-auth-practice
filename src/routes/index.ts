import { Router } from "express";
import viewRouter from "./view";
import authRouter from "./auth";
import userRouter from "./user";

const router = Router();


router.use("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

router.use("/api/auth", authRouter);

router.use("/api/", userRouter);

router.use("/", viewRouter);

export default router;