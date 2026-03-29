import mongoose from "mongoose";

const admissionRoundSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
        },
        description: {
            type: String,
            trim: true,
            default: "",
            maxlength: 500,
        },
        startDate: {
            type: Date,
            required: true,
        },
        deadline: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["active", "frozen", "closed"],
            default: "active",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { timestamps: true }
);

admissionRoundSchema.index({ startDate: -1, createdAt: -1 });
admissionRoundSchema.index({ status: 1 });

const AdmissionRound = mongoose.model("AdmissionRound", admissionRoundSchema);

export default AdmissionRound;
