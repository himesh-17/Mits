import { Router } from "express";
import { getMe, googleLogin } from "../../Controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/google", googleLogin);
router.get("/me", verifyJWT, getMe);

export default router;