import express from "express";
import { verifyJWT, requireRole } from "../../middlewares/auth.middleware.js";
import {
    getAdmittedStudents,
    getAdmittedStudentDetail,
    getBranchStats,
    getAllowedBranches,
} from "../../Controllers/hod.controller.js";

const router = express.Router();

router.use(verifyJWT, requireRole("hod", "administrator"));

router.get("/branches", getAllowedBranches);
router.get("/students", getAdmittedStudents);
router.get("/students/:applicationId", getAdmittedStudentDetail);
router.get("/stats", getBranchStats);

export default router;
