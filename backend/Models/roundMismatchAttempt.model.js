import mongoose from "mongoose";

const roundMismatchAttemptSchema = new mongoose.Schema(
    {
        application: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
            default: null,
            index: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },
        round: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AdmissionRound",
            default: null,
            index: true,
        },
        fullName: { type: String, trim: true, default: "" },
        fatherName: { type: String, trim: true, default: "" },
        motherName: { type: String, trim: true, default: "" },
        email: { type: String, trim: true, lowercase: true, default: "" },
        studentPhone: { type: String, trim: true, default: "" },
        fatherPhone: { type: String, trim: true, default: "" },
        reasonCode: {
            type: String,
            enum: ["no_match", "multiple_without_phone", "phone_mismatch"],
            required: true,
            index: true,
        },
        reasonMessage: { type: String, trim: true, default: "" },
        bypassed: { type: Boolean, default: false, index: true },
        bypassSource: {
            type: String,
            enum: ["none", "email_whitelist", "header_token", "env_flag"],
            default: "none",
        },
        candidateCount: { type: Number, default: 0 },
        activeRoundTitle: { type: String, trim: true, default: "" },
        attemptedAt: { type: Date, default: Date.now, index: true },
    },
    { timestamps: true }
);

const RoundMismatchAttempt = mongoose.model("RoundMismatchAttempt", roundMismatchAttemptSchema);

export default RoundMismatchAttempt;
