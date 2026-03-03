import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        application: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
            required: true,
            unique: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        utsId: { type: String, trim: true, default: "" },

        amount: { type: Number, default: 0 },
        minLimit: { type: Number, default: 0 },
        maxLimit: { type: Number, default: 0 },

        challanFileUrl: { type: String, trim: true, default: "" },

        status: {
            type: String,
            enum: ["pending", "submitted", "verified", "rejected"],
            default: "pending",
        },

        paymentMode: {
            type: String,
            enum: ["online", "offline", ""],
            default: "",
        },

        transactionId: { type: String, trim: true, default: "" },
        sendLink: { type: String, trim: true, default: "" },

        verifyingOfficer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        verifiedAt: { type: Date, default: null },
        rejectionReason: { type: String, trim: true, default: "" },
        remarks: { type: String, trim: true, default: "" },
    },
    { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
