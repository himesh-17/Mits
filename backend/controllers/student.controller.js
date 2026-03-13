import Application from "../Models/application.model.js";
import Document from "../Models/document.model.js";
import Payment from "../Models/payment.model.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const ALLOWED_MIME_TYPES = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
]);

function isAllowedFileUrl(fileUrl) {
    try {
        const parsed = new URL(fileUrl);
        if (parsed.protocol !== "https:") {
            return false;
        }

        const rawAllowedHosts = process.env.ALLOWED_UPLOAD_HOSTS || "";
        const allowedHosts = rawAllowedHosts
            .split(",")
            .map((v) => v.trim().toLowerCase())
            .filter(Boolean);

        if (allowedHosts.length === 0) {
            return true;
        }

        return allowedHosts.includes(parsed.hostname.toLowerCase());
    } catch {
        return false;
    }
}

// GET /api/student/application
const getOrCreateApplication = asyncHandler(async (req, res) => {
    let app = await Application.findOne({ student: req.user.id });
    if (!app) {
        app = await Application.create({ student: req.user.id });
    }
    return sendSuccess(res, "Application fetched", { application: app });
});

// PATCH /api/student/application
const updateApplication = asyncHandler(async (req, res) => {
    const allowed = [
        "fullName", "fatherName", "motherName", "dateOfBirth", "gender",
        "category", "nationality", "religion", "phone", "alternatePhone",
        "address", "city", "state", "pincode",
        "branch", "course", "semester", "rollNumber",
        "previousInstitution", "previousPercentage", "admissionYear",
    ];
    const updates = {};
    for (const f of allowed) {
        if (req.body[f] !== undefined) updates[f] = req.body[f];
    }

    const app = await Application.findOneAndUpdate(
        { student: req.user.id, status: { $in: ["draft", "re_upload"] } },
        { $set: updates },
        { new: true }
    );
    if (!app) throw new ApiError(400, "No editable application found");
    return sendSuccess(res, "Application updated", { application: app });
});

// POST /api/student/application/submit
const submitApplication = asyncHandler(async (req, res) => {
    const app = await Application.findOne({
        student: req.user.id,
        status: { $in: ["draft", "re_upload"] },
    });
    if (!app) throw new ApiError(400, "No draft application found to submit");

    for (const f of ["fullName", "phone", "branch", "course"]) {
        if (!app[f]) throw new ApiError(400, `Missing required field: ${f}`);
    }

    app.status = "submitted";
    app.progressBar.formFilled = true;
    app.submittedAt = new Date();
    await app.save();
    return sendSuccess(res, "Application submitted", { application: app });
});

// POST /api/student/documents
const uploadDocument = asyncHandler(async (req, res) => {
    const { docType, fileUrl, fileName, mimeType } = req.body;
    if (!docType || !fileUrl) throw new ApiError(400, "docType and fileUrl are required");
    if (!isAllowedFileUrl(fileUrl)) {
        throw new ApiError(400, "fileUrl must be a valid https URL and pass allowed host checks");
    }
    if (fileName && fileName.length > 255) {
        throw new ApiError(400, "fileName must be at most 255 characters");
    }
    if (mimeType && !ALLOWED_MIME_TYPES.has(String(mimeType).toLowerCase())) {
        throw new ApiError(400, "mimeType is not allowed");
    }

    const app = await Application.findOne({ student: req.user.id });
    if (!app) throw new ApiError(404, "Application not found");
    if (!app.progressBar.formFilled || !["submitted", "re_upload", "under_review"].includes(app.status)) {
        throw new ApiError(400, "Application must be submitted before uploading documents");
    }

    const doc = await Document.findOneAndUpdate(
        { application: app._id, docType },
        {
            application: app._id,
            student: req.user.id,
            docType,
            fileUrl,
            fileName: fileName || "",
            mimeType: mimeType || "",
            status: "pending",
            rejectionReason: "",
            verifiedBy: null,
            verifiedAt: null,
        },
        { upsert: true, new: true }
    );

    if (!app.progressBar.documentsUploaded) {
        await Application.findByIdAndUpdate(app._id, {
            "progressBar.documentsUploaded": true,
            status: "under_review",
        });
    }
    return sendSuccess(res, "Document uploaded", { document: doc }, 201);
});

// GET /api/student/documents
const getMyDocuments = asyncHandler(async (req, res) => {
    const app = await Application.findOne({ student: req.user.id });
    if (!app) throw new ApiError(404, "Application not found");
    const documents = await Document.find({ application: app._id });
    return sendSuccess(res, "Documents fetched", { documents });
});

// GET /api/student/payment
const getMyPayment = asyncHandler(async (req, res) => {
    const app = await Application.findOne({ student: req.user.id });
    if (!app) throw new ApiError(404, "Application not found");
    const payment = await Payment.findOne({ application: app._id });
    return sendSuccess(res, "Payment record fetched", { payment: payment || null });
});

// POST /api/student/payment/submit
const submitPayment = asyncHandler(async (req, res) => {
    const { challanFileUrl, paymentMode, transactionId, amount } = req.body;
    if (!challanFileUrl && !transactionId) {
        throw new ApiError(400, "Provide challanFileUrl or transactionId");
    }

    const normalizedMode = (paymentMode || "").toLowerCase();
    if (normalizedMode && !["online", "offline"].includes(normalizedMode)) {
        throw new ApiError(400, "paymentMode must be online or offline");
    }
    if (normalizedMode === "online" && !transactionId) {
        throw new ApiError(400, "transactionId is required for online payments");
    }
    if (normalizedMode === "offline" && !challanFileUrl) {
        throw new ApiError(400, "challanFileUrl is required for offline payments");
    }
    if (challanFileUrl && !isAllowedFileUrl(challanFileUrl)) {
        throw new ApiError(400, "challanFileUrl must be a valid https URL and pass allowed host checks");
    }
    if (transactionId && !/^[a-zA-Z0-9_-]{6,64}$/.test(transactionId)) {
        throw new ApiError(400, "transactionId format is invalid");
    }

    const app = await Application.findOne({ student: req.user.id });
    if (!app) throw new ApiError(404, "Application not found");

    if (!["documents_verified", "payment_pending"].includes(app.status)) {
        throw new ApiError(400, `Payment not allowed at status: ${app.status}`);
    }

    const normalizedAmount = Number(amount);
    if (amount === undefined || Number.isNaN(normalizedAmount) || normalizedAmount <= 0) {
        throw new ApiError(400, "amount is required and must be a number greater than 0");
    }

    const session = await mongoose.startSession();
    let payment;
    try {
        await session.withTransaction(async () => {
            payment = await Payment.findOneAndUpdate(
                { application: app._id },
                {
                    $set: {
                        student: req.user.id,
                        application: app._id,
                        challanFileUrl: challanFileUrl || "",
                        paymentMode: normalizedMode || "",
                        transactionId: transactionId || "",
                        amount: normalizedAmount,
                        status: "submitted",
                    },
                },
                { upsert: true, new: true, session }
            );

            await Application.findByIdAndUpdate(
                app._id,
                {
                    status: "payment_submitted",
                    "progressBar.paymentDone": true,
                },
                { session }
            );
        });
    } finally {
        await session.endSession();
    }

    return sendSuccess(res, "Payment submitted", { payment });
});

export {
    getOrCreateApplication,
    updateApplication,
    submitApplication,
    uploadDocument,
    getMyDocuments,
    getMyPayment,
    submitPayment,
};
