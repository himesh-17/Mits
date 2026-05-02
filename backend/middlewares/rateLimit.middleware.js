import { sendError } from "../utils/apiResponse.js";
import RateLimitHit from "../Models/rateLimitHit.model.js";

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const MAX_REQUESTS_PER_WINDOW = Number(
    process.env.RATE_LIMIT_MAX_REQUESTS || (process.env.NODE_ENV === "production" ? 120 : 1000)
);

function isRateLimitEnabled() {
    const raw = String(process.env.RATE_LIMIT_ENABLED || "").trim().toLowerCase();
    if (!raw) return process.env.NODE_ENV === "production";
    return ["1", "true", "yes", "on"].includes(raw);
}

function resolveRateLimitKey(req) {
    const ip = req.ip || "unknown";
    const apiPath = String(req.path || "").replace(/^\/+/, "");
    const routeGroup = apiPath.split("/")[0] || "root";
    return `${ip}|${routeGroup}`;
}

function shouldSkipRateLimit(req) {
    const apiPath = String(req.path || "").replace(/^\/+/, "").toLowerCase();

    // Never rate-limit auth endpoints to avoid accidental login lockouts,
    // especially when autosave/background API calls are frequent.
    if (apiPath.startsWith("auth/")) {
        return true;
    }

    return false;
}

export async function simpleRateLimit(req, res, next) {
    if (shouldSkipRateLimit(req)) {
        return next();
    }

    if (!isRateLimitEnabled()) {
        return next();
    }

    // Use Express-derived req.ip (respects trust proxy setting) to avoid spoofable headers.
    // Bucket by route group as well, so heavy draft autosave traffic doesn't block login.
    const key = resolveRateLimitKey(req);

    try {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + WINDOW_MS);
        const existing = await RateLimitHit.findOne({ ip: key });

        if (!existing || existing.expiresAt <= now) {
            await RateLimitHit.findOneAndUpdate(
                { ip: key },
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
