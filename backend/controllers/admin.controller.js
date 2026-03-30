import Application from "../Models/application.model.js";
import User from "../Models/user.model.js";
import Document from "../Models/document.model.js";
import Payment from "../Models/payment.model.js";
import StudentList from "../Models/studentList.model.js";
import RoleAssignment from "../Models/roleAssignment.model.js";
import AuditLog from "../Models/auditLog.model.js";
import AdmissionRound from "../Models/admissionRound.model.js";
import RoundCandidate from "../Models/roundCandidate.model.js";
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
    if (appEmail) {
        if (appEmail.endsWith("@import.mits.local")) return "-";
        return appEmail;
    }
    const userEmail = String(student?.email || "").trim().toLowerCase();
    if (userEmail) {
        if (userEmail.endsWith("@import.mits.local")) return "-";
        return userEmail;
    }
    return "-";
}

function buildProgram(application) {
    const programApplied = String(application.programApplied || "").trim();
    if (programApplied) return normalizeProgram(programApplied);

    const branch = String(application.branch || "").trim();
    if (branch) return normalizeProgram(branch);

    return "-";
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

    const asString = String(value).trim();

    // Handle common dd-mm-yyyy / dd/mm/yyyy formats from spreadsheet exports.
    const dayFirstMatch = asString.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
    if (dayFirstMatch) {
        const day = Number(dayFirstMatch[1]);
        const month = Number(dayFirstMatch[2]);
        const yearRaw = Number(dayFirstMatch[3]);
        const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;
        const date = new Date(year, month - 1, day);
        if (!Number.isNaN(date.getTime())) {
            return date;
        }
    }

    const parsed = new Date(asString);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const VALID_BRANCHES = new Set(["CSE", "EE", "ECE", "MECH", "CIVIL", "IOT", "IT", "ET", "AI"]);

function detectProgramAndBranch(rawProgram = "", rawBranch = "", rawCourse = "") {
    const combinedRaw = [rawProgram, rawBranch, rawCourse]
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .join(" ");

    const normalized = combinedRaw.toUpperCase();
    if (!normalized) {
        return { programApplied: "", branch: "" };
    }

    // Match using tokenized words to avoid false positives like "admitted" => "IT".
    const normalizedForTokens = normalized.replace(/[^A-Z0-9]+/g, " ").trim();
    const tokens = new Set(normalizedForTokens.split(/\s+/).filter(Boolean));

    let programApplied = "";

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
        .find((branch) => tokens.has(branch));

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

function cleanImportText(value = "") {
    return String(value || "").trim();
}

function mapImportGender(rawGender = "") {
    const normalized = cleanImportText(rawGender).toUpperCase();
    if (normalized === "M" || normalized === "MALE") return "male";
    if (normalized === "F" || normalized === "FEMALE") return "female";
    if (normalized === "O" || normalized === "OTHER") return "other";
    return "";
}

function toUiGender(rawGender = "", dbGender = "") {
    const normalizedRaw = cleanImportText(rawGender).toUpperCase();
    if (normalizedRaw) return normalizedRaw;
    if (dbGender === "male") return "M";
    if (dbGender === "female") return "F";
    if (dbGender === "other") return "OTHER";
    return "-";
}

function buildImportGoogleSub(email) {
    return `import-${String(email).toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
}

const SEEDED_DEMO_EMAILS = [
    "arjun.mehta@gmail.com",
    "riya.sharma@gmail.com",
    "vivek.gupta@gmail.com",
    "nisha.iyer@gmail.com",
    "karan.singh@gmail.com",
    "pooja.verma@gmail.com",
    "rahul.jain@gmail.com",
    "tanvi.patel@gmail.com",
    "aman.khan@gmail.com",
    "sneha.roy@gmail.com",
    "test_upload@example.com",
];

function normalizeIdentifier(value = "") {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 64);
}

function normalizeNameKey(value = "") {
    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
    .trim()
    .slice(0, 120);
}

function normalizePhoneKey(value = "") {
    const digits = String(value || "").replace(/\D/g, "");
    return digits.length >= 10 ? digits.slice(-10) : digits;
}

function parseRoundCandidateRows(rows = []) {
    const candidates = [];
    let skipped = 0;

    for (const row of rows) {
        if (!row || typeof row !== "object") {
            skipped += 1;
            continue;
        }

        const studentName = cleanImportText(getFieldValue(row, [
            "Student Name",
            "Name",
            "Full Name",
            "Candidate Name",
            "Applicant Name",
            "Student",
        ]));
        const fatherName = cleanImportText(getFieldValue(row, [
            "Father",
            "Father Name",
            "Father's Name",
            "Fathers Name",
            "Guardian Name",
        ]));
        const motherName = cleanImportText(getFieldValue(row, [
            "Mother",
            "Mother Name",
            "Mother's Name",
            "Mothers Name",
        ]));

        if (!studentName || !fatherName || !motherName) {
            skipped += 1;
            continue;
        }

        const rawProgram = getFieldValue(row, ["Program", "Program Name", "Program Applied", "Programme"]);
        const rawBranch = getFieldValue(row, ["Branch", "Alloted Branch", "Allotted Branch", "Department", "Specialization", "Stream"]);
        const rawCourse = getFieldValue(row, ["Course", "Course Name", "Course Applied"]);
        const { programApplied, branch } = detectProgramAndBranch(rawProgram, rawBranch, rawCourse);

        const rawStudentPhone = getFieldValue(row, ["PhoneNo", "Phone No", "Phone Number", "Mobile", "Mobile No", "Student Phone", "Student Contact"]);
        const rawFatherPhone = getFieldValue(row, ["Father Phone", "Father Mobile", "Guardian Phone", "Father Contact", "Father Phone No"]);
        const rawMotherPhone = getFieldValue(row, ["Mother Phone", "Mother Mobile", "Mother Contact", "Mother Phone No"]);
        const rawRank = getFieldValue(row, ["Rank", "Merit Rank", "CRL", "AIR", "All India Rank"]);
        const rawMarks = getFieldValue(row, ["Marks", "Score", "Merit Marks", "Percentile", "Percentage"]);
        const rawEligibleCategory = getFieldValue(row, ["Eligible Category", "Category", "EligibleCategory", "Cat"]);
        const rawAllottedCategory = getFieldValue(row, ["Alloted Category", "Allotted Category", "AllotedCategory", "AllottedCategory"]);
        const rawDomicile = getFieldValue(row, ["Domicile", "Domicile Status", "Home State"]);
        const rawGender = getFieldValue(row, ["Gender", "Sex"]);
        const rawEws = getFieldValue(row, ["EWS", "Ews", "EWS Status"]);
        const rawAllottedRound = getFieldValue(row, ["Alloted Round", "Allotted Round", "Round", "Counselling Round"]);
        const rawFinalStatus = getFieldValue(row, ["Final Status", "Status", "Result"]);

        candidates.push({
            studentName,
            fatherName,
            motherName,
            studentPhone: cleanImportText(rawStudentPhone),
            fatherPhone: cleanImportText(rawFatherPhone),
            motherPhone: cleanImportText(rawMotherPhone),
            email: String(getFieldValue(row, ["Email", "Email Id", "Student Email", "Mail", "E-mail"]) || "").trim().toLowerCase(),
            rollNumber: cleanImportText(getFieldValue(row, ["Roll Number", "Roll No", "RollNo", "Enrollment No", "Registration Number", "Student ID"])),
            meritRank: cleanImportText(rawRank),
            meritMarks: cleanImportText(rawMarks),
            eligibleCategory: cleanImportText(rawEligibleCategory),
            allottedCategory: cleanImportText(rawAllottedCategory),
            domicileStatus: cleanImportText(rawDomicile),
            genderRaw: cleanImportText(rawGender),
            ewsStatus: cleanImportText(rawEws),
            allottedRound: cleanImportText(rawAllottedRound),
            finalStatus: cleanImportText(rawFinalStatus),
            program: programApplied,
            branch,
            sourceFile: cleanImportText(row.__sourceFile),
            studentNameKey: normalizeNameKey(studentName),
            fatherNameKey: normalizeNameKey(fatherName),
            motherNameKey: normalizeNameKey(motherName),
            studentPhoneKey: normalizePhoneKey(rawStudentPhone),
            fatherPhoneKey: normalizePhoneKey(rawFatherPhone),
            motherPhoneKey: normalizePhoneKey(rawMotherPhone),
        });
    }

    const dedupedMap = new Map();
    for (const item of candidates) {
        const dedupeKey = [
            item.studentNameKey,
            item.fatherNameKey,
            item.motherNameKey,
            item.studentPhoneKey,
            item.fatherPhoneKey,
            item.motherPhoneKey,
        ].join("|");
        dedupedMap.set(dedupeKey, item);
    }

    return {
        candidates: Array.from(dedupedMap.values()),
        skipped,
    };
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

function chunkArray(items = [], size = 500) {
    const chunks = [];
    for (let i = 0; i < items.length; i += size) {
        chunks.push(items.slice(i, i + size));
    }
    return chunks;
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

    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

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

        return {
            id: buildStudentId(application._id),
            rollNo: cleanImportText(application.rollNumber) || "-",
            name: buildStudentDisplayName(application, student),
            program: buildProgram(application),
            status: mapRawStatusToUi(application.status),
            date: new Date(application.submittedAt || application.updatedAt || application.createdAt).toLocaleDateString("en-GB", {
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
                    programRaw: {
                        $ifNull: [
                            "$programApplied",
                            {
                                $ifNull: ["$branch", "GENERAL"],
                            },
                        ],
                    },
                },
            },
            {
                $project: {
                    program: {
                        $toUpper: {
                            $trim: {
                                input: {
                                    $toString: "$programRaw",
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
                                    $toString: {
                                        $ifNull: ["$eligibleCategory", "GENERAL"],
                                    },
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
        payment_verified: 0,
        application_rejected: 0,
        draft: 0,
    };

    for (const row of statusAgg) {
        const raw = String(row?._id || "").trim();
        const count = row?.count || 0;

        if (raw === "admitted") {
            statusBreakdown.finalized += count;
            continue;
        }

        if (["payment_pending", "payment_submitted"].includes(raw)) {
            statusBreakdown.payment_pending += count;
            continue;
        }

        if (raw === "payment_verified") {
            statusBreakdown.payment_verified += count;
            continue;
        }

        if (raw === "rejected") {
            statusBreakdown.application_rejected += count;
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

// GET /api/admin/rounds
const listRounds = asyncHandler(async (_req, res) => {
    const rounds = await AdmissionRound.find({})
        .sort({ startDate: -1, createdAt: -1 })
        .lean();

    const roundIds = rounds.map((round) => round._id);
    let statsByRound = new Map();

    if (roundIds.length > 0) {
        const aggregate = await RoundCandidate.aggregate([
            { $match: { round: { $in: roundIds } } },
            {
                $group: {
                    _id: "$round",
                    totalStudents: { $sum: 1 },
                    matchedStudents: {
                        $sum: {
                            $cond: [{ $ifNull: ["$matchedApplication", false] }, 1, 0],
                        },
                    },
                },
            },
        ]);
        statsByRound = new Map(aggregate.map((row) => [String(row._id), row]));
    }

    const payload = rounds.map((round) => {
        const stats = statsByRound.get(String(round._id));
        const totalStudents = Number(stats?.totalStudents || round.totalStudents || 0);
        const matchedStudents = Number(stats?.matchedStudents || round.matchedStudents || 0);
        return {
            id: String(round._id),
            title: round.title,
            description: round.description || "",
            startDate: round.startDate,
            deadline: round.deadline,
            status: round.status,
            totalStudents,
            matchedStudents,
        };
    });

    return sendSuccess(res, "Rounds fetched", { rounds: payload });
});

// POST /api/admin/rounds
const createRound = asyncHandler(async (req, res) => {
    const title = cleanImportText(req.body?.title);
    const description = cleanImportText(req.body?.description);
    const startDate = parsePossibleDate(req.body?.startDate);
    const deadline = parsePossibleDate(req.body?.deadline);
    const directRows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    const fileBatches = Array.isArray(req.body?.files) ? req.body.files : [];

    if (!title) throw new ApiError(400, "Round title is required");
    if (!startDate || !deadline) throw new ApiError(400, "Valid startDate and deadline are required");
    if (deadline.getTime() <= startDate.getTime()) {
        throw new ApiError(400, "deadline must be after startDate");
    }

    let rows = [...directRows];
    if (fileBatches.length) {
        for (const fileBatch of fileBatches) {
            const batchRows = Array.isArray(fileBatch?.rows) ? fileBatch.rows : [];
            const sourceFile = cleanImportText(fileBatch?.fileName);
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

    if (rows.length === 0) {
        throw new ApiError(400, "At least one Excel/CSV row is required while creating a round");
    }

    const parsed = parseRoundCandidateRows(rows);
    if (parsed.candidates.length === 0) {
        throw new ApiError(400, "No valid student rows found. Ensure Student Name, Father Name and Mother Name exist");
    }

    const round = await AdmissionRound.create({
        title,
        description,
        startDate,
        deadline,
        status: "active",
        createdBy: req.user?.id || null,
        updatedBy: req.user?.id || null,
        totalStudents: parsed.candidates.length,
        matchedStudents: 0,
    });

    const candidateDocs = parsed.candidates.map((candidate) => ({
        round: round._id,
        studentName: cleanImportText(candidate.studentName).slice(0, 180),
        fatherName: cleanImportText(candidate.fatherName).slice(0, 180),
        motherName: cleanImportText(candidate.motherName).slice(0, 180),
        studentPhone: cleanImportText(candidate.studentPhone).slice(0, 20),
        fatherPhone: cleanImportText(candidate.fatherPhone).slice(0, 20),
        motherPhone: cleanImportText(candidate.motherPhone).slice(0, 20),
        email: String(candidate.email || "").trim().toLowerCase().slice(0, 160),
        rollNumber: cleanImportText(candidate.rollNumber).slice(0, 64),
        meritRank: cleanImportText(candidate.meritRank).slice(0, 32),
        meritMarks: cleanImportText(candidate.meritMarks).slice(0, 32),
        eligibleCategory: cleanImportText(candidate.eligibleCategory).slice(0, 64),
        allottedCategory: cleanImportText(candidate.allottedCategory).slice(0, 64),
        domicileStatus: cleanImportText(candidate.domicileStatus).slice(0, 64),
        genderRaw: cleanImportText(candidate.genderRaw).slice(0, 16),
        ewsStatus: cleanImportText(candidate.ewsStatus).slice(0, 32),
        allottedRound: cleanImportText(candidate.allottedRound).slice(0, 48),
        finalStatus: cleanImportText(candidate.finalStatus).slice(0, 64),
        program: cleanImportText(candidate.program).slice(0, 32),
        branch: cleanImportText(candidate.branch).slice(0, 32),
        sourceFile: cleanImportText(candidate.sourceFile).slice(0, 120),
        studentNameKey: candidate.studentNameKey,
        fatherNameKey: candidate.fatherNameKey,
        motherNameKey: candidate.motherNameKey,
        studentPhoneKey: candidate.studentPhoneKey,
        fatherPhoneKey: candidate.fatherPhoneKey,
        motherPhoneKey: candidate.motherPhoneKey,
    }));

    let insertedCount = 0;
    let rowFailures = 0;
    try {
        const result = await RoundCandidate.collection.insertMany(candidateDocs, { ordered: false });
        insertedCount = Number(result?.insertedCount || 0);
    } catch (error) {
        insertedCount = Number(
            error?.result?.insertedCount
            || error?.result?.nInserted
            || error?.insertedDocs?.length
            || 0
        );
        rowFailures = Number(error?.writeErrors?.length || 0);

        if (insertedCount === 0) {
            await AdmissionRound.deleteOne({ _id: round._id });
            throw new ApiError(400, "Failed to save uploaded student list for this round. Please verify sheet data format and try again.");
        }
    }

    if (insertedCount !== parsed.candidates.length) {
        await AdmissionRound.updateOne(
            { _id: round._id },
            {
                $set: {
                    totalStudents: insertedCount,
                },
            }
        );
    }

    await writeAuditLog({
        req,
        actionLabel: "ROUND_CREATED",
        module: "admin",
        entityType: "round",
        entityId: round._id,
        entityRef: `Round ${round.title}`,
        toStatus: String(round.status || "ACTIVE").toUpperCase(),
        metadata: {
            importedRows: insertedCount,
            skippedRows: parsed.skipped + rowFailures,
        },
    });

    return sendSuccess(res, "Round created successfully", {
        round: {
            id: String(round._id),
            title: round.title,
            description: round.description,
            startDate: round.startDate,
            deadline: round.deadline,
            status: round.status,
            totalStudents: insertedCount,
            matchedStudents: 0,
        },
        importSummary: {
            importedRows: insertedCount,
            skippedRows: parsed.skipped + rowFailures,
        },
    }, 201);
});

// PATCH /api/admin/rounds/:roundId/status
const updateRoundStatus = asyncHandler(async (req, res) => {
    const roundId = req.params.roundId;
    const status = cleanImportText(req.body?.status).toLowerCase();
    const validStatuses = ["active", "frozen", "closed"];

    if (!validStatuses.includes(status)) {
        throw new ApiError(400, "status must be one of active, frozen, closed");
    }

    const round = await AdmissionRound.findByIdAndUpdate(
        roundId,
        { status, updatedBy: req.user?.id || null },
        { returnDocument: "after" }
    ).lean();

    if (!round) throw new ApiError(404, "Round not found");

    await writeAuditLog({
        req,
        actionLabel: "ROUND_STATUS_UPDATED",
        module: "admin",
        entityType: "round",
        entityId: round._id,
        entityRef: `Round ${round.title}`,
        toStatus: String(status || "").toUpperCase(),
    });

    return sendSuccess(res, "Round status updated", {
        round: {
            id: String(round._id),
            title: round.title,
            description: round.description,
            startDate: round.startDate,
            deadline: round.deadline,
            status: round.status,
        },
    });
});

// DELETE /api/admin/rounds/:roundId
const deleteRound = asyncHandler(async (req, res) => {
    const roundId = req.params.roundId;

    const round = await AdmissionRound.findById(roundId).lean();
    if (!round) throw new ApiError(404, "Round not found");

    await Promise.all([
        RoundCandidate.deleteMany({ round: round._id }),
        Application.updateMany(
            { verifiedRound: round._id },
            {
                $set: {
                    verifiedRound: null,
                    verifiedRoundCandidate: null,
                    roundEligibilityVerifiedAt: null,
                },
            }
        ),
        AdmissionRound.deleteOne({ _id: round._id }),
    ]);

    await writeAuditLog({
        req,
        actionLabel: "ROUND_DELETED",
        module: "admin",
        entityType: "round",
        entityId: round._id,
        entityRef: `Round ${round.title}`,
        toStatus: "DELETED",
    });

    return sendSuccess(res, "Round deleted successfully", {
        deletedRoundId: String(round._id),
        title: round.title,
    });
});

// GET /api/admin/rounds/:roundId/students
const listRoundStudents = asyncHandler(async (req, res) => {
    const roundId = req.params.roundId;
    const page = parsePage(req.query.page, 1);
    const limit = parseLimit(req.query.limit, 20, 100);
    const search = cleanImportText(req.query.search);
    const skip = (page - 1) * limit;

    const round = await AdmissionRound.findById(roundId).lean();
    if (!round) throw new ApiError(404, "Round not found");

    const filter = { round: round._id };
    if (search) {
        const safe = escapeRegex(search);
        filter.$or = [
            { studentName: { $regex: safe, $options: "i" } },
            { fatherName: { $regex: safe, $options: "i" } },
            { motherName: { $regex: safe, $options: "i" } },
            { rollNumber: { $regex: safe, $options: "i" } },
            { studentPhone: { $regex: safe, $options: "i" } },
            { fatherPhone: { $regex: safe, $options: "i" } },
        ];
    }

    const [rows, total] = await Promise.all([
        RoundCandidate.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("matchedApplication", "status submittedAt fullName phone fatherPhone")
            .lean(),
        RoundCandidate.countDocuments(filter),
    ]);

    const items = rows.map((row) => ({
        id: String(row._id),
        studentName: cleanImportText(row.studentName) || "-",
        fatherName: cleanImportText(row.fatherName) || "-",
        motherName: cleanImportText(row.motherName) || "-",
        studentPhone: cleanImportText(row.studentPhone) || "-",
        fatherPhone: cleanImportText(row.fatherPhone) || "-",
        motherPhone: cleanImportText(row.motherPhone) || "-",
        rollNumber: cleanImportText(row.rollNumber) || "-",
        program: cleanImportText(row.program) || "-",
        branch: cleanImportText(row.branch) || "-",
        sourceFile: cleanImportText(row.sourceFile) || "Sheet-Unspecified",
        matched: Boolean(row.matchedApplication),
        matchedStatus: row.matchedApplication ? mapRawStatusToUi(row.matchedApplication.status) : "Not Matched",
    }));

    const groupedMap = new Map();
    for (const item of items) {
        const key = item.sourceFile;
        if (!groupedMap.has(key)) {
            groupedMap.set(key, {
                sheetName: key,
                count: 0,
                items: [],
            });
        }
        const group = groupedMap.get(key);
        group.count += 1;
        group.items.push(item);
    }

    const groups = Array.from(groupedMap.values());

    return sendSuccess(res, "Round student list fetched", {
        round: {
            id: String(round._id),
            title: round.title,
            status: round.status,
            startDate: round.startDate,
            deadline: round.deadline,
        },
        items,
        groups,
        total,
        page,
        pages: Math.ceil(total / limit),
    });
});

// GET /api/admin/student-data
// Paginated student data table for admin UI with secure allow-list filtering
const listStudentData = asyncHandler(async (req, res) => {
    const page = parsePage(req.query.page, 1);
    const limit = parseLimit(req.query.limit, 20, 100);
    const skip = (page - 1) * limit;

    const roundId = cleanImportText(req.query.roundId);
    const statusFilter = String(req.query.status || "All Statuses").trim();
    const programFilter = normalizeProgram(String(req.query.program || "All Programs"));
    const search = String(req.query.search || "").trim();

    if (roundId) {
        const round = await AdmissionRound.findById(roundId).lean();
        if (!round) throw new ApiError(404, "Round not found");

        const candidateFilter = { round: round._id };

        if (programFilter && programFilter !== "ALL PROGRAMS") {
            const safeProgram = escapeRegex(programFilter);
            candidateFilter.$or = [
                { program: { $regex: `^${safeProgram}$`, $options: "i" } },
                { branch: { $regex: `^${safeProgram}$`, $options: "i" } },
            ];
        }

        if (search) {
            const safeSearch = escapeRegex(search);
            candidateFilter.$and = [
                ...(candidateFilter.$and || []),
                {
                    $or: [
                        { studentName: { $regex: safeSearch, $options: "i" } },
                        { fatherName: { $regex: safeSearch, $options: "i" } },
                        { motherName: { $regex: safeSearch, $options: "i" } },
                        { rollNumber: { $regex: safeSearch, $options: "i" } },
                        { studentPhone: { $regex: safeSearch, $options: "i" } },
                        { fatherPhone: { $regex: safeSearch, $options: "i" } },
                    ],
                },
            ];
        }

        const [candidates, total] = await Promise.all([
            RoundCandidate.find(candidateFilter)
                .sort({ sourceFile: 1, createdAt: 1 })
                .skip(skip)
                .limit(limit)
                .populate("matchedApplication")
                .lean(),
            RoundCandidate.countDocuments(candidateFilter),
        ]);

        const items = candidates
            .map((candidate) => {
                const application = candidate.matchedApplication || null;
                const mappedStatus = application ? mapRawStatusToUi(application.status) : "Not Matched";

                if (statusFilter && statusFilter !== "All Statuses" && mappedStatus !== statusFilter) {
                    return null;
                }

                return {
                    id: String(candidate._id),
                    name: cleanImportText(candidate.studentName) || "-",
                    email: cleanImportText(candidate.email) || "-",
                    rank: application
                        ? cleanImportText(application.meritRank) || cleanImportText(candidate.meritRank) || "-"
                        : cleanImportText(candidate.meritRank) || "-",
                    marks: application
                        ? cleanImportText(application.meritMarks) || cleanImportText(candidate.meritMarks) || "-"
                        : cleanImportText(candidate.meritMarks) || "-",
                    rollNo: cleanImportText(candidate.rollNumber) || (application ? cleanImportText(application.rollNumber) || "-" : "-"),
                    father: cleanImportText(candidate.fatherName) || "-",
                    mother: cleanImportText(candidate.motherName) || "-",
                    eligibleCategory: application
                        ? cleanImportText(application.eligibleCategory) || cleanImportText(candidate.eligibleCategory) || "-"
                        : cleanImportText(candidate.eligibleCategory) || "-",
                    allotedCategory: application
                        ? cleanImportText(application.allottedCategory) || cleanImportText(candidate.allottedCategory) || "-"
                        : cleanImportText(candidate.allottedCategory) || "-",
                    domicile: application
                        ? cleanImportText(application.domicileStatus) || cleanImportText(candidate.domicileStatus) || "-"
                        : cleanImportText(candidate.domicileStatus) || "-",
                    gender: application
                        ? toUiGender(application.genderRaw, application.gender)
                        : toUiGender(candidate.genderRaw, ""),
                    phoneNo: cleanImportText(candidate.studentPhone) || (application ? cleanImportText(application.phone) || "-" : "-"),
                    ews: application
                        ? cleanImportText(application.ewsStatus) || cleanImportText(candidate.ewsStatus) || "-"
                        : cleanImportText(candidate.ewsStatus) || "-",
                    program: cleanImportText(candidate.program) || (application ? buildProgram(application) : "-"),
                    branch: cleanImportText(candidate.branch) || (application ? normalizeProgram(application.branch || "-") : "-"),
                    status: mappedStatus,
                    finalStatus: application
                        ? cleanImportText(application.finalStatus) || cleanImportText(candidate.finalStatus) || mappedStatus
                        : cleanImportText(candidate.finalStatus) || mappedStatus,
                    date: application
                        ? new Date(application.submittedAt || application.updatedAt || application.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        })
                        : "-",
                    allotedRound: application
                        ? cleanImportText(application.allottedRound) || cleanImportText(candidate.allottedRound) || "-"
                        : cleanImportText(candidate.allottedRound) || "-",
                    sourceFile: cleanImportText(candidate.sourceFile) || "Sheet-Unspecified",
                    roundId: String(round._id),
                    roundTitle: cleanImportText(round.title) || "-",
                };
            })
            .filter(Boolean);

        const groupedMap = new Map();
        for (const item of items) {
            const key = item.sourceFile;
            if (!groupedMap.has(key)) {
                groupedMap.set(key, {
                    sheetName: key,
                    count: 0,
                    items: [],
                });
            }
            const group = groupedMap.get(key);
            group.count += 1;
            group.items.push(item);
        }

        return sendSuccess(res, "Student data fetched", {
            round: {
                id: String(round._id),
                title: round.title,
                status: round.status,
            },
            items,
            groups: Array.from(groupedMap.values()),
            total,
            page,
            pages: Math.ceil(total / limit),
        });
    }

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
        const finalStatus = cleanImportText(application.finalStatus)
            || mapRawStatusToUi(application.status)
            || "-";

        return {
            id: buildStudentId(application._id),
            name: buildStudentDisplayName(application, student),
            email: buildStudentEmail(application, student),
            rank: cleanImportText(application.meritRank) || "-",
            marks: cleanImportText(application.meritMarks) || "-",
            rollNo: cleanImportText(application.rollNumber) || "-",
            father: cleanImportText(application.fatherName) || "-",
            mother: cleanImportText(application.motherName) || "-",
            eligibleCategory: cleanImportText(application.eligibleCategory) || "-",
            allotedCategory: cleanImportText(application.allottedCategory) || "-",
            domicile: cleanImportText(application.domicileStatus) || "-",
            gender: toUiGender(application.genderRaw, application.gender),
            phoneNo: cleanImportText(application.phone) || "-",
            ews: cleanImportText(application.ewsStatus) || "-",
            program: buildProgram(application),
            branch: normalizeProgram(application.branch || "-"),
            status: mapRawStatusToUi(application.status),
            finalStatus,
            date: new Date(application.submittedAt || application.updatedAt || application.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }),
            allotedRound: cleanImportText(application.allottedRound) || "-",
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
    if (String(req.user?.id) === String(req.params.userId)) {
        throw new ApiError(400, "You cannot lock your own account");
    }

    const user = await User.findByIdAndUpdate(
        req.params.userId,
        { isActive: false },
        { returnDocument: "after" }
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
        { returnDocument: "after" }
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
    const replaceExisting = req.body?.replaceExisting === true;

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
    let generatedEmailCount = 0;
    const fieldCoverage = {
        rank: 0,
        marks: 0,
        rollNo: 0,
        father: 0,
        mother: 0,
        eligibleCategory: 0,
        allotedCategory: 0,
        domicile: 0,
        gender: 0,
        phoneNo: 0,
        ews: 0,
        allotedRound: 0,
        finalStatus: 0,
    };

    const normalizedRows = [];

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
            "Email Id",
            "Email ID",
            "EmailID",
            "Student Email",
            "Student Mail ID",
            "Mail",
            "E-mail",
            "Email Address",
            "Applicant Email",
        ]);
        const rawIdentifier = getFieldValue(row, [
            "Roll Number",
            "Roll No",
            "RollNo",
            "Enrollment No",
            "Enrolment No",
            "Registration Number",
            "Registration No",
            "Application Number",
            "Application No",
            "Candidate ID",
            "Student ID",
        ]);
        const rawRank = getFieldValue(row, ["Rank"]);
        const rawMarks = getFieldValue(row, ["Marks"]);
        const rawFather = getFieldValue(row, ["Father", "Father Name"]);
        const rawMother = getFieldValue(row, ["Mother", "Mother Name"]);
        const rawEligibleCategory = getFieldValue(row, ["Eligible Category"]);
        const rawAllotedCategory = getFieldValue(row, ["Alloted Category", "Allotted Category"]);
        const rawDomicile = getFieldValue(row, ["Domicile"]);
        const rawGender = getFieldValue(row, ["Gender"]);
        const rawPhoneNo = getFieldValue(row, ["PhoneNo", "Phone No", "Phone Number", "Mobile", "Mobile No"]);
        const rawEws = getFieldValue(row, ["EWS"]);
        const rawAllotedRound = getFieldValue(row, ["Alloted Round", "Allotted Round"]);
        const rawFinalStatus = getFieldValue(row, ["Final Status"]);
        const rawProgram = getFieldValue(row, [
            "Program",
            "Program Name",
            "Program Applied",
            "Programme",
        ]);
        const rawBranch = getFieldValue(row, [
            "Branch",
            "Alloted Branch",
            "Allotted Branch",
            "Department",
            "Specialization",
            "Stream",
        ]);
        const rawCourse = getFieldValue(row, [
            "Course",
            "Course Name",
            "Course Applied",
        ]);
        const rawStatus = getFieldValue(row, [
            "Status",
            "Final Status",
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
            "Date Submitted",
        ]);

        const name = String(rawName || "").trim();
        const explicitEmail = String(rawEmail || "").trim().toLowerCase();
        const identifier = normalizeIdentifier(rawIdentifier);
        const email = explicitEmail.includes("@")
            ? explicitEmail
            : (identifier ? `${identifier}@import.mits.local` : "");

        if (!explicitEmail && email) {
            generatedEmailCount += 1;
        }

        if (!name || !email || !email.includes("@")) {
            skipped += 1;
            continue;
        }

        normalizedRows.push({
            name,
            email,
            rawIdentifier,
            rawRank,
            rawMarks,
            rawFather,
            rawMother,
            rawEligibleCategory,
            rawAllotedCategory,
            rawDomicile,
            rawGender,
            rawPhoneNo,
            rawEws,
            rawAllotedRound,
            rawFinalStatus,
            rawProgram,
            rawBranch,
            rawCourse,
            rawStatus,
            rawDate,
            rawRow: row,
            sourceFile: String(row.__sourceFile || "").trim(),
        });

        if (cleanImportText(rawRank)) fieldCoverage.rank += 1;
        if (cleanImportText(rawMarks)) fieldCoverage.marks += 1;
        if (cleanImportText(rawIdentifier)) fieldCoverage.rollNo += 1;
        if (cleanImportText(rawFather)) fieldCoverage.father += 1;
        if (cleanImportText(rawMother)) fieldCoverage.mother += 1;
        if (cleanImportText(rawEligibleCategory)) fieldCoverage.eligibleCategory += 1;
        if (cleanImportText(rawAllotedCategory)) fieldCoverage.allotedCategory += 1;
        if (cleanImportText(rawDomicile)) fieldCoverage.domicile += 1;
        if (cleanImportText(rawGender)) fieldCoverage.gender += 1;
        if (cleanImportText(rawPhoneNo)) fieldCoverage.phoneNo += 1;
        if (cleanImportText(rawEws)) fieldCoverage.ews += 1;
        if (cleanImportText(rawAllotedRound)) fieldCoverage.allotedRound += 1;
        if (cleanImportText(rawFinalStatus)) fieldCoverage.finalStatus += 1;
    }

    if (normalizedRows.length === 0) {
        return sendSuccess(res, "No valid rows to import", {
            processed: 0,
            usersCreated: 0,
            usersUpdated: 0,
            applicationsCreated: 0,
            applicationsUpdated: 0,
            skipped,
        });
    }

    const uniqueRowsByEmail = new Map();
    for (const row of normalizedRows) {
        uniqueRowsByEmail.set(row.email, row);
    }

    const uniqueRows = Array.from(uniqueRowsByEmail.values());
    const uniqueEmails = uniqueRows.map((row) => row.email);

    let removedSeedApplications = 0;
    let removedSeedUsers = 0;

    if (replaceExisting) {
        const seededEmailPattern = /@import\.mits\.local$/i;
        const seededUsers = await User.find({
            $or: [
                { email: seededEmailPattern },
                { email: { $in: SEEDED_DEMO_EMAILS } },
            ],
        }).select("_id").lean();
        const seededUserIds = seededUsers.map((user) => user._id);

        const applicationDeleteFilter = {
            $or: [
                { importSource: { $exists: true, $ne: "" } },
                { email: seededEmailPattern },
                { email: { $in: SEEDED_DEMO_EMAILS } },
                ...(seededUserIds.length ? [{ student: { $in: seededUserIds } }] : []),
            ],
        };

        const [deletedApplications, deletedUsers] = await Promise.all([
            Application.deleteMany(applicationDeleteFilter),
            User.deleteMany({
                $or: [
                    { email: seededEmailPattern },
                    { email: { $in: SEEDED_DEMO_EMAILS } },
                ],
            }),
        ]);

        removedSeedApplications = Number(deletedApplications?.deletedCount || 0);
        removedSeedUsers = Number(deletedUsers?.deletedCount || 0);
    }

    const userOps = uniqueRows.map((row) => ({
        updateOne: {
            filter: { email: row.email },
            update: {
                $set: { name: row.name },
                $setOnInsert: {
                    googleSub: buildImportGoogleSub(row.email),
                    email: row.email,
                    role: "student",
                    emailVerified: false,
                    isActive: true,
                },
            },
            upsert: true,
        },
    }));

    if (userOps.length > 0) {
        const userBulkResult = await User.bulkWrite(userOps, { ordered: false });
        usersCreated = Number(userBulkResult?.upsertedCount || 0);
        usersUpdated = Number(userBulkResult?.matchedCount || 0);
    }

    const users = await User.find({ email: { $in: uniqueEmails } }).select("_id email").lean();
    const userIdByEmail = new Map(users.map((user) => [String(user.email || "").toLowerCase(), user._id]));

    const appOps = [];

    for (const row of uniqueRows) {
        const userId = userIdByEmail.get(row.email);
        if (!userId) {
            skipped += 1;
            continue;
        }

        const { programApplied, branch } = detectProgramAndBranch(
            row.rawProgram,
            row.rawBranch,
            row.rawCourse
        );
        const mappedStatus = mapImportedStatus(row.rawStatus);
        const importedDate = parsePossibleDate(row.rawDate) || new Date();
        const gender = mapImportGender(row.rawGender);
        const finalStatus = cleanImportText(row.rawFinalStatus) || mapRawStatusToUi(mappedStatus);
        const rank = cleanImportText(row.rawRank);
        const marks = cleanImportText(row.rawMarks);
        const rollNo = cleanImportText(row.rawIdentifier);
        const fatherName = cleanImportText(row.rawFather);
        const motherName = cleanImportText(row.rawMother);
        const phoneNo = cleanImportText(row.rawPhoneNo);

        const progressBar = {
            formFilled: true,
            documentsUploaded: ["submitted", "under_review", "documents_verified", "payment_pending", "payment_verified", "admitted", "rejected"].includes(mappedStatus),
            documentsVerified: ["documents_verified", "payment_pending", "payment_verified", "admitted"].includes(mappedStatus),
            paymentDone: ["payment_verified", "admitted"].includes(mappedStatus),
            admissionConfirmed: mappedStatus === "admitted",
        };

        const applicationSetPayload = {
            fullName: row.name,
            email: row.email,
            fatherName,
            motherName,
            programApplied,
            branch,
            status: mappedStatus,
            progressBar,
            submittedAt: importedDate,
            gender,
            genderRaw: cleanImportText(row.rawGender),
            phone: phoneNo,
            rollNumber: rollNo,
            meritRank: rank,
            meritMarks: marks,
            eligibleCategory: cleanImportText(row.rawEligibleCategory),
            allottedCategory: cleanImportText(row.rawAllotedCategory),
            domicileStatus: cleanImportText(row.rawDomicile),
            ewsStatus: cleanImportText(row.rawEws),
            allottedRound: cleanImportText(row.rawAllotedRound),
            finalStatus,
            importSource: row.sourceFile,
        };

        if (mappedStatus === "admitted") {
            applicationSetPayload.admittedAt = importedDate;
        }

        appOps.push({
            updateOne: {
                filter: { student: userId },
                update: {
                    $set: applicationSetPayload,
                    $setOnInsert: {
                        student: userId,
                    },
                },
                upsert: true,
            },
        });
    }

    const appOpChunks = chunkArray(appOps, 800);
    for (const chunk of appOpChunks) {
        if (chunk.length === 0) continue;
        const appBulkResult = await Application.bulkWrite(chunk, { ordered: false });
        applicationsCreated += Number(appBulkResult?.upsertedCount || 0);
        applicationsUpdated += Number(appBulkResult?.matchedCount || 0);
    }

    processed = uniqueRows.length;

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
            generatedEmailCount,
            replaceExisting,
            removedSeedApplications,
            removedSeedUsers,
            fieldCoverage,
        },
    });

    return sendSuccess(res, "Bulk enrollment import completed", {
        processed,
        usersCreated,
        usersUpdated,
        applicationsCreated,
        applicationsUpdated,
        skipped,
        generatedEmailCount,
        removedSeedApplications,
        removedSeedUsers,
        fieldCoverage,
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
    listRounds,
    createRound,
    updateRoundStatus,
    deleteRound,
    listRoundStudents,
};
