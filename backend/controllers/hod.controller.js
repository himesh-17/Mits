import Application from "../models/application.model.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// GET /api/hod/students
// HOD sees only admitted students from their branch
const getAdmittedStudents = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, course, search } = req.query;

    // Determine HOD's branch from their user record
    const hodUser = await User.findById(req.user.id);
    if (!hodUser) throw new ApiError(404, "HOD user not found");

    // HOD's branch comes from their RoleAssignment
    const RoleAssignment = (await import("../models/roleAssignment.model.js")).default;
    const assignment = await RoleAssignment.findOne({ email: hodUser.email });
    const branch = req.query.branch || (assignment && assignment.branch) || "";

    const filter = { status: "admitted" };
    if (branch) filter.branch = branch;
    if (course) filter.course = course;
    if (search) filter.fullName = { $regex: search, $options: "i" };

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
    const app = await Application.findOne({
        _id: req.params.applicationId,
        status: "admitted",
    }).populate("student", "name email picture");

    if (!app) throw new ApiError(404, "Admitted student not found");
    return sendSuccess(res, "Student detail fetched", { application: app });
});

// GET /api/hod/stats
// Quick count stats for HOD's branch
const getBranchStats = asyncHandler(async (req, res) => {
    const hodUser = await User.findById(req.user.id);
    const RoleAssignment = (await import("../models/roleAssignment.model.js")).default;
    const assignment = await RoleAssignment.findOne({ email: hodUser.email });
    const branch = req.query.branch || (assignment && assignment.branch) || "";

    const filter = branch ? { branch } : {};
    const [admitted, total, byBranch] = await Promise.all([
        Application.countDocuments({ ...filter, status: "admitted" }),
        Application.countDocuments(filter),
        Application.aggregate([
            { $match: { status: "admitted" } },
            { $group: { _id: "$branch", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]),
    ]);

    return sendSuccess(res, "Branch stats fetched", { branch, admitted, total, byBranch });
});

export { getAdmittedStudents, getAdmittedStudentDetail, getBranchStats };
