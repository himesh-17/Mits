import Application from "../Models/application.model.js";
import User from "../Models/user.model.js";
import RoleAssignment from "../Models/roleAssignment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";

function escapeRegex(value = "") {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function resolveHodBranchContext(userId, role, requestedBranch = "") {
    const hodUser = await User.findById(userId);
    if (!hodUser) throw new ApiError(404, "HOD user not found");

    const assignment = await RoleAssignment.findOne({ email: hodUser.email });
    const assignedBranch = String(assignment?.branch || "").trim();
    const queryBranch = String(requestedBranch || "").trim();

    // Role-based branch scoping:
    // - HOD with assigned branch: locked to that branch.
    // - Admin: can view selected branch or all.
    // - HOD without assignment: can still choose a branch.
    if (role === "hod" && assignedBranch && queryBranch && queryBranch !== assignedBranch) {
        throw new ApiError(403, "Forbidden: cannot access another branch");
    }

    const branch = role === "hod" && assignedBranch
        ? assignedBranch
        : queryBranch;

    return { hodUser, assignedBranch, branch };
}

// GET /api/hod/students
// HOD sees only admitted students from their branch
const getAdmittedStudents = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, course, search } = req.query;
    const { branch } = await resolveHodBranchContext(req.user.id, req.user.role, req.query.branch);

    const filter = { status: "admitted" };
    if (branch) filter.branch = branch;
    if (course) filter.programApplied = course;
    if (search) {
        const safeSearch = escapeRegex(search);
        filter.fullName = { $regex: safeSearch, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [applications, total] = await Promise.all([
        Application.find(filter)
            .populate("student", "name email picture")
            .select("fullName rollNumber branch course semester phone student status admittedAt progressBar")
            .sort({ admittedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Application.countDocuments(filter),
    ]);

    return sendSuccess(res, "Admitted students fetched", {
        branch,
        applications,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
    });
});

// GET /api/hod/students/:applicationId
// HOD can view a single admitted student's details
const getAdmittedStudentDetail = asyncHandler(async (req, res) => {
    const { assignedBranch } = await resolveHodBranchContext(req.user.id, req.user.role);

    const app = await Application.findOne({
        _id: req.params.applicationId,
        status: "admitted",
    }).populate("student", "name email picture");

    if (!app) throw new ApiError(404, "Admitted student not found");
    if (req.user.role === "hod" && assignedBranch && app.branch !== assignedBranch) {
        throw new ApiError(403, "Forbidden");
    }
    return sendSuccess(res, "Student detail fetched", { application: app });
});

// GET /api/hod/stats
// Quick count stats for HOD's branch
const getBranchStats = asyncHandler(async (req, res) => {
    const { branch } = await resolveHodBranchContext(req.user.id, req.user.role, req.query.branch);

    const filter = branch ? { branch } : {};
    const [admitted, total, byBranch] = await Promise.all([
        Application.countDocuments({ ...filter, status: "admitted" }),
        Application.countDocuments(filter),
        Application.aggregate([
            { $match: { ...filter, status: "admitted" } },
            { $group: { _id: "$branch", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]),
    ]);

    return sendSuccess(res, "Branch stats fetched", { branch, admitted, total, byBranch });
});

// GET /api/hod/branches
// Branch options for HOD branch selector.
const getAllowedBranches = asyncHandler(async (req, res) => {
    const { assignedBranch } = await resolveHodBranchContext(req.user.id, req.user.role);

    if (req.user.role === "hod" && assignedBranch) {
        return sendSuccess(res, "Allowed branches fetched", {
            branches: [assignedBranch],
            defaultBranch: assignedBranch,
        });
    }

    const admittedBranches = await Application.distinct("branch", {
        status: "admitted",
        branch: { $ne: "" },
    });

    const branches = admittedBranches
        .map((branch) => String(branch || "").trim())
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));

    return sendSuccess(res, "Allowed branches fetched", {
        branches,
        defaultBranch: branches[0] || "",
    });
});

export { getAdmittedStudents, getAdmittedStudentDetail, getBranchStats, getAllowedBranches };
