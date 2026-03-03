import Application from "../Models/application.model.js";
import User from "../Models/user.model.js";
import RoleAssignment from "../Models/roleAssignment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";

function escapeRegex(value = "") {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/general-office/applications
// Filter applications by status, branch, course, name
const filterApplications = asyncHandler(async (req, res) => {
    const { status, branch, course, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (branch) filter.branch = branch;
    if (course) filter.course = course;
    if (search) {
        const safeSearch = escapeRegex(search);
        filter.fullName = { $regex: safeSearch, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [applications, total] = await Promise.all([
        Application.find(filter)
            .populate("student", "name email picture")
            .populate("reviewedBy", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Application.countDocuments(filter),
    ]);

    return sendSuccess(res, "Applications fetched", {
        applications,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
    });
});

// GET /api/general-office/progress
// Returns counts for each status — the "progress bar" overview
const getProgressOverview = asyncHandler(async (req, res) => {
    const statuses = [
        "draft", "submitted", "under_review",
        "documents_pending",
        "documents_verified", "payment_pending", "payment_submitted",
        "payment_verified", "admitted", "rejected",
    ];

    const counts = await Promise.all(
        statuses.map(async (s) => ({
            status: s,
            count: await Application.countDocuments({ status: s }),
        }))
    );

    const total = await Application.countDocuments();
    return sendSuccess(res, "Progress overview fetched", { total, breakdown: counts });
});

// PATCH /api/general-office/applications/:applicationId/review
// General office adds remarks / moves app to next stage
const reviewApplication = asyncHandler(async (req, res) => {
    const { remarks, action } = req.body;
    // action: "approve" | "reject" | "re_upload"
    if (!action) throw new ApiError(400, "action is required (approve | reject | re_upload)");

    const app = await Application.findById(req.params.applicationId);
    if (!app) throw new ApiError(404, "Application not found");

    if (remarks) app.remarksGeneralOffice = remarks;
    app.reviewedBy = req.user.id;

    if (action === "approve") {
        app.status = "documents_pending";
    } else if (action === "reject") {
        if (!remarks) throw new ApiError(400, "remarks (reason) required for rejection");
        app.status = "rejected";
        app.rejectionReason = remarks;
    } else if (action === "re_upload") {
        if (!remarks) throw new ApiError(400, "remarks (reason) required for re-upload request");
        app.status = "re_upload";
        app.rejectionReason = remarks;
    } else {
        throw new ApiError(400, "Invalid action. Use: approve | reject | re_upload");
    }

    await app.save();
    const actionMessageMap = {
        approve: "approved",
        reject: "rejected",
        re_upload: "re-uploaded",
    };
    const actionMessage = actionMessageMap[action] || `${action}d`;

    return sendSuccess(res, `Application ${actionMessage}`, { application: app });
});

// GET /api/general-office/roles
// List current staff role assignments
const listRoleAssignments = asyncHandler(async (req, res) => {
    const assignments = await RoleAssignment.find()
        .populate("assignedBy", "name email")
        .sort({ createdAt: -1 });
    return sendSuccess(res, "Role assignments fetched", { assignments });
});

// POST /api/general-office/roles
// Assign a role to an email
const assignRole = asyncHandler(async (req, res) => {
    const { email, role, branch } = req.body;
    if (!email || !role) throw new ApiError(400, "email and role are required");

    const validRoles = ["administrator", "admissionCell", "generalOffice", "accountOffice", "hod"];
    if (!validRoles.includes(role)) {
        throw new ApiError(400, `Invalid role. Valid: ${validRoles.join(", ")}`);
    }

    const assignment = await RoleAssignment.findOneAndUpdate(
        { email: email.toLowerCase() },
        { email: email.toLowerCase(), role, branch: branch || "", assignedBy: req.user.id },
        { upsert: true, new: true }
    );

    // Update the user's role if they already exist
    await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { role },
    );

    return sendSuccess(res, "Role assigned", { assignment }, 201);
});

// DELETE /api/general-office/roles/:email
// Remove a role assignment (reverts user to student)
const removeRoleAssignment = asyncHandler(async (req, res) => {
    const email = req.params.email.toLowerCase();
    const deletedAssignment = await RoleAssignment.findOneAndDelete({ email });

    if (!deletedAssignment) {
        return sendSuccess(res, "No role assignment found for this email");
    }

    await User.findOneAndUpdate({ email }, { role: "student" });
    return sendSuccess(res, "Role assignment removed");
});

export {
    filterApplications,
    getProgressOverview,
    reviewApplication,
    listRoleAssignments,
    assignRole,
    removeRoleAssignment,
};
