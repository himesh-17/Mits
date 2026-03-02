import User from "../models/user.model.js";
import { verifyGoogleIdToken } from "../services/googleAuth.service.js";
import { sendError } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyGoogleToken = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return sendError(res, "Authorization token missing or invalid", 401);
    }

    const idToken = authHeader.split(" ")[1];
    const profile = await verifyGoogleIdToken(idToken);

    const user = await User.findOne({ googleSub: profile.googleSub }).select(
        "_id name email role picture isActive"
    );

    if (!user) {
        return sendError(res, "User not found. Please login first", 401);
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

function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user?.role) {
            return sendError(res, "Role not found in authenticated user", 403);
        }

        if (!allowedRoles.includes(req.user.role)) {
            return sendError(res, "You are not allowed to access this resource", 403);
        }

        next();
    };
}

export { verifyGoogleToken, requireRole };