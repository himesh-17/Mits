import Application from "../Models/application.model.js";
import Document from "../Models/document.model.js";
import Payment from "../Models/payment.model.js";
import User from "../Models/user.model.js";
import RoleAssignment from "../Models/roleAssignment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { writeAuditLog } from "../utils/auditLog.js";

function escapeRegex(value = "") {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function safeWriteAuditLog(payload) {
    try {
        await writeAuditLog(payload);
    } catch (error) {
        // Keep user-facing flows resilient if audit infrastructure fails.
        console.error("[GeneralOffice] audit log write failed", error?.message || error);
    }
}

function formatRupeeLakhs(amount = 0) {
    const numericAmount = Number(amount || 0);
    const lakhs = numericAmount / 100000;
    return `₹${lakhs.toFixed(1)}L`;
}

function getBranchLabel(branch = "", programApplied = "") {
    const normalizedBranch = String(branch || "").trim().toUpperCase();
    const normalizedProgram = String(programApplied || "").trim().toUpperCase();

    const branchLabelMap = {
        CSE: "Computer Science",
        CS: "Computer Science",
        ECE: "Electronics",
        ET: "Electronics",
        IT: "Computer Applications",
        IOT: "Computer Applications",
        AI: "Computer Applications",
        MECH: "Mechanical",
        CIVIL: "Civil",
    };

    if (normalizedProgram === "BCA") {
        return "Computer Applications";
    }

    return branchLabelMap[normalizedBranch] || normalizedBranch || normalizedProgram || "General";
}

async function countApplicationsByStatuses(statuses = []) {
    if (!Array.isArray(statuses) || statuses.length === 0) return 0;
    return Application.countDocuments({ status: { $in: statuses } });
}

async function countApplicationsByStatus(status) {
    return Application.countDocuments({ status });
}

function buildBranchSummaryRows(applicationRows = [], paymentRows = []) {
    const summaryMap = new Map();

    for (const applicationRow of applicationRows) {
        const branchKey = String(applicationRow?._id || "GENERAL").trim() || "GENERAL";
        const branchLabel = getBranchLabel(branchKey, applicationRow?.programApplied || "");

        summaryMap.set(branchKey, {
            name: branchLabel,
            finalized: Number(applicationRow?.finalized || 0),
            total: Number(applicationRow?.total || 0),
            revenue: 0,
        });
    }

    for (const paymentRow of paymentRows) {
        const branchKey = String(paymentRow?.branch || "GENERAL").trim() || "GENERAL";
        const current = summaryMap.get(branchKey) || {
            name: getBranchLabel(branchKey),
            finalized: 0,
            total: 0,
            revenue: 0,
        };

        current.revenue += Number(paymentRow?.total || 0);
        summaryMap.set(branchKey, current);
    }

    return Array.from(summaryMap.values())
        .map((row) => ({
            name: row.name,
            finalized: Number(row.finalized || 0),
            total: Number(row.total || 0),
            revenue: formatRupeeLakhs(row.revenue || 0),
        }))
        .sort((a, b) => b.total - a.total || b.finalized - a.finalized || a.name.localeCompare(b.name));
}

function humanizeDocStatus(status = "") {
    if (status === "verified") return "Verified";
    if (status === "rejected") return "Rejected";
    if (status === "pending") return "Submitted";
    return "N/A";
}

function normalizeGender(gender = "") {
    const value = String(gender || "").trim().toLowerCase();
    if (!value) return "-";
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDateOnly(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toISOString().slice(0, 10);
}

// GET /api/general-office/applications/:applicationId
const getApplicationDetail = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId)
        .populate("student", "name email picture")
        .populate("reviewedBy", "name email")
        .populate("documents.identityProof", "docType fileName fileUrl status")
        .populate("documents.tenthMarksheet", "docType fileName fileUrl status")
        .populate("documents.twelfthMarksheet", "docType fileName fileUrl status")
        .populate("documents.entranceScorecard", "docType fileName fileUrl status")
        .populate("documents.categoryCertificate", "docType fileName fileUrl status")
        .populate("documents.domicileCertificate", "docType fileName fileUrl status")
        .populate("documents.abcId", "docType fileName fileUrl status")
        .populate("documents.passportPhoto", "docType fileName fileUrl status")
        .populate("documents.signature", "docType fileName fileUrl status")
        .lean();

    if (!application) {
        throw new ApiError(404, "Application not found");
    }

    const [payment, transferDoc] = await Promise.all([
        Payment.findOne({ application: application._id })
            .populate("verifyingOfficer", "name email")
            .lean(),
        Document.findOne({
            application: application._id,
            docType: "transfer_certificate",
        }).lean(),
    ]);

    const domicileDoc = application?.documents?.domicileCertificate || null;
    const branchDisplayName = getBranchLabel(application.branch, application.programApplied);

    const detail = {
        id: String(application._id),
        applicationRef: `#${String(application._id).slice(-6).toUpperCase()}`,
        fullName: application.fullName || application?.student?.name || "Unknown",
        email: application.email || application?.student?.email || "",
        programApplied: application.programApplied || "-",
        branchDisplayName,
        allottedRound: application.allottedRound || "Admission Round 2024-25",
        status: application.status || "submitted",
        personal: {
            fullName: application.fullName || "-",
            dateOfBirth: formatDateOnly(application.dateOfBirth),
            gender: normalizeGender(application.gender),
            category: application.allottedCategory || application.eligibleCategory || "-",
            phone: application.phone || "-",
            aadhaar: "-",
            city: application.city || "-",
            state: application.state || "-",
        },
        academic: {
            program: application.programApplied || "-",
            branch: branchDisplayName || "-",
            tenthMarks: application.tenthMarks ? `${application.tenthMarks}%` : "-",
            twelfthMarks: application.twelfthMarks ? `${application.twelfthMarks}%` : "-",
            twelfthBoard: application.twelfthBoard || "-",
            passingYear: application.twelfthPassingYear || "-",
            entranceExam: application.entranceExam || "-",
            score: application.entranceScoreOrRank || "-",
        },
        documents: {
            count: Object.values(application.documents || {}).filter(Boolean).length,
            domicile: {
                label: "Domicile Certificate",
                value: humanizeDocStatus(domicileDoc?.status),
                fileName: domicileDoc?.fileName || "",
                fileUrl: domicileDoc?.fileUrl || "",
            },
            transferCertificate: {
                label: "Transfer Certificate",
                value: transferDoc ? humanizeDocStatus(transferDoc.status) : "N/A",
                fileName: transferDoc?.fileName || "",
                fileUrl: transferDoc?.fileUrl || "",
            },
        },
        payment: {
            amount: Number(payment?.amount || 0),
            upiId: payment?.upiId || "-",
            transactionId: payment?.transactionId || payment?.utsId || "-",
            status: payment?.status || "pending",
            verifiedBy: payment?.verifyingOfficer?.name || "-",
        },
    };

    return sendSuccess(res, "Application detail fetched", detail);
});

// GET /api/general-office/dashboard/stats
const getDashboardStats = asyncHandler(async (req, res) => {
    const [awaitingVerification, documentsPending, finalApprovals, totalActiveApps] = await Promise.all([
        countApplicationsByStatuses(["submitted", "under_review"]),
        countApplicationsByStatuses(["documents_pending", "re_upload"]),
        countApplicationsByStatuses(["payment_verified", "admitted"]),
        Application.countDocuments({ status: { $nin: ["draft", "rejected"] } }),
    ]);

    return sendSuccess(res, "Dashboard statistics fetched", {
        awaitingVerification,
        documentsPending,
        finalApprovals,
        totalActiveApps,
    });
});

// GET /api/general-office/reports
const getReportsOverview = asyncHandler(async (req, res) => {
    const [totalApplications, finalized, awaitingApproval, statusCounts, branchApplicationAgg, verifiedPaymentAgg, recentFinalizedAdmissions] = await Promise.all([
        Application.countDocuments({}),
        countApplicationsByStatus("admitted"),
        countApplicationsByStatuses([
            "submitted",
            "under_review",
            "documents_pending",
            "re_upload",
            "payment_pending",
            "payment_submitted",
        ]),
        Application.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]),
        Application.aggregate([
            {
                $match: {
                    branch: { $ne: "" },
                },
            },
            {
                $group: {
                    _id: "$branch",
                    total: { $sum: 1 },
                    finalized: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "admitted"] }, 1, 0],
                        },
                    },
                    programApplied: { $first: "$programApplied" },
                },
            },
            { $sort: { total: -1, finalized: -1, _id: 1 } },
        ]),
        Payment.aggregate([
            {
                $match: {
                    status: "verified",
                },
            },
            {
                $lookup: {
                    from: "applications",
                    localField: "application",
                    foreignField: "_id",
                    as: "application",
                },
            },
            { $unwind: "$application" },
            {
                $group: {
                    _id: "$application.branch",
                    total: { $sum: "$amount" },
                },
            },
        ]),
        Application.find({ status: "admitted" })
            .populate("student", "name email picture")
            .sort({ admittedAt: -1, updatedAt: -1, createdAt: -1 })
            .limit(5)
            .lean(),
    ]);

    const paymentVerifiedCount = statusCounts.reduce((sum, row) => {
        const status = String(row?._id || "").trim();
        const count = Number(row?.count || 0);
        if (status === "payment_verified") return sum + count;
        return sum;
    }, 0);

    const revenueTotal = verifiedPaymentAgg.reduce((sum, row) => sum + Number(row?.total || 0), 0);

    const branchSummary = buildBranchSummaryRows(branchApplicationAgg, verifiedPaymentAgg);

    const statusBreakdown = {
        paymentPending: Number(await countApplicationsByStatuses(["payment_pending", "payment_submitted"])),
        underReview: Number(await countApplicationsByStatus("under_review")),
        finalized: Number(finalized),
    };

    return sendSuccess(res, "Reports fetched", {
        totalApplications: Number(totalApplications || 0),
        finalized: Number(finalized || 0),
        awaitingApproval: Number(awaitingApproval || 0),
        revenueCollected: formatRupeeLakhs(revenueTotal),
        revenueCollectedRaw: revenueTotal,
        paymentVerifiedCount,
        branchSummary,
        statusBreakdown,
        recentlyFinalized: recentFinalizedAdmissions.map((application) => ({
            id: String(application?._id),
            name: application?.student?.name || application?.fullName || "Unknown",
            email: application?.student?.email || application?.email || "",
            date: application?.admittedAt || application?.updatedAt || application?.createdAt || null,
        })),
    });
});

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

    const applicationIds = applications.map((application) => application._id);
    const payments = applicationIds.length > 0
        ? await Payment.find({ application: { $in: applicationIds } }).lean()
        : [];
    const paymentMap = new Map(payments.map((payment) => [String(payment.application), payment]));

    const applicationsWithPayments = applications.map((application) => {
        const payment = paymentMap.get(String(application._id));

        return {
            ...application.toObject(),
            branchDisplayName: getBranchLabel(application.branch, application.programApplied),
            payment: payment
                ? {
                    status: payment.status,
                    amount: Number(payment.amount || 0),
                    paymentMode: payment.paymentMode || "",
                }
                : null,
        };
    });

    return sendSuccess(res, "Applications fetched", {
        applications: applicationsWithPayments,
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

    const previousStatus = app.status;

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

    const auditActionLabelMap = {
        approve: "APPLICATION_APPROVED",
        reject: "APPLICATION_REJECTED",
        re_upload: "APPLICATION_REQUEST_REUPLOAD",
    };

    await safeWriteAuditLog({
        req,
        actionLabel: auditActionLabelMap[action] || "APPLICATION_REVIEW_UPDATED",
        actionTone: action === "approve" ? "green" : "slate",
        module: "general-office",
        entityType: "application",
        entityId: app._id,
        entityRef: `Application #${String(app._id).slice(-6).toUpperCase()}`,
        fromStatus: previousStatus,
        toStatus: app.status,
        notes: remarks || "",
    });

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

    const existingUser = await User.findOne({ email: email.toLowerCase() }).select("role email");
    const previousRole = existingUser?.role || "student";

    const assignment = await RoleAssignment.findOneAndUpdate(
        { email: email.toLowerCase() },
        { email: email.toLowerCase(), role, branch: branch || "", assignedBy: req.user.id },
        { upsert: true, returnDocument: "after" }
    );

    // Update the user's role if they already exist
    await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { role },
    );

    await safeWriteAuditLog({
        req,
        actionLabel: "ROLE_ASSIGNED",
        module: "general-office",
        entityType: "user",
        entityRef: `User ${email.toLowerCase()}`,
        fromStatus: previousRole,
        toStatus: role,
        notes: branch ? `Branch: ${branch}` : "",
    });

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

    await safeWriteAuditLog({
        req,
        actionLabel: "ROLE_REMOVED",
        module: "general-office",
        entityType: "user",
        entityRef: `User ${email}`,
        fromStatus: deletedAssignment.role,
        toStatus: "student",
        actionTone: "slate",
    });

    return sendSuccess(res, "Role assignment removed");
});

export {
    getDashboardStats,
    getReportsOverview,
    filterApplications,
    getApplicationDetail,
    getProgressOverview,
    reviewApplication,
    listRoleAssignments,
    assignRole,
    removeRoleAssignment,
};
