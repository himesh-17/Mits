import { Router } from "express";
import { getMe, googleLogin } from "../controllers/auth.controller.js";
import { verifyGoogleToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/google", googleLogin);
router.get("/me", verifyGoogleToken, getMe);

export default router;