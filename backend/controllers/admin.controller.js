import Application from "../Models/application.model.js";
import User from "../Models/user.model.js";
import Document from "../Models/document.model.js";
import Payment from "../Models/payment.model.js";
import StudentList from "../Models/studentList.model.js";
import RoleAssignment from "../Models/roleAssignment.model.js";
import AuditLog from "../Models/auditLog.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { writeAuditLog } from "../utils/auditLog.js";

function escapeRegex(value = "") {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const STUDENT_DATA_UI_STATUS_TO_DB = {
    "Draft": ["draft"],
    "Submitted": ["submitted"],
    "Under Review": ["under_review"],
    "Documents Verified": ["documents_verified"],
    "Document Rejected": ["re_upload"],
    "Payment Pending": ["payment_pending", "payment_submitted"],
    "Payment Verified": ["payment_verified"],
    "Payment Rejected": [],
    "Approval Pending": ["under_review"],
    "Finalized": ["admitted"],
    "Rejected": ["rejected"],
    "Withdrawn": [],
};

function parsePage(value, fallback = 1) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1) return fallback;
    return parsed;
}

function parseLimit(value, fallback = 20, max = 100) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1) return fallback;
    return Math.min(parsed, max);
}

function normalizeProgram(value = "") {
    return String(value).trim().toUpperCase();
}

function mapRawStatusToUi(rawStatus = "") {
    switch (rawStatus) {
        case "admitted":
            return "Finalized";
        case "rejected":
            return "Rejected";
        case "draft":
            return "Draft";
        case "submitted":
            return "Submitted";
        case "under_review":
            return "Under Review";
        case "documents_verified":
            return "Documents Verified";
        case "re_upload":
            return "Document Rejected";
        case "payment_verified":
            return "Payment Verified";
        case "payment_pending":
        case "payment_submitted":
            return "Payment Pending";
        default:
            return "Draft";
    }
}

function mapRawStatusToDashboardBucket(rawStatus = "") {
    if (rawStatus === "admitted") return "finalized";
    if (rawStatus === "rejected") return "rejected";
    if (rawStatus === "draft") return "draft";
    return "pending";
}

function buildStudentId(applicationId) {
    const normalized = String(applicationId || "").trim();
    if (!normalized) return "#N/A";
    return `#${normalized.slice(-6).toUpperCase()}`;
}

function buildStudentDisplayName(application, student) {
    const fullName = String(application.fullName || "").trim();
    if (fullName) return fullName;
    const userName = String(student?.name || "").trim();
    if (userName) return userName;
    return "Unknown Student";
}

function buildStudentEmail(application, student) {
    const appEmail = String(application.email || "").trim().toLowerCase();
    if (appEmail) return appEmail;
    const userEmail = String(student?.email || "").trim().toLowerCase();
    if (userEmail) return userEmail;
    return "-";
}

function buildProgram(application) {
    const programApplied = String(application.programApplied || "").trim();
    if (programApplied) return normalizeProgram(programApplied);

    const branch = String(application.branch || "").trim();
    if (branch) return normalizeProgram(branch);

    return "GENERAL";
}

function normalizeFieldKey(value = "") {
    return String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

function getFieldValue(row = {}, candidates = []) {
    const entries = Object.entries(row || {});
    if (entries.length === 0) return "";

    const keyMap = new Map(entries.map(([k, v]) => [normalizeFieldKey(k), v]));

    for (const candidate of candidates) {
        const value = keyMap.get(normalizeFieldKey(candidate));
        if (value !== undefined && value !== null && String(value).trim() !== "") {
            return value;
        }
    }

    return "";
}

function parsePossibleDate(value) {
    if (!value && value !== 0) return null;

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
        // Excel serial date to JS date.
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    const parsed = new Date(String(value));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const VALID_BRANCHES = new Set(["CSE", "EE", "ECE", "MECH", "CIVIL", "IOT", "IT", "ET", "AI"]);

function detectProgramAndBranch(rawCourse = "") {
    const normalized = String(rawCourse).trim().toUpperCase();
    if (!normalized) {
        return { programApplied: "GENERAL", branch: "" };
    }

    let programApplied = normalized;

    if (normalized.includes("BTECH") || normalized.includes("B.TECH") || normalized.includes("B E") || normalized.includes("BE")) {
        programApplied = "BTECH";
    } else if (normalized.includes("MTECH") || normalized.includes("M.TECH")) {
        programApplied = "MTECH";
    } else if (normalized.includes("MBA")) {
        programApplied = "MBA";
    } else if (normalized.includes("MCA")) {
        programApplied = "MCA";
    } else if (normalized.includes("BCA")) {
        programApplied = "BCA";
    } else if (normalized.includes("BBA")) {
        programApplied = "BBA";
    } else if (normalized.includes("BSC") || normalized.includes("B.SC")) {
        programApplied = "BSC";
    } else if (normalized.includes("MSC") || normalized.includes("M.SC")) {
        programApplied = "MSC";
    }

    const branchToken = ["CSE", "EE", "ECE", "MECH", "CIVIL", "IOT", "IT", "ET", "AI"]
        .find((branch) => normalized.includes(branch));

    const branch = branchToken && VALID_BRANCHES.has(branchToken)
        ? branchToken
        : "";

    return { programApplied, branch };
}

function mapImportedStatus(rawStatus = "") {
    const status = String(rawStatus).trim().toLowerCase();

    if (!status) return "under_review";
    if (status.includes("final") || status.includes("admit") || status.includes("approved")) return "admitted";
    if (status.includes("payment") && status.includes("verified")) return "payment_verified";
    if (status.includes("payment") && status.includes("pending")) return "payment_pending";
    if (status.includes("document") && status.includes("verified")) return "documents_verified";
    if (status.includes("reject")) return "rejected";
    if (status.includes("draft")) return "draft";
    if (status.includes("submit")) return "submitted";
    if (status.includes("pending") || status.includes("review")) return "under_review";

    return "under_review";
}

function buildImportGoogleSub(email) {
    return `import-${String(email).toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
}

function monthKey(date) {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date) {
    return date.toLocaleDateString("en-GB", {
        month: "short",
        year: "2-digit",
    });
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

// GET /api/admin/dashboard
// Dashboard specific metrics + chart + recent activity for admin UI
const getDashboard = asyncHandler(async (req, res) => {
    const recentLimit = parseLimit(req.query.recentLimit, 6, 20);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalApplications, uploadedToday, statusAgg, recentApplications] = await Promise.all([
        Application.countDocuments({}),
        Application.countDocuments({ createdAt: { $gte: todayStart } }),
        Application.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        Application.find({})
            .populate("student", "name email")
            .sort({ updatedAt: -1, createdAt: -1 })
            .limit(recentLimit)
            .lean(),
    ]);

    const bucket = {
        finalized: 0,
        pending: 0,
        rejected: 0,
        draft: 0,
    };

    for (const row of statusAgg) {
        const bucketKey = mapRawStatusToDashboardBucket(row?._id);
        bucket[bucketKey] += row?.count || 0;
    }

    const recentActivity = recentApplications.map((application) => {
        const student = application.student || null;
        const bucketStatus = mapRawStatusToDashboardBucket(application.status);

        return {
            id: buildStudentId(application._id),
            name: buildStudentDisplayName(application, student),
            course: buildProgram(application),
            status: bucketStatus === "finalized" ? "approved" : bucketStatus,
            date: new Date(application.updatedAt || application.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }),
        };
    });

    return sendSuccess(res, "Dashboard data fetched", {
        cards: {
            totalApplications,
            uploadedToday,
            pendingVerifications: bucket.pending,
            finalized: bucket.finalized,
        },
        breakdown: {
            finalized: bucket.finalized,
            pending: bucket.pending,
            rejected: bucket.rejected,
            draft: bucket.draft,
            total: totalApplications,
        },
        recentActivity,
    });
});

// GET /api/admin/reports
// Detailed analytics payload for admin reports page
const getReports = asyncHandler(async (req, res) => {
    const now = new Date();
    const startMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1, 0, 0, 0));

    const monthBuckets = [];
    for (let i = 0; i < 6; i += 1) {
        const d = new Date(Date.UTC(startMonth.getUTCFullYear(), startMonth.getUTCMonth() + i, 1));
        monthBuckets.push({
            key: monthKey(d),
            label: monthLabel(d),
            applications: 0,
        });
    }

    const [
        totalApplications,
        finalized,
        statusAgg,
        timelineAgg,
        programAgg,
        categoryAgg,
        revenueAgg,
    ] = await Promise.all([
        Application.countDocuments({}),
        Application.countDocuments({ status: "admitted" }),
        Application.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        Application.aggregate([
            { $match: { createdAt: { $gte: startMonth } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
        ]),
        Application.aggregate([
            {
                $project: {
                    program: {
                        $toUpper: {
                            $trim: {
                                input: {
                                    $ifNull: ["$programApplied", "$branch"],
                                },
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    program: {
                        $cond: [
                            { $eq: ["$program", ""] },
                            "GENERAL",
                            "$program",
                        ],
                    },
                },
            },
            { $group: { _id: "$program", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
            { $limit: 6 },
        ]),
        Application.aggregate([
            {
                $project: {
                    category: {
                        $toUpper: {
                            $trim: {
                                input: {
                                    $ifNull: ["$category", "GENERAL"],
                                },
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    category: {
                        $cond: [
                            { $eq: ["$category", ""] },
                            "GENERAL",
                            "$category",
                        ],
                    },
                },
            },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
            { $limit: 3 },
        ]),
        Payment.aggregate([
            { $match: { status: "verified" } },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" },
                },
            },
        ]),
    ]);

    const statusBreakdown = {
        finalized: 0,
        payment_pending: 0,
        payment_rejected: 0,
        draft: 0,
    };

    for (const row of statusAgg) {
        const raw = String(row?._id || "").trim();
        const count = row?.count || 0;

        if (raw === "admitted") {
            statusBreakdown.finalized += count;
            continue;
        }

        if (["payment_pending", "payment_submitted", "payment_verified"].includes(raw)) {
            statusBreakdown.payment_pending += count;
            continue;
        }

        if (raw === "rejected") {
            statusBreakdown.payment_rejected += count;
            continue;
        }

        if (raw === "draft") {
            statusBreakdown.draft += count;
        }
    }

    const timelineMap = new Map(monthBuckets.map((item) => [item.key, item]));
    for (const row of timelineAgg) {
        const key = `${row?._id?.year}-${String(row?._id?.month || "").padStart(2, "0")}`;
        const bucket = timelineMap.get(key);
        if (!bucket) continue;
        bucket.applications = row?.count || 0;
    }

    const conversionRate = totalApplications > 0
        ? Math.round((finalized / totalApplications) * 100)
        : 0;

    const revenue = Number(revenueAgg?.[0]?.total || 0);

    const programDistribution = programAgg.map((row) => ({
        program: row?._id || "GENERAL",
        applications: row?.count || 0,
    }));

    const categoryDistributionRaw = categoryAgg.map((row) => ({
        category: row?._id || "GENERAL",
        value: row?.count || 0,
    }));

    const categoryDistribution = categoryDistributionRaw.length > 0
        ? categoryDistributionRaw
        : [{ category: "GENERAL", value: totalApplications }];

    return sendSuccess(res, "Reports fetched", {
        cards: {
            totalApplications,
            finalized,
            conversionRate,
            revenue,
        },
        applicationsOverTime: monthBuckets,
        programDistribution,
        categoryDistribution,
        statusBreakdown,
    });
});

// GET /api/admin/student-data
// Paginated student data table for admin UI with secure allow-list filtering
const listStudentData = asyncHandler(async (req, res) => {
    const page = parsePage(req.query.page, 1);
    const limit = parseLimit(req.query.limit, 20, 100);
    const skip = (page - 1) * limit;

    const statusFilter = String(req.query.status || "All Statuses").trim();
    const programFilter = normalizeProgram(String(req.query.program || "All Programs"));
    const search = String(req.query.search || "").trim();

    const filter = {};

    if (statusFilter && statusFilter !== "All Statuses") {
        const mappedStatuses = STUDENT_DATA_UI_STATUS_TO_DB[statusFilter];
        if (!Array.isArray(mappedStatuses)) {
            throw new ApiError(400, "Invalid status filter");
        }

        if (mappedStatuses.length === 0) {
            return sendSuccess(res, "Student data fetched", {
                items: [],
                total: 0,
                page,
                pages: 0,
            });
        }

        filter.status = { $in: mappedStatuses };
    }

    if (programFilter && programFilter !== "ALL PROGRAMS") {
        const safeProgram = escapeRegex(programFilter);
        filter.$or = [
            { programApplied: { $regex: `^${safeProgram}$`, $options: "i" } },
            { branch: { $regex: `^${safeProgram}$`, $options: "i" } },
        ];
    }

    if (search) {
        const safeSearch = escapeRegex(search);
        const searchClause = {
            $or: [
                { fullName: { $regex: safeSearch, $options: "i" } },
                { email: { $regex: safeSearch, $options: "i" } },
                { programApplied: { $regex: safeSearch, $options: "i" } },
                { branch: { $regex: safeSearch, $options: "i" } },
            ],
        };

        if (filter.$and) {
            filter.$and.push(searchClause);
        } else {
            const existing = { ...filter };
            Object.keys(filter).forEach((key) => delete filter[key]);
            filter.$and = [existing, searchClause];
        }
    }

    const [applications, total] = await Promise.all([
        Application.find(filter)
            .populate("student", "name email")
            .sort({ updatedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Application.countDocuments(filter),
    ]);

    const items = applications.map((application) => {
        const student = application.student || null;

        return {
            id: buildStudentId(application._id),
            name: buildStudentDisplayName(application, student),
            email: buildStudentEmail(application, student),
            program: buildProgram(application),
            branch: normalizeProgram(application.branch || "GENERAL"),
            status: mapRawStatusToUi(application.status),
            date: new Date(application.updatedAt || application.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }),
        };
    });

    return sendSuccess(res, "Student data fetched", {
        items,
        total,
        page,
        pages: Math.ceil(total / limit),
    });
});

// GET /api/admin/audit-logs
// List system activity logs for admin panel
const listAuditLogs = asyncHandler(async (req, res) => {
    const normalizedPage = parsePage(req.query.page, 1);
    const normalizedLimit = parseLimit(req.query.limit, 20, 100);
    const skip = (normalizedPage - 1) * normalizedLimit;

    const filter = {};
    const actionLabel = String(req.query.actionLabel || "").trim();
    const department = String(req.query.department || "").trim();
    const search = String(req.query.search || "").trim();

    if (actionLabel) {
        filter.actionLabel = actionLabel.toUpperCase();
    }

    if (department) {
        filter.department = department;
    }

    if (search) {
        const safeSearch = escapeRegex(search);
        filter.$or = [
            { actorName: { $regex: safeSearch, $options: "i" } },
            { actorRoleLabel: { $regex: safeSearch, $options: "i" } },
            { entityRef: { $regex: safeSearch, $options: "i" } },
            { actionLabel: { $regex: safeSearch, $options: "i" } },
        ];
    }

    const [logs, total] = await Promise.all([
        AuditLog.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(normalizedLimit)
            .lean(),
        AuditLog.countDocuments(filter),
    ]);

    return sendSuccess(res, "Audit logs fetched", {
        logs,
        total,
        page: normalizedPage,
        pages: Math.ceil(total / normalizedLimit),
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

    let user = await User.findById(req.params.userId).select("-googleSub");
    if (!user) throw new ApiError(404, "User not found");

    const previousRole = user.role;
    user.role = role;
    await user.save();

    if (role === "student") {
        await RoleAssignment.findOneAndDelete({ email: user.email });
    } else {
        await RoleAssignment.findOneAndUpdate(
            { email: user.email },
            { role, assignedBy: req.user.id },
            { upsert: true }
        );
    }

    await writeAuditLog({
        req,
        actionLabel: "USER_ROLE_UPDATED",
        module: "admin",
        entityType: "user",
        entityId: user._id,
        entityRef: `User ${user.email}`,
        fromStatus: previousRole,
        toStatus: role,
        notes: `Role changed for ${user.email}`,
    });

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

    await writeAuditLog({
        req,
        actionLabel: "USER_DEACTIVATED",
        module: "admin",
        entityType: "user",
        entityId: user._id,
        entityRef: `User ${user.email}`,
        fromStatus: "ACTIVE",
        toStatus: "INACTIVE",
        actionTone: "slate",
    });

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

    await writeAuditLog({
        req,
        actionLabel: "USER_ACTIVATED",
        module: "admin",
        entityType: "user",
        entityId: user._id,
        entityRef: `User ${user.email}`,
        fromStatus: "INACTIVE",
        toStatus: "ACTIVE",
    });

    return sendSuccess(res, "User activated", { user });
});

// GET /api/admin/applications
// Full application list with all filters
const listAllApplications = asyncHandler(async (req, res) => {
    const { status, branch, course, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (branch) filter.branch = branch;
    if (course) filter.programApplied = course;
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
        ? await Application.find({ student: { $in: userIds } }).select("student status progressBar branch programApplied")
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
    const app = await Application.findById(req.params.applicationId);
    if (!app) throw new ApiError(404, "Application not found");

    const previousStatus = app.status;

    await Application.deleteOne({ _id: app._id });
    await Document.deleteMany({ application: app._id });
    await Payment.deleteMany({ application: app._id });

    await writeAuditLog({
        req,
        actionLabel: "APPLICATION_DELETED",
        module: "admin",
        entityType: "application",
        entityId: app._id,
        entityRef: `Application #${String(app._id).slice(-6).toUpperCase()}`,
        fromStatus: previousStatus,
        toStatus: "DELETED",
        actionTone: "slate",
    });

    return sendSuccess(res, "Application deleted");
});

// POST /api/admin/bulk-enrollment
// Import mixed-course student/application rows from parsed Excel payload.
const bulkEnrollmentImport = asyncHandler(async (req, res) => {
    const directRows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    const fileBatches = Array.isArray(req.body?.files) ? req.body.files : [];

    let rows = [...directRows];

    if (fileBatches.length) {
        for (const fileBatch of fileBatches) {
            const batchRows = Array.isArray(fileBatch?.rows) ? fileBatch.rows : [];
            const sourceFile = String(fileBatch?.fileName || "").trim();

            for (const row of batchRows) {
                if (row && typeof row === "object") {
                    rows.push({
                        ...row,
                        __sourceFile: sourceFile,
                    });
                }
            }
        }
    }

    if (!Array.isArray(rows)) {
        throw new ApiError(400, "rows or files payload is required");
    }

    if (rows.length === 0) {
        return sendSuccess(res, "No rows provided", {
            processed: 0,
            usersCreated: 0,
            usersUpdated: 0,
            applicationsCreated: 0,
            applicationsUpdated: 0,
            skipped: 0,
        });
    }

    if (rows.length > 20000) {
        throw new ApiError(400, "rows limit exceeded (max 20000)");
    }

    let processed = 0;
    let skipped = 0;
    let usersCreated = 0;
    let usersUpdated = 0;
    let applicationsCreated = 0;
    let applicationsUpdated = 0;

    for (const row of rows) {
        if (!row || typeof row !== "object") {
            skipped += 1;
            continue;
        }

        const rawName = getFieldValue(row, [
            "Student Name",
            "Name",
            "Full Name",
            "Candidate Name",
            "Applicant Name",
            "Student",
        ]);
        const rawEmail = getFieldValue(row, [
            "Email",
            "Student Email",
            "Mail",
            "E-mail",
            "Email Address",
            "Applicant Email",
        ]);
        const rawCourse = getFieldValue(row, [
            "Program",
            "Course",
            "Program Applied",
            "Course Applied",
            "Branch",
            "Department",
            "Specialization",
            "Stream",
            "Programme",
        ]);
        const rawStatus = getFieldValue(row, [
            "Status",
            "Application Status",
            "Admission Status",
            "Current Status",
        ]);
        const rawDate = getFieldValue(row, [
            "Date",
            "Application Date",
            "Submitted At",
            "Created At",
            "Submission Date",
            "Applied On",
        ]);

        const name = String(rawName || "").trim();
        const email = String(rawEmail || "").trim().toLowerCase();

        if (!name || !email || !email.includes("@")) {
            skipped += 1;
            continue;
        }

        const { programApplied, branch } = detectProgramAndBranch(rawCourse);
        const mappedStatus = mapImportedStatus(rawStatus);
        const importedDate = parsePossibleDate(rawDate) || new Date();

        let user = await User.findOne({ email });
        let userCreatedNow = false;

        if (!user) {
            user = await User.create({
                googleSub: buildImportGoogleSub(email),
                email,
                name,
                role: "student",
                emailVerified: false,
                isActive: true,
            });
            userCreatedNow = true;
            usersCreated += 1;
        } else {
            user.name = name || user.name;
            await user.save();
            usersUpdated += 1;
        }

        const existingApplication = await Application.findOne({ student: user._id }).select("_id");

        const progressBar = {
            formFilled: true,
            documentsUploaded: ["submitted", "under_review", "documents_verified", "payment_pending", "payment_verified", "admitted", "rejected"].includes(mappedStatus),
            documentsVerified: ["documents_verified", "payment_pending", "payment_verified", "admitted"].includes(mappedStatus),
            paymentDone: ["payment_verified", "admitted"].includes(mappedStatus),
            admissionConfirmed: mappedStatus === "admitted",
        };

        await Application.findOneAndUpdate(
            { student: user._id },
            {
                $set: {
                    fullName: name,
                    email,
                    programApplied,
                    branch,
                    status: mappedStatus,
                    progressBar,
                    submittedAt: importedDate,
                    admittedAt: mappedStatus === "admitted" ? importedDate : null,
                    importSource: String(row.__sourceFile || "").trim(),
                },
                $setOnInsert: {
                    fatherName: "",
                    motherName: "",
                },
            },
            { upsert: true, new: true }
        );

        if (existingApplication) {
            applicationsUpdated += 1;
        } else {
            applicationsCreated += 1;
        }

        // If imported user was just created and no app could be formed, count as skipped safeguard.
        if (userCreatedNow && !programApplied) {
            skipped += 1;
        }

        processed += 1;
    }

    await writeAuditLog({
        req,
        actionLabel: "BULK_ENROLLMENT_IMPORTED",
        module: "admin",
        entityType: "import",
        entityRef: `Rows ${rows.length}`,
        toStatus: "COMPLETED",
        metadata: {
            processed,
            usersCreated,
            usersUpdated,
            applicationsCreated,
            applicationsUpdated,
            skipped,
        },
    });

    return sendSuccess(res, "Bulk enrollment import completed", {
        processed,
        usersCreated,
        usersUpdated,
        applicationsCreated,
        applicationsUpdated,
        skipped,
    });
});

export {
    getOverview,
    getDashboard,
    getReports,
    listStudentData,
    listAuditLogs,
    listUsers,
    setUserRole,
    deactivateUser,
    activateUser,
    listAllApplications,
    dataMatching,
    deleteApplication,
    bulkEnrollmentImport,
};
