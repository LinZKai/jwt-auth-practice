import { Router } from "express";
import { register, login, refresh, logout } from "../controllers/auth.controller";
import { validateBody } from "../middlewares/validate";
import { authCredsSchema } from "../utils/schemas";

const router = Router();

router.post("/register", validateBody(authCredsSchema), register);
router.post("/login", validateBody(authCredsSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;