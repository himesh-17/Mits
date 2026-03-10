import User from "../Models/user.model.js";
import { verifyGoogleIdToken } from "../Services/Authentication/googleAuth.service.js";
import { sendError } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, res, next) => {

    const token = req.cookies?.token;

    if (!token) {
        return sendError(res, "Authentication token missing", 401);
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return sendError(res, "Invalid or expired token", 401);
    }

    const user = await User.findById(decoded.id).select(
        "_id name email role picture isActive"
    );

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

const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user?.role) {
            return sendError(res, "Role not found in authenticated user", 403);
        }

        if (!allowedRoles.includes(req.user.role)) {
            return sendError(res, "You are not allowed to access this resource", 403);
        }

        next();
    };
};

export {requireRole };