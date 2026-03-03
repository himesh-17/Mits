import Application from "../Models/application.model.js";
import User from "../Models/user.model.js";
import Document from "../Models/document.model.js";
import Payment from "../Models/payment.model.js";
import StudentList from "../Models/studentList.model.js";
import RoleAssignment from "../Models/roleAssignment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";

function escapeRegex(value = "") {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
    if (search) {
        const safeSearch = escapeRegex(search);
        filter.$or = [
            { name: { $regex: safeSearch, $options: "i" } },
            { email: { $regex: safeSearch, $options: "i" } },
        ];
    }

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

    const session = await User.startSession();
    let user;
    try {
        await session.withTransaction(async () => {
            user = await User.findByIdAndUpdate(
                req.params.userId,
                { role },
                { new: true, session }
            ).select("-googleSub");
            if (!user) throw new ApiError(404, "User not found");

            if (role === "student") {
                await RoleAssignment.findOneAndDelete({ email: user.email }, { session });
            } else {
                await RoleAssignment.findOneAndUpdate(
                    { email: user.email },
                    { role, assignedBy: req.user.id },
                    { upsert: true, session }
                );
            }
        });
    } finally {
        await session.endSession();
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
    if (search) {
        const safeSearch = escapeRegex(search);
        filter.$or = [
            { fullName: { $regex: safeSearch, $options: "i" } },
            { rollNumber: { $regex: safeSearch, $options: "i" } },
        ];
    }

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

    const normalizedEmails = [...new Set(
        lists
            .flatMap((list) => list.students || [])
            .map((student) => (student.email || "").toLowerCase().trim())
            .filter(Boolean)
    )];

    const users = normalizedEmails.length
        ? await User.find({ email: { $in: normalizedEmails } }).select("name email role isActive")
        : [];
    const emailToUser = new Map(users.map((user) => [user.email.toLowerCase(), user]));

    const userIds = users.map((user) => user._id);
    const applications = userIds.length
        ? await Application.find({ student: { $in: userIds } }).select("student status progressBar branch course")
        : [];
    const studentIdToApp = new Map(applications.map((app) => [String(app.student), app]));

    const results = lists.map((list) => {
        const enriched = (list.students || []).map((student) => {
            const normalizedEmail = (student.email || "").toLowerCase().trim();
            const matchedUser = normalizedEmail ? (emailToUser.get(normalizedEmail) || null) : null;
            const application = matchedUser ? (studentIdToApp.get(String(matchedUser._id)) || null) : null;

            return {
                ...student,
                matchedUser,
                application,
            };
        });

        return { ...list, students: enriched };
    });

    return sendSuccess(res, "Data matching complete", { lists: results });
});

// DELETE /api/admin/applications/:applicationId
// Hard delete an application (admin only)
const deleteApplication = asyncHandler(async (req, res) => {
    const session = await Application.startSession();

    try {
        await session.withTransaction(async () => {
            const app = await Application.findById(req.params.applicationId).session(session);
            if (!app) throw new ApiError(404, "Application not found");

            await Application.deleteOne({ _id: app._id }, { session });
            await Document.deleteMany({ application: app._id }, { session });
            await Payment.deleteMany({ application: app._id }, { session });
        });
    } finally {
        await session.endSession();
    }

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
