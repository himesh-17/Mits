import Application from "../models/application.model.js";
import Document from "../models/document.model.js";
import Payment from "../models/payment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// GET /api/account-office/applications
// List all doc-verified applications (awaiting payment verification)
const listVerifiedApplications = asyncHandler(async (req, res) => {
    const { status, branch, page = 1, limit = 20 } = req.query;
    const filter = {
        status: status || { $in: ["documents_verified", "payment_pending", "payment_submitted", "payment_verified"] },
    };
    if (branch) filter.branch = branch;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [applications, total] = await Promise.all([
        Application.find(filter)
            .populate("student", "name email picture")
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

// GET /api/account-office/applications/:applicationId
const getApplicationDetail = asyncHandler(async (req, res) => {
    const app = await Application.findById(req.params.applicationId)
        .populate("student", "name email picture");
    if (!app) throw new ApiError(404, "Application not found");

    const [documents, payment] = await Promise.all([
        Document.find({ application: app._id }),
        Payment.findOne({ application: app._id }),
    ]);

    return sendSuccess(res, "Application detail fetched", { application: app, documents, payment });
});

// PATCH /api/account-office/documents/:documentId/verify
const verifyDocument = asyncHandler(async (req, res) => {
    const { action, reason } = req.body;
    // action: "verified" | "rejected"
    if (!action) throw new ApiError(400, "action is required (verified | rejected)");

    const doc = await Document.findByIdAndUpdate(
        req.params.documentId,
        {
            $set: {
                status: action,
                rejectionReason: action === "rejected" ? (reason || "") : "",
                verifiedBy: req.user.id,
                verifiedAt: new Date(),
            },
        },
        { new: true }
    );
    if (!doc) throw new ApiError(404, "Document not found");

    // If all docs for this application are verified, update app status
    const allDocs = await Document.find({ application: doc.application });
    const allVerified = allDocs.length > 0 && allDocs.every((d) => d.status === "verified");
    if (allVerified) {
        await Application.findByIdAndUpdate(doc.application, {
            status: "documents_verified",
            "progressBar.documentsVerified": true,
        });
    }

    return sendSuccess(res, `Document ${action}`, { document: doc });
});

// PATCH /api/account-office/applications/:applicationId/set-payment
// Account office sets payment limits and UTS ID for the student
const setPaymentDetails = asyncHandler(async (req, res) => {
    const { utsId, minLimit, maxLimit, sendLink, remarks } = req.body;

    const app = await Application.findById(req.params.applicationId);
    if (!app) throw new ApiError(404, "Application not found");

    const payment = await Payment.findOneAndUpdate(
        { application: app._id },
        {
            $set: {
                student: app.student,
                application: app._id,
                utsId: utsId || "",
                minLimit: minLimit || 0,
                maxLimit: maxLimit || 0,
                sendLink: sendLink || "",
                remarks: remarks || "",
                status: "pending",
            },
        },
        { upsert: true, new: true }
    );

    await Application.findByIdAndUpdate(app._id, { status: "payment_pending" });

    return sendSuccess(res, "Payment details set", { payment });
});

// PATCH /api/account-office/payments/:paymentId/verify
// Verifying officer approves or rejects submitted payment
const verifyPayment = asyncHandler(async (req, res) => {
    const { action, reason } = req.body;
    if (!["verified", "rejected"].includes(action)) {
        throw new ApiError(400, "action must be 'verified' or 'rejected'");
    }

    const payment = await Payment.findByIdAndUpdate(
        req.params.paymentId,
        {
            $set: {
                status: action,
                rejectionReason: action === "rejected" ? (reason || "") : "",
                verifyingOfficer: req.user.id,
                verifiedAt: new Date(),
            },
        },
        { new: true }
    );
    if (!payment) throw new ApiError(404, "Payment record not found");

    if (action === "verified") {
        await Application.findByIdAndUpdate(payment.application, {
            status: "payment_verified",
            "progressBar.paymentDone": true,
        });
    } else {
        await Application.findByIdAndUpdate(payment.application, {
            status: "payment_pending",
        });
    }

    return sendSuccess(res, `Payment ${action}`, { payment });
});

// GET /api/account-office/payments
// List all submitted payments awaiting verification
const listPendingPayments = asyncHandler(async (req, res) => {
    const payments = await Payment.find({ status: "submitted" })
        .populate("student", "name email")
        .populate("application", "fullName branch course status")
        .sort({ updatedAt: -1 });

    return sendSuccess(res, "Pending payments fetched", { payments });
});

// PATCH /api/account-office/applications/:applicationId/confirm-admission
// Final step: account office confirms admission after payment verified
const confirmAdmission = asyncHandler(async (req, res) => {
    const { remarks } = req.body;
    const app = await Application.findById(req.params.applicationId);
    if (!app) throw new ApiError(404, "Application not found");

    if (app.status !== "payment_verified") {
        throw new ApiError(400, `Cannot confirm admission at status: ${app.status}`);
    }

    app.status = "admitted";
    app.progressBar.admissionConfirmed = true;
    app.admittedBy = req.user.id;
    app.admittedAt = new Date();
    if (remarks) app.remarksAccountOffice = remarks;
    await app.save();

    return sendSuccess(res, "Admission confirmed", { application: app });
});

export {
    listVerifiedApplications,
    getApplicationDetail,
    verifyDocument,
    setPaymentDetails,
    verifyPayment,
    listPendingPayments,
    confirmAdmission,
};
