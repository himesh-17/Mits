import express from "express";
import { verifyJWT, requireRole } from "../../middlewares/auth.middleware.js";
import {
    getDashboard,
    getReports,
    getOverview,
    listAuditLogs,
    listStudentData,
    listUsers,
    setUserRole,
    deactivateUser,
    activateUser,
    listAllApplications,
    dataMatching,
    deleteApplication,
    bulkEnrollmentImport,
    listRounds,
    createRound,
    updateRoundStatus,
    listRoundStudents,
} from "../../controllers/admin.controller.js";

const router = express.Router();

// Protect all admin routes
router.use(verifyJWT, requireRole("administrator"));

router.get("/dashboard", getDashboard);
router.get("/reports", getReports);
router.get("/student-data", listStudentData);
router.get("/overview", getOverview);
router.get("/audit-logs", listAuditLogs);
router.get("/data-matching", dataMatching);

router.get("/users", listUsers);
router.patch("/users/:userId/role", setUserRole);
router.patch("/users/:userId/deactivate", deactivateUser);
router.patch("/users/:userId/activate", activateUser);

router.get("/applications", listAllApplications);
router.delete("/applications/:applicationId", deleteApplication);
router.post("/bulk-enrollment", bulkEnrollmentImport);

router.get("/rounds", listRounds);
router.post("/rounds", createRound);
router.patch("/rounds/:roundId/status", updateRoundStatus);
router.get("/rounds/:roundId/students", listRoundStudents);

export default router;