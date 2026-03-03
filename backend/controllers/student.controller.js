import Application from "../Models/application.model.js";
import Document from "../Models/document.model.js";
import Payment from "../Models/payment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";

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

    const app = await Application.findOne({ student: req.user.id });
    if (!app) throw new ApiError(404, "Application not found");

    if (!["documents_verified", "payment_pending"].includes(app.status)) {
        throw new ApiError(400, `Payment not allowed at status: ${app.status}`);
    }

    const normalizedAmount = Number(amount);
    if (amount === undefined || Number.isNaN(normalizedAmount) || normalizedAmount <= 0) {
        throw new ApiError(400, "amount is required and must be a number greater than 0");
    }

    const payment = await Payment.findOneAndUpdate(
        { application: app._id },
        {
            $set: {
                student: req.user.id,
                application: app._id,
                challanFileUrl: challanFileUrl || "",
                paymentMode: paymentMode || "",
                transactionId: transactionId || "",
                amount: normalizedAmount,
                status: "submitted",
            },
        },
        { upsert: true, new: true }
    );

    await Application.findByIdAndUpdate(app._id, {
        status: "payment_submitted",
        "progressBar.paymentDone": true,
    });

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
