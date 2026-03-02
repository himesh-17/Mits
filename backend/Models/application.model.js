import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        // ── Personal Info ──────────────────────────────────────────
        fullName: { type: String, trim: true, default: "" },
        fatherName: { type: String, trim: true, default: "" },
        motherName: { type: String, trim: true, default: "" },
        dateOfBirth: { type: Date, default: null },
        gender: { type: String, enum: ["male", "female", "other", ""], default: "" },
        category: { type: String, trim: true, default: "" },
        nationality: { type: String, trim: true, default: "Indian" },
        religion: { type: String, trim: true, default: "" },
        phone: { type: String, trim: true, default: "" },
        alternatePhone: { type: String, trim: true, default: "" },
        address: { type: String, trim: true, default: "" },
        city: { type: String, trim: true, default: "" },
        state: { type: String, trim: true, default: "" },
        pincode: { type: String, trim: true, default: "" },

        // ── Academic Info ──────────────────────────────────────────
        branch: { type: String, trim: true, default: "" },
        course: { type: String, trim: true, default: "" },
        semester: { type: Number, default: 1 },
        rollNumber: { type: String, trim: true, default: "" },
        previousInstitution: { type: String, trim: true, default: "" },
        previousPercentage: { type: Number, default: null },
        admissionYear: { type: Number, default: new Date().getFullYear() },

        // ── Application Status ─────────────────────────────────────
        status: {
            type: String,
            enum: [
                "draft",
                "submitted",
                "under_review",
                "documents_pending",
                "rejected",
                "re_upload",
                "documents_verified",
                "payment_pending",
                "payment_submitted",
                "payment_verified",
                "admitted",
            ],
            default: "draft",
        },

        // ── Progress Tracking ──────────────────────────────────────
        progressBar: {
            formFilled: { type: Boolean, default: false },
            documentsUploaded: { type: Boolean, default: false },
            documentsVerified: { type: Boolean, default: false },
            paymentDone: { type: Boolean, default: false },
            admissionConfirmed: { type: Boolean, default: false },
        },

        // ── Staff Actions ──────────────────────────────────────────
        rejectionReason: { type: String, trim: true, default: "" },
        remarksGeneralOffice: { type: String, trim: true, default: "" },
        remarksAccountOffice: { type: String, trim: true, default: "" },
        remarksAdmissionCell: { type: String, trim: true, default: "" },

        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        admittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

        submittedAt: { type: Date, default: null },
        verifiedAt: { type: Date, default: null },
        admittedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

const Application = mongoose.model("Application", applicationSchema);

export default Application;
