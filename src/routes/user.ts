import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { me } from "../controllers/user.controller";

const router = Router();

router.get("/me", requireAuth, me);

export default router;