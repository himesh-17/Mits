import express from "express";
import { verifyJWT, requireRole } from "../../middlewares/auth.middleware.js";
import {
    filterApplications,
    getProgressOverview,
    reviewApplication,
    listRoleAssignments,
    assignRole,
    removeRoleAssignment,
} from "../../Controllers/generalOffice.controller.js";

const router = express.Router();

router.use(verifyJWT, requireRole("generalOffice", "administrator"));

router.get("/applications", filterApplications);
router.get("/progress", getProgressOverview);
router.patch("/applications/:applicationId/review", reviewApplication);

router.get("/roles", listRoleAssignments);
router.post("/roles", assignRole);
router.delete("/roles/:email", removeRoleAssignment);

export default router;
