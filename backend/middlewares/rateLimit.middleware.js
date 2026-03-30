import { sendError } from "../utils/apiResponse.js";
import RateLimitHit from "../Models/rateLimitHit.model.js";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 120;

export async function simpleRateLimit(req, res, next) {
    // Use Express-derived req.ip (respects trust proxy setting) to avoid spoofable headers.
    const ip = req.ip || "unknown";

    try {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + WINDOW_MS);
        const existing = await RateLimitHit.findOne({ ip });

        if (!existing || existing.expiresAt <= now) {
            await RateLimitHit.findOneAndUpdate(
                { ip },
                { $set: { count: 1, expiresAt } },
                { upsert: true }
            );
            return next();
        }

        existing.count += 1;
        await existing.save();

        if (existing.count > MAX_REQUESTS_PER_WINDOW) {
            return sendError(res, "Too many requests. Please try again later.", 429);
        }

        return next();
    } catch (error) {
        console.error("[RateLimit] failed to evaluate rate limit", error?.message || error);
        return next();
    }
}
