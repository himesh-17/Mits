import { Router } from "express";
import { getMe, googleLogin } from "../../Controllers/auth.controller.js";
import { verifyGoogleToken } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/google", googleLogin);
router.get("/me", verifyGoogleToken, getMe);

export default router;