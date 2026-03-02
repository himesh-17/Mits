import Application from "../models/application.model.js";
import Document from "../models/document.model.js";
import StudentList from "../models/studentList.model.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// GET /api/admission-cell/students
// List all submitted/under_review students
const listStudents = asyncHandler(async (req, res) => {
    const { status, branch, course, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (branch) filter.branch = branch;
    if (course) filter.course = course;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [applications, total] = await Promise.all([
        Application.find(filter)
            .populate("student", "name email picture")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Application.countDocuments(filter),
    ]);

    return sendSuccess(res, "Students fetched", {
        applications,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
    });
});

// GET /api/admission-cell/students/:applicationId
const getStudentDetail = asyncHandler(async (req, res) => {
    const app = await Application.findById(req.params.applicationId)
        .populate("student", "name email picture");
    if (!app) throw new ApiError(404, "Application not found");

    const documents = await Document.find({ application: app._id });
    return sendSuccess(res, "Student detail fetched", { application: app, documents });
});

// POST /api/admission-cell/student-list/upload
// Upload a batch student list (name, email, rollNumber entries)
const uploadStudentList = asyncHandler(async (req, res) => {
    const { fileName, fileUrl, batchYear, branch, course, students } = req.body;
    if (!students || !Array.isArray(students) || students.length === 0) {
        throw new ApiError(400, "students array is required");
    }

    // Try to match emails to existing users
    const enriched = await Promise.all(
        students.map(async (s) => {
            const user = s.email ? await User.findOne({ email: s.email.toLowerCase() }) : null;
            return {
                name: s.name || "",
                email: s.email || "",
                rollNumber: s.rollNumber || "",
                status: "not_admitted",
                matchedUser: user ? user._id : null,
            };
        })
    );

    const list = await StudentList.create({
        uploadedBy: req.user.id,
        fileName: fileName || "",
        fileUrl: fileUrl || "",
        batchYear: batchYear || new Date().getFullYear(),
        branch: branch || "",
        course: course || "",
        students: enriched,
        totalCount: enriched.length,
        notAdmittedCount: enriched.length,
    });

    return sendSuccess(res, "Student list uploaded", { list }, 201);
});

// GET /api/admission-cell/student-lists
const getStudentLists = asyncHandler(async (req, res) => {
    const lists = await StudentList.find()
        .populate("uploadedBy", "name email")
        .sort({ createdAt: -1 });
    return sendSuccess(res, "Lists fetched", { lists });
});

// PATCH /api/admission-cell/applications/:applicationId/send-email
// Mark that a contact email was sent to the student
const markEmailSent = asyncHandler(async (req, res) => {
    const { remarks } = req.body;
    const app = await Application.findByIdAndUpdate(
        req.params.applicationId,
        {
            $set: {
                remarksAdmissionCell: remarks || "Email sent to student",
            },
        },
        { new: true }
    );
    if (!app) throw new ApiError(404, "Application not found");
    return sendSuccess(res, "Email remark saved", { application: app });
});

// PATCH /api/admission-cell/applications/:applicationId/verify
// Admission cell marks all documents verified - passes to general office
const markVerificationComplete = asyncHandler(async (req, res) => {
    const app = await Application.findById(req.params.applicationId);
    if (!app) throw new ApiError(404, "Application not found");

    app.status = "documents_verified";
    app.progressBar.documentsVerified = true;
    app.verifiedBy = req.user.id;
    app.verifiedAt = new Date();
    await app.save();

    return sendSuccess(res, "Verification marked complete", { application: app });
});

// PATCH /api/admission-cell/applications/:applicationId/reject
const rejectApplication = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    if (!reason) throw new ApiError(400, "Rejection reason is required");

    const app = await Application.findByIdAndUpdate(
        req.params.applicationId,
        { $set: { status: "rejected", rejectionReason: reason } },
        { new: true }
    );
    if (!app) throw new ApiError(404, "Application not found");
    return sendSuccess(res, "Application rejected", { application: app });
});

// GET /api/admission-cell/pending-verification
// All students pending verification
const getPendingVerification = asyncHandler(async (req, res) => {
    const apps = await Application.find({ status: "under_review" })
        .populate("student", "name email picture")
        .sort({ submittedAt: 1 });
    return sendSuccess(res, "Pending verification list", { applications: apps });
});

export {
    listStudents,
    getStudentDetail,
    uploadStudentList,
    getStudentLists,
    markEmailSent,
    markVerificationComplete,
    rejectApplication,
    getPendingVerification,
};
