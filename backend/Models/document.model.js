import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
    {
        application: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
            required: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        docType: {
            type: String,
            enum: [
                "photo",
                "signature",
                "aadhar",
                "marksheet_10",
                "marksheet_12",
                "transfer_certificate",
                "migration_certificate",
                "caste_certificate",
                "income_certificate",
                "domaicile",
                "jee_result",
                "other",
            ],
            required: true,
        },
        fileUrl: { type: String, trim: true, required: true },
        fileName: { type: String, trim: true, default: "" },
        mimeType: { type: String, trim: true, default: "" },
        status: {
            type: String,
            enum: ["pending", "verified", "rejected"],
            default: "pending",
        },
        rejectionReason: { type: String, trim: true, default: "" },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        verifiedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

const Document = mongoose.model("Document", documentSchema);

export default Document;
