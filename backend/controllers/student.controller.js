import Application from "../Models/application.model.js";
import Document from "../Models/document.model.js";
import Payment from "../Models/payment.model.js";
import AdmissionRound from "../Models/admissionRound.model.js";
import RoundCandidate from "../Models/roundCandidate.model.js";
import RoundMismatchAttempt from "../Models/roundMismatchAttempt.model.js";
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
        const protocol = parsed.protocol;
        const hostname = parsed.hostname.toLowerCase();
        const isDevLocalHost = (hostname === "localhost" || hostname === "127.0.0.1") && process.env.NODE_ENV !== "production";

        if (protocol === "http:" && isDevLocalHost) {
            return true;
        }

        if (protocol !== "https:") {
            return false;
        }

        const rawAllowedHosts = process.env.ALLOWED_UPLOAD_HOSTS || "";
        const allowedHosts = rawAllowedHosts
            .split(",")
            .map((v) => v.trim().toLowerCase())
            .filter(Boolean);

        // Fail closed: if no hosts are configured, deny all URLs.
        // Set ALLOWED_UPLOAD_HOSTS in .env to enable uploads.
        if (allowedHosts.length === 0) {
            return false;
        }

        return allowedHosts.includes(parsed.hostname.toLowerCase());
    } catch {
        return false;
    }
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

function matchesByPhone(candidate, studentPhoneKey, fatherPhoneKey) {
    const candidatePhones = [
        normalizePhoneKey(candidate?.studentPhone || ""),
        normalizePhoneKey(candidate?.fatherPhone || ""),
        normalizePhoneKey(candidate?.motherPhone || ""),
        normalizePhoneKey(candidate?.studentPhoneKey || ""),
        normalizePhoneKey(candidate?.fatherPhoneKey || ""),
        normalizePhoneKey(candidate?.motherPhoneKey || ""),
    ].filter(Boolean);

    if (!studentPhoneKey && !fatherPhoneKey) {
        return false;
    }

    return candidatePhones.includes(studentPhoneKey) || candidatePhones.includes(fatherPhoneKey);
}

function parseBypassEmails() {
    return String(process.env.ROUND_MATCH_BYPASS_EMAILS || "")
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
}

function getBypassDecision(req, app) {
    const appEmail = String(app?.email || "").trim().toLowerCase();
    const allowlistedEmails = parseBypassEmails();
    const bypassEnabledFlag = String(process.env.ROUND_MATCH_BYPASS_ENABLED || "").trim().toLowerCase();

    // Local/dev safety valve: enabled by default outside production unless explicitly turned off.
    const bypassGloballyEnabled = bypassEnabledFlag
        ? ["1", "true", "yes", "on"].includes(bypassEnabledFlag)
        : process.env.NODE_ENV !== "production";

    if (bypassGloballyEnabled) {
        return { enabled: true, source: "env_flag" };
    }

    if (appEmail && allowlistedEmails.includes(appEmail)) {
        return { enabled: true, source: "email_whitelist" };
    }

    const providedToken = String(req.headers["x-round-bypass-token"] || "").trim();
    const expectedToken = String(process.env.ROUND_MATCH_BYPASS_TOKEN || "").trim();

    if (providedToken && expectedToken && providedToken === expectedToken) {
        return { enabled: true, source: "header_token" };
    }

    return { enabled: false, source: "none" };
}

async function recordRoundMismatchAttempt({
    app,
    activeRound,
    reasonCode,
    reasonMessage,
    bypassed,
    bypassSource,
    candidateCount = 0,
}) {
    try {
        await RoundMismatchAttempt.create({
            application: app?._id || null,
            student: app?.student || null,
            round: activeRound?._id || null,
            fullName: String(app?.fullName || ""),
            fatherName: String(app?.fatherName || ""),
            motherName: String(app?.motherName || ""),
            email: String(app?.email || ""),
            studentPhone: String(app?.phone || ""),
            fatherPhone: String(app?.fatherPhone || ""),
            reasonCode,
            reasonMessage,
            bypassed: Boolean(bypassed),
            bypassSource: bypassSource || "none",
            candidateCount: Number(candidateCount || 0),
            activeRoundTitle: String(activeRound?.title || ""),
            attemptedAt: new Date(),
        });
    } catch {
        // Non-blocking log write: submission flow should not fail because of report logging.
    }
}

const uploadDocumentFile = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "file is required");
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/documents/${encodeURIComponent(req.file.filename)}`;
    return sendSuccess(res, "File uploaded", {
        fileUrl,
        fileName: req.file.originalname || "",
        mimeType: req.file.mimetype || "",
    }, 201);
});

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
        // Step 1 – Identity
        "fullName", "fatherName", "motherName", "dateOfBirth", "gender",
        // Step 1 – Contact
        "email", "phone", "fatherPhone", "motherPhone", "address",
        // Step 1 – Hobbies & achievements
        "hobbies", "otherAchievements",
        // Step 2 – Academic
        "programApplied", "branch",
        "tenthMarks", "twelfthMarks",
        "tenthBoard", "twelfthBoard",
        "tenthPassingYear", "twelfthPassingYear",
        "entranceExam", "entranceScoreOrRank",
    ];

    // Number fields: coerce strings → numbers so they are stored correctly
    // in MongoDB (schema types these as Number). Without coercion they
    // arrive as strings and Mongoose stores null, which breaks submitApplication's
    // required-field check.
    const numberFields = new Set(["tenthMarks", "twelfthMarks", "tenthPassingYear", "twelfthPassingYear"]);
    const dateFields = new Set(["dateOfBirth"]);

    const updates = {};
    for (const f of allowed) {
        if (req.body[f] === undefined) continue;
        const raw = req.body[f];
        if (numberFields.has(f)) {
            const n = Number(raw);
            updates[f] = (raw === "" || raw === null || Number.isNaN(n)) ? null : n;
        } else if (dateFields.has(f)) {
            if (raw === "" || raw === null) {
                updates[f] = null;
            } else {
                const parsed = new Date(raw);
                updates[f] = Number.isNaN(parsed.getTime()) ? null : parsed;
            }
        } else {
            updates[f] = raw;
        }
    }

    let app = await Application.findOne({ student: req.user.id });
    if (!app) {
        app = await Application.create({ student: req.user.id });
    }

    // Keep autosave quiet for locked applications instead of throwing 400 in UI.
    if (app.status === "admitted") {
        return sendSuccess(res, "Application is locked; draft sync skipped", { application: app });
    }

    // FIX #1: On PATCH, just save the data without verification.
    // Round verification happens at submitApplication time, not during draft saves.
    // This prevents 400 errors when user is still filling in partial data.
    // Only do verification if explicitly marked (e.g., via X-Verify header or query param)
    const shouldVerify = req.query.verify === "true" || req.headers["x-verify"] === "true";

    if (shouldVerify) {
        const merged = {
            fullName: updates.fullName !== undefined ? updates.fullName : app.fullName,
            fatherName: updates.fatherName !== undefined ? updates.fatherName : app.fatherName,
            motherName: updates.motherName !== undefined ? updates.motherName : app.motherName,
            phone: updates.phone !== undefined ? updates.phone : app.phone,
            fatherPhone: updates.fatherPhone !== undefined ? updates.fatherPhone : app.fatherPhone,
        };

        const hasAnyIdentityInput = [merged.fullName, merged.fatherName, merged.motherName, merged.phone, merged.fatherPhone]
            .some((value) => String(value || "").trim() !== "");

        if (hasAnyIdentityInput) {
            const studentNameKey = normalizeNameKey(merged.fullName);
            const fatherNameKey = normalizeNameKey(merged.fatherName);
            const motherNameKey = normalizeNameKey(merged.motherName);
            const studentPhoneKey = normalizePhoneKey(merged.phone);
            const fatherPhoneKey = normalizePhoneKey(merged.fatherPhone);

            if (!studentNameKey || !fatherNameKey || !motherNameKey) {
                throw new ApiError(400, "Student name, father name and mother name are required for round verification");
            }

            const now = new Date();
            const activeRound = await AdmissionRound.findOne({
                status: "active",
                startDate: { $lte: now },
                deadline: { $gte: now },
            })
                .sort({ startDate: -1, createdAt: -1 })
                .lean();

            if (!activeRound) {
                throw new ApiError(400, "No active admission round is currently open for verification");
            }

            const matchingCandidates = await RoundCandidate.find({
                round: activeRound._id,
                studentNameKey,
                fatherNameKey,
                motherNameKey,
            }).lean();

            if (matchingCandidates.length === 0) {
                throw new ApiError(403, "Your details do not match the active round student list");
            }

            let matchedCandidate = matchingCandidates[0];
            if (matchingCandidates.length > 1) {
                if (!studentPhoneKey && !fatherPhoneKey) {
                    throw new ApiError(403, "Multiple matches found. Enter your phone number or father phone number to verify");
                }

                matchedCandidate = matchingCandidates.find((candidate) =>
                    matchesByPhone(candidate, studentPhoneKey, fatherPhoneKey)
                );

                if (!matchedCandidate) {
                    throw new ApiError(403, "Name matched but phone verification failed for this round");
                }
            }

            updates.verifiedRound = activeRound._id;
            updates.verifiedRoundCandidate = matchedCandidate._id;
            updates.roundEligibilityVerifiedAt = new Date();

            await RoundCandidate.findByIdAndUpdate(matchedCandidate._id, {
                matchedApplication: app._id,
                matchedAt: new Date(),
            });
        }
    }

    app.set(updates);
    await app.save();
    return sendSuccess(res, "Application updated", { application: app });
});

// POST /api/student/application/submit
const submitApplication = asyncHandler(async (req, res) => {
    const app = await Application.findOne({ student: req.user.id });
    if (!app) throw new ApiError(400, "No active application found to submit");

    // Keep this endpoint idempotent for already-submitted flows.
    // The documents page can call submit before moving ahead, even when
    // payment has already been submitted.
    const alreadySubmittedStatuses = new Set([
        "under_review",
        "documents_verified",
        "payment_pending",
        "payment_submitted",
        "payment_verified",
        "admitted",
    ]);
    if (alreadySubmittedStatuses.has(app.status)) {
        return sendSuccess(res, "Application already submitted", { application: app });
    }

    const requiredFields = [
        // Identity
        "fullName", "fatherName", "dateOfBirth", "gender",
        // Contact
        "email", "phone", "fatherPhone", "motherPhone", "address",
        // Academic
        "programApplied", "branch",
        "tenthMarks", "twelfthMarks",
        "tenthBoard", "twelfthBoard",
        "tenthPassingYear", "twelfthPassingYear",
    ];
    const missing = [];
    for (const f of requiredFields) {
        const val = app[f];
        if (val === undefined || val === null || val === "") {
            missing.push(f);
        }
    }
    if (missing.length > 0) {
        // Return a clear, human-readable message listing all missing fields.
        const readable = missing.join(", ");
        throw new ApiError(400, `Please complete your form before submitting. Missing fields: ${readable}`);
    }
    // NOW verify admission round eligibility (after required field check)
    // This is the only place we verify - NOT during draft saves
    const studentNameKey = normalizeNameKey(app.fullName);
    const fatherNameKey = normalizeNameKey(app.fatherName);
    const motherNameKey = normalizeNameKey(app.motherName);
    const studentPhoneKey = normalizePhoneKey(app.phone);
    const fatherPhoneKey = normalizePhoneKey(app.fatherPhone);

    if (!studentNameKey || !fatherNameKey || !motherNameKey) {
        throw new ApiError(400, "Student name, father name and mother name are required for round verification");
    }

    const now = new Date();
    const activeRound = await AdmissionRound.findOne({
        status: "active",
        startDate: { $lte: now },
        deadline: { $gte: now },
    })
        .sort({ startDate: -1, createdAt: -1 })
        .lean();

    if (!activeRound) {
        throw new ApiError(400, "No active admission round is currently open. Please check back later.");
    }

    const matchingCandidates = await RoundCandidate.find({
        round: activeRound._id,
        studentNameKey,
        fatherNameKey,
        motherNameKey,
    }).lean();

    const bypassDecision = getBypassDecision(req, app);

    if (matchingCandidates.length === 0) {
        const msg = "Your details do not match the active round student list. Please verify your information is correct.";
        await recordRoundMismatchAttempt({
            app,
            activeRound,
            reasonCode: "no_match",
            reasonMessage: msg,
            bypassed: bypassDecision.enabled,
            bypassSource: bypassDecision.source,
            candidateCount: 0,
        });

        if (bypassDecision.enabled) {
            app.verifiedRound = activeRound._id;
            app.verifiedRoundCandidate = null;
            app.roundEligibilityVerifiedAt = new Date();

            if (["draft", "re_upload"].includes(app.status)) {
                app.status = "submitted";
                app.progressBar.formFilled = true;
                app.submittedAt = new Date();
            }

            await app.save();
            return sendSuccess(res, "Application submitted (test bypass enabled)", { application: app });
        }

        throw new ApiError(403, "Your details do not match the active round student list. Please verify your information is correct.");
    }

    let matchedCandidate = matchingCandidates[0];
    if (matchingCandidates.length > 1) {
        if (!studentPhoneKey && !fatherPhoneKey) {
            const msg = "Multiple matches found. Enter your phone number or father phone number to verify";
            await recordRoundMismatchAttempt({
                app,
                activeRound,
                reasonCode: "multiple_without_phone",
                reasonMessage: msg,
                bypassed: bypassDecision.enabled,
                bypassSource: bypassDecision.source,
                candidateCount: matchingCandidates.length,
            });

            if (bypassDecision.enabled) {
                app.verifiedRound = activeRound._id;
                app.verifiedRoundCandidate = null;
                app.roundEligibilityVerifiedAt = new Date();

                if (["draft", "re_upload"].includes(app.status)) {
                    app.status = "submitted";
                    app.progressBar.formFilled = true;
                    app.submittedAt = new Date();
                }

                await app.save();
                return sendSuccess(res, "Application submitted (test bypass enabled)", { application: app });
            }

            throw new ApiError(403, "Multiple matches found. Enter your phone number or father phone number to verify");
        }

        matchedCandidate = matchingCandidates.find((candidate) =>
            matchesByPhone(candidate, studentPhoneKey, fatherPhoneKey)
        );

        if (!matchedCandidate) {
            const msg = "Name matched but phone verification failed for this round";
            await recordRoundMismatchAttempt({
                app,
                activeRound,
                reasonCode: "phone_mismatch",
                reasonMessage: msg,
                bypassed: bypassDecision.enabled,
                bypassSource: bypassDecision.source,
                candidateCount: matchingCandidates.length,
            });

            if (bypassDecision.enabled) {
                app.verifiedRound = activeRound._id;
                app.verifiedRoundCandidate = null;
                app.roundEligibilityVerifiedAt = new Date();

                if (["draft", "re_upload"].includes(app.status)) {
                    app.status = "submitted";
                    app.progressBar.formFilled = true;
                    app.submittedAt = new Date();
                }

                await app.save();
                return sendSuccess(res, "Application submitted (test bypass enabled)", { application: app });
            }

            throw new ApiError(403, "Name matched but phone verification failed for this round");
        }
    }

    // Mark as verified
    app.verifiedRound = activeRound._id;
    app.verifiedRoundCandidate = matchedCandidate._id;
    app.roundEligibilityVerifiedAt = new Date();

    await RoundCandidate.findByIdAndUpdate(matchedCandidate._id, {
        matchedApplication: app._id,
        matchedAt: new Date(),
    });
    // Only transition to "submitted" if the app is still in a form-editable state.
    if (["draft", "re_upload"].includes(app.status)) {
        app.status = "submitted";
        app.progressBar.formFilled = true;
        app.submittedAt = new Date();
        await app.save();
    }

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
    if (!app.progressBar.formFilled || !["submitted", "re_upload", "under_review", "payment_submitted"].includes(app.status)) {
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
        { upsert: true, returnDocument: "after" }
    );

    if (!app.progressBar.documentsUploaded || app.status === "re_upload") {
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
    const { upiId, transactionId, screenshotUrl, amount } = req.body;

    if (!upiId) throw new ApiError(400, "upiId is required");
    if (!transactionId) throw new ApiError(400, "transactionId is required");

    if (!/^[a-zA-Z0-9._@-]{3,80}$/.test(upiId)) {
        throw new ApiError(400, "upiId format is invalid (e.g. yourname@bank)");
    }
    if (!/^[a-zA-Z0-9_-]{6,64}$/.test(transactionId)) {
        throw new ApiError(400, "transactionId format is invalid");
    }
    // screenshotUrl is optional until CDN integration is complete.
    // If provided, validate that it's an allowed https URL.
    if (screenshotUrl && !isAllowedFileUrl(screenshotUrl)) {
        throw new ApiError(400, "screenshotUrl must be a valid https URL from an allowed host");
    }

    const app = await Application.findOne({ student: req.user.id });
    if (!app) throw new ApiError(404, "Application not found");

    // Allow payment from any post-submission status so students can submit
    // payment after documents are uploaded, without waiting for admin review.
    const PAYMENT_ALLOWED_STATUSES = [
        "submitted", "under_review", "documents_verified", "payment_pending",
    ];
    if (!PAYMENT_ALLOWED_STATUSES.includes(app.status)) {
        throw new ApiError(400, `Payment not allowed at current application status: ${app.status}`);
    }

    const normalizedAmount = Number(amount);
    if (amount === undefined || Number.isNaN(normalizedAmount) || normalizedAmount <= 0) {
        throw new ApiError(400, "amount is required and must be a positive number");
    }

    const existingPayment = await Payment.findOne({ application: app._id }).select("minLimit maxLimit");
    if (app.status === "payment_pending") {
        if (!existingPayment) {
            throw new ApiError(400, "Payment window is not configured yet. Please contact accounts office.");
        }
        const min = Number(existingPayment.minLimit || 0);
        const max = Number(existingPayment.maxLimit || 0);
        if (normalizedAmount < min || normalizedAmount > max) {
            throw new ApiError(400, `amount must be between ${min} and ${max}`);
        }
    }

    // We avoid starting a transaction here because most local MongoDB databases 
    // are standalone and do not support replica set transactions, which throws a 500 error.
    const payment = await Payment.findOneAndUpdate(
        { application: app._id },
        {
            $set: {
                student: req.user.id,
                application: app._id,
                upiId,
                transactionId,
                screenshotUrl,
                paymentMode: "online",
                amount: normalizedAmount,
                status: "submitted",
            },
        },
        { upsert: true, returnDocument: "after" }
    );

    await Application.findByIdAndUpdate(
        app._id,
        {
            status: "payment_submitted",
            "progressBar.paymentDone": true,
        }
    );

    return sendSuccess(res, "Payment submitted", { payment });
});

export {
    getOrCreateApplication,
    updateApplication,
    submitApplication,
    uploadDocumentFile,
    uploadDocument,
    getMyDocuments,
    getMyPayment,
    submitPayment,
};
