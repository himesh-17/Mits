import mongoose from "mongoose";

const rateLimitHitSchema = new mongoose.Schema(
    {
        ip: { type: String, required: true, unique: true, index: true },
        count: { type: Number, required: true, default: 0 },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true }
);

rateLimitHitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RateLimitHit = mongoose.model("RateLimitHit", rateLimitHitSchema);

export default RateLimitHit;
