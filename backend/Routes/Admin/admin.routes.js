import express from "express";
import { verifyGoogleToken, requireRole } from "../../middlewares/auth.middleware.js";
import {
    getOverview,
    listUsers,
    setUserRole,
    deactivateUser,
    activateUser,
    listAllApplications,
    dataMatching,
    deleteApplication,
} from "../../Controllers/admin.controller.js";

const router = express.Router();

// Protect all admin routes
router.use(verifyGoogleToken, requireRole("administrator"));

router.get("/overview", getOverview);
router.get("/data-matching", dataMatching);

router.get("/users", listUsers);
router.patch("/users/:userId/role", setUserRole);
router.patch("/users/:userId/deactivate", deactivateUser);
router.patch("/users/:userId/activate", activateUser);

router.get("/applications", listAllApplications);
router.delete("/applications/:applicationId", deleteApplication);

export default router;