import express from "express";
import { verifyJWT, requireRole } from "../../middlewares/auth.middleware.js";
import {
    listStudents,
    getStudentDetail,
    uploadStudentList,
    getStudentLists,
    markEmailSent,
    markVerificationComplete,
    rejectApplication,
    getPendingVerification,
} from "../../Controllers/admissionCell.controller.js";

const router = express.Router();

router.use(verifyJWT, requireRole("admissionCell", "administrator"));

router.get("/students", listStudents);
router.get("/students/:applicationId", getStudentDetail);
router.get("/pending-verification", getPendingVerification);

router.post("/student-list/upload", uploadStudentList);
router.get("/student-lists", getStudentLists);

router.patch("/applications/:applicationId/send-email", markEmailSent);
router.patch("/applications/:applicationId/verify", markVerificationComplete);
router.patch("/applications/:applicationId/reject", rejectApplication);
router.patch("/applications/:applicationId/request-reupload", requestReupload);

export default router;
