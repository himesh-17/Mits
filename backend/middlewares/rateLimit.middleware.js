import { sendError } from "../utils/apiResponse.js";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 120;

const hits = new Map();

export function simpleRateLimit(req, res, next) {
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
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
