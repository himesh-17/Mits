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
                "identity_proof",       // Aadhaar / PAN
                "marksheet_10",         // 10th Marksheet
                "marksheet_12",         // 12th Marksheet
                "entrance_scorecard",   // Entrance Exam Scorecard (Optional)
                "category_certificate", // Category Certificate (if applicable)
                "domicile_certificate", // Domicile Certificate
                "abc_id",              // ABC ID
                "passport_photo",       // Passport-size photo
                "signature",            // Signature
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

export default  Document;
