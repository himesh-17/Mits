import User from "../Models/user.model.js";
import { sendError } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const STUDENT_ALLOWED_DOMAIN = "@gmail.com";
const STAFF_ALLOWED_DOMAIN = "@mitsgwl.ac.in";

// Important fix #4: In-memory user cache to avoid hitting MongoDB on every request.
// TTL of 60s — short enough to pick up deactivations quickly.
const USER_CACHE_TTL_MS = 60_000;
const userCache = new Map();

function getCachedUser(userId) {
    const entry = userCache.get(userId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        userCache.delete(userId);
        return null;
    }
    return entry.user;
}

function setCachedUser(userId, user) {
    userCache.set(userId, { user, expiresAt: Date.now() + USER_CACHE_TTL_MS });
}

// Prune stale cache entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [id, entry] of userCache) {
        if (entry.expiresAt <= now) userCache.delete(id);
    }
}, 5 * 60_000);

const verifyJWT = asyncHandler(async (req, res, next) => {

    let token = req.cookies?.token;

    // Check Authorization header (Bearer token) if cookie is missing or anyway
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return sendError(res, "Authentication token missing", 401);
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return sendError(res, "Invalid or expired token", 401);
    }

    // Try cache first, fall back to DB
    let user = getCachedUser(String(decoded.id));
    if (!user) {
        user = await User.findById(decoded.id).select(
            "_id name email role picture isActive"
        );
        if (user) setCachedUser(String(decoded.id), user);
    }

    if (!user) {
        return sendError(res, "User not found", 401);
    }

    if (!user.isActive) {
        return sendError(res, "Your account is inactive", 403);
    }

    req.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        picture: user.picture,
    };

    next();
});

export { verifyJWT };
// Backward-compatible export used by existing route files.
export { verifyJWT as verifyGoogleToken };

const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user?.role) {
            return sendError(res, "Role not found in authenticated user", 403);
        }

        if (!allowedRoles.includes(req.user.role)) {
            return sendError(res, "You are not allowed to access this resource", 403);
        }

        const email = String(req.user.email || "").toLowerCase();

        if (req.user.role === "student") {
            if (!email.endsWith(STUDENT_ALLOWED_DOMAIN)) {
                return sendError(
                    res,
                    "Student access is allowed only for @gmail.com accounts",
                    403
                );
            }
        } else if (!email.endsWith(STAFF_ALLOWED_DOMAIN)) {
            return sendError(
                res,
                "Staff/admin access is allowed only for @mitsgwl.ac.in accounts",
                403
            );
        }

        next();
    };
};

export { requireRole };