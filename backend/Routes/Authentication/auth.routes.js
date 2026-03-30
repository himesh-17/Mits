import { Router } from "express";
import { getMe, googleLogin, logout } from "../../controllers/auth.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/google", googleLogin);
// Intentionally public: logout only clears the auth cookie and does not require req.user context.
router.post("/logout", logout);
router.get("/me", verifyJWT, getMe);

export default router;