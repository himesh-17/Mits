import express from "express";
import { verifyGoogleToken, requireRole } from "../middlewares/auth.middleware.js";
import {
    getOrCreateApplication,
    updateApplication,
    submitApplication,
    uploadDocument,
    getMyDocuments,
    getMyPayment,
    submitPayment,
} from "../controllers/student.controller.js";

const router = express.Router();

router.use(verifyGoogleToken, requireRole("student"));

router.get("/application", getOrCreateApplication);
router.patch("/application", updateApplication);
router.post("/application/submit", submitApplication);

router.post("/documents", uploadDocument);
router.get("/documents", getMyDocuments);

router.get("/payment", getMyPayment);
router.post("/payment/submit", submitPayment);

export default router;
