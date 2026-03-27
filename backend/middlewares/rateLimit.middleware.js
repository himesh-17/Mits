import { sendError } from "../utils/apiResponse.js";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 120;

const hits = new Map();

// Periodic cleanup: remove expired entries every minute to prevent memory leak
setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of hits) {
        if (data.expiresAt <= now) {
            hits.delete(ip);
        }
    }
}, 60_000);

export function simpleRateLimit(req, res, next) {
    // Fix #11: x-forwarded-for can be a comma-separated list — take only the first IP
    const rawIp = req.headers["x-forwarded-for"];
    const ip = rawIp
        ? rawIp.split(",")[0].trim()
        : (req.ip || "unknown");

    const now = Date.now();

    const existing = hits.get(ip);
    if (!existing || existing.expiresAt <= now) {
        hits.set(ip, { count: 1, expiresAt: now + WINDOW_MS });
        return next();
    }

    existing.count += 1;
    if (existing.count > MAX_REQUESTS_PER_WINDOW) {
        return sendError(res, "Too many requests. Please try again later.", 429);
    }

    return next();
}
