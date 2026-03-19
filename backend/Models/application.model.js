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

        email: { type: String, trim: true, lowercase: true, default: "" },
        phone: { type: String, trim: true, default: "" }, // student mobile
        fatherPhone: { type: String, trim: true, default: "" },
        motherPhone: { type: String, trim: true, default: "" },

        address: { type: String, trim: true, default: "" },
        city: { type: String, trim: true, default: "" },
        state: { type: String, trim: true, default: "" },
        pincode: { type: String, trim: true, default: "" },

        hobbies: [{ type: String, trim: true }],
        otherAchievements: { type: String, trim: true, default: "" },

        // ── Academic Info ──────────────────────────────────────────
        programApplied: { type: String, trim: true, default: "" },
        branch: {
            type: String,
            enum: ["", "CSE", "ECE", "MECH", "CIVIL", "IOT", "IT", "ET", "AI"],
            default: "",
        },
        tenthMarks: { type: Number, default: null },
        twelfthMarks: { type: Number, default: null },
        tenthBoard: { type: String, trim: true, default: "" },
        twelfthBoard: { type: String, trim: true, default: "" },
        tenthPassingYear: { type: Number, default: null },
        twelfthPassingYear: { type: Number, default: null },
        entranceExam: { type: String, trim: true, default: "" },
        entranceScoreOrRank: { type: String, trim: true, default: "" },
    
 // Step 3: Documents
    documents: {
      identityProof: { type : mongoose.Schema.Types.ObjectId , ref : "Document" },
      tenthMarksheet: { type : mongoose.Schema.Types.ObjectId , ref : "Document" },
      twelfthMarksheet: { type : mongoose.Schema.Types.ObjectId , ref : "Document" },
      entranceScorecard: { type : mongoose.Schema.Types.ObjectId , ref : "Document" },
      categoryCertificate: { type : mongoose.Schema.Types.ObjectId , ref : "Document" },
      domicileCertificate: { type : mongoose.Schema.Types.ObjectId , ref : "Document" },
      abcId: { type : mongoose.Schema.Types.ObjectId , ref : "Document" },
      passportPhoto: { type : mongoose.Schema.Types.ObjectId , ref : "Document" },
      signature: { type : mongoose.Schema.Types.ObjectId , ref : "Document" },
    },

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
