import express from "express";
import { verifyGoogleToken, requireRole } from "../middlewares/auth.middleware.js";
import {
    getAdmittedStudents,
    getAdmittedStudentDetail,
    getBranchStats,
} from "../controllers/hod.controller.js";

const router = express.Router();

router.use(verifyGoogleToken, requireRole("hod", "administrator"));

router.get("/students", getAdmittedStudents);
router.get("/students/:applicationId", getAdmittedStudentDetail);
router.get("/stats", getBranchStats);

export default router;
