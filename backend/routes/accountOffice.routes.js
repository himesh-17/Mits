import express from "express";
import { verifyGoogleToken, requireRole } from "../middlewares/auth.middleware.js";
import {
    listVerifiedApplications,
    getApplicationDetail,
    verifyDocument,
    setPaymentDetails,
    verifyPayment,
    listPendingPayments,
    confirmAdmission,
} from "../controllers/accountOffice.controller.js";

const router = express.Router();

router.use(verifyGoogleToken, requireRole("accountOffice", "administrator"));

router.get("/applications", listVerifiedApplications);
router.get("/applications/:applicationId", getApplicationDetail);
router.patch("/applications/:applicationId/set-payment", setPaymentDetails);
router.patch("/applications/:applicationId/confirm-admission", confirmAdmission);

router.patch("/documents/:documentId/verify", verifyDocument);

router.get("/payments", listPendingPayments);
router.patch("/payments/:paymentId/verify", verifyPayment);

export default router;
