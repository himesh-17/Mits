import Application from "../models/application.model.js";
import User from "../models/user.model.js";
import Document from "../models/document.model.js";
import Payment from "../models/payment.model.js";
import StudentList from "../models/studentList.model.js";
import RoleAssignment from "../models/roleAssignment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// GET /api/admin/overview
// Full DB summary — the "database of admission portal and student data matching"
const getOverview = asyncHandler(async (req, res) => {
    const [
        totalUsers,
        totalApplications,
        totalDocuments,
        totalPayments,
        totalStudentLists,
        applicationsByStatus,
        usersByRole,
    ] = await Promise.all([
        User.countDocuments(),
        Application.countDocuments(),
        Document.countDocuments(),
        Payment.countDocuments(),
        StudentList.countDocuments(),
        Application.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]),
        User.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]),
    ]);

    return sendSuccess(res, "Admin overview fetched", {
        totalUsers,
        totalApplications,
        totalDocuments,
        totalPayments,
        totalStudentLists,
        applicationsByStatus,
        usersByRole,
    });
});

// GET /api/admin/users
// List all users with pagination and role filter
const listUsers = asyncHandler(async (req, res) => {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
    ];

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
        User.find(filter).select("-googleSub").sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
        User.countDocuments(filter),
    ]);

    return sendSuccess(res, "Users fetched", {
        users,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
    });
});

// PATCH /api/admin/users/:userId/role
// Directly set a user's role
const setUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const validRoles = ["student", "administrator", "admissionCell", "generalOffice", "accountOffice", "hod"];
    if (!validRoles.includes(role)) throw new ApiError(400, `Invalid role`);

    const user = await User.findByIdAndUpdate(
        req.params.userId,
        { role },
        { new: true }
    ).select("-googleSub");
    if (!user) throw new ApiError(404, "User not found");

    // Sync RoleAssignment
    if (role === "student") {
        await RoleAssignment.findOneAndDelete({ email: user.email });
    } else {
        await RoleAssignment.findOneAndUpdate(
            { email: user.email },
            { role, assignedBy: req.user.id },
            { upsert: true }
        );
    }

    return sendSuccess(res, "User role updated", { user });
});

// PATCH /api/admin/users/:userId/deactivate
const deactivateUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.params.userId,
        { isActive: false },
        { new: true }
    ).select("-googleSub");
    if (!user) throw new ApiError(404, "User not found");
    return sendSuccess(res, "User deactivated", { user });
});

// PATCH /api/admin/users/:userId/activate
const activateUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.params.userId,
        { isActive: true },
        { new: true }
    ).select("-googleSub");
    if (!user) throw new ApiError(404, "User not found");
    return sendSuccess(res, "User activated", { user });
});

// GET /api/admin/applications
// Full application list with all filters
const listAllApplications = asyncHandler(async (req, res) => {
    const { status, branch, course, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (branch) filter.branch = branch;
    if (course) filter.course = course;
    if (search) filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
    ];

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [applications, total] = await Promise.all([
        Application.find(filter)
            .populate("student", "name email picture")
            .populate("reviewedBy", "name email")
            .populate("verifiedBy", "name email")
            .populate("admittedBy", "name email")
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

// GET /api/admin/data-matching
// Match student list entries against actual User accounts
const dataMatching = asyncHandler(async (req, res) => {
    const { listId } = req.query;
    const filter = listId ? { _id: listId } : {};

    const lists = await StudentList.find(filter).lean();
    const results = await Promise.all(
        lists.map(async (list) => {
            const enriched = await Promise.all(
                list.students.map(async (s) => {
                    const user = s.email
                        ? await User.findOne({ email: s.email.toLowerCase() }).select("name email role isActive")
                        : null;
                    const app = user
                        ? await Application.findOne({ student: user._id }).select("status progressBar branch course")
                        : null;
                    return {
                        ...s,
                        matchedUser: user || null,
                        application: app || null,
                    };
                })
            );
            return { ...list, students: enriched };
        })
    );

    return sendSuccess(res, "Data matching complete", { lists: results });
});

// DELETE /api/admin/applications/:applicationId
// Hard delete an application (admin only)
const deleteApplication = asyncHandler(async (req, res) => {
    const app = await Application.findByIdAndDelete(req.params.applicationId);
    if (!app) throw new ApiError(404, "Application not found");

    await Document.deleteMany({ application: app._id });
    await Payment.findOneAndDelete({ application: app._id });

    return sendSuccess(res, "Application deleted");
});

export {
    getOverview,
    listUsers,
    setUserRole,
    deactivateUser,
    activateUser,
    listAllApplications,
    dataMatching,
    deleteApplication,
};
