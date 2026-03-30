import User from "../Models/user.model.js";
import AuditLog from "../Models/auditLog.model.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyGoogleIdToken } from "../Services/Authentication/googleAuth.service.js";
import { generateToken } from "../utils/jwt.utils.js";
import { cookieOptions } from "../utils/cookie.utils.js";

const ADMIN_ALLOWED_DOMAINS = ["@mitsgwl.ac.in", "@mitsgwalior.ac.in"];

function isAllowedAdminDomain(email = "") {
    const normalizedEmail = String(email).toLowerCase();
    return ADMIN_ALLOWED_DOMAINS.some((domain) => normalizedEmail.endsWith(domain));
}

function sanitizeUser(user) {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        picture: user.picture,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

const googleLogin = asyncHandler(async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        throw new ApiError(400, "idToken is required");
    }

    const profile = await verifyGoogleIdToken(idToken);

    const lookupConditions = [{ googleSub: profile.googleSub }];

    if (profile.emailVerified) {
        lookupConditions.push({ email: profile.email });
    }

    let user;

    try {
        user = await User.findOneAndUpdate(
            { $or: lookupConditions },
            {
                $set: {
                    googleSub: profile.googleSub,
                    name: profile.name,
                    picture: profile.picture,
                    emailVerified: profile.emailVerified,
                    ...(profile.emailVerified ? { email: profile.email } : {}),
                },
                $setOnInsert: {
                    role: "student",
                },
            },
            { upsert: true, returnDocument: "after" }
        );
    } catch (error) {
        if (error?.code === 11000) {
            user =
                await User.findOne({ googleSub: profile.googleSub }) ||
                (profile.emailVerified
                    ? await User.findOne({ email: profile.email }) : null
                );

            if (!user) throw error;

            user.name = profile.name;
            user.picture = profile.picture;
            user.emailVerified = profile.emailVerified;

            if (profile.emailVerified) {
                user.email = profile.email;
            }

            await user.save();
        } else {
            throw error;
        }
    }

    if (!user.role) {
        user.role = profile.role || "student";
        await user.save();
    }

    // Domain-based admin access for MITS institutional emails.
    if (profile.emailVerified && isAllowedAdminDomain(profile.email) && user.role !== "administrator") {
        const previousRole = user.role || "student";
        user.role = "administrator";
        await user.save();

        try {
            await AuditLog.create({
                actor: user._id,
                actorName: user.name || profile.name || "",
                actorRole: "administrator",
                actorRoleLabel: "Super Admin",
                actionLabel: "ROLE_ELEVATED",
                actionTone: "slate",
                department: "ADMIN PANEL",
                departmentTone: "slate",
                module: "auth",
                entityType: "user",
                entityId: String(user._id),
                entityRef: `User ${String(user.email || profile.email || "").toLowerCase()}`,
                fromStatus: String(previousRole || "").toUpperCase(),
                toStatus: "ADMINISTRATOR",
                notes: "domain-based elevation",
                metadata: {
                    securityEvent: true,
                    previousRole,
                    newRole: "administrator",
                    elevationReason: "domain-based elevation",
                },
            });
        } catch (auditError) {
            console.error("[Auth] failed to write role elevation audit", auditError?.message || auditError);
        }
    }

    const safeUser = sanitizeUser(user);

    const token = generateToken(user);
    res.cookie("token", token, cookieOptions);

    return sendSuccess(
        res,
        "Google authentication successful",
        { user: safeUser, token },
        200
    );
});

const getMe = asyncHandler(async (req, res) => {
    const safeUser = {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        picture: req.user.picture,
    };

    return sendSuccess(
        res,
        "Authenticated user fetched successfully",
        { user: safeUser },
        200
    );
});

const logout = asyncHandler(async (req, res) => {
    const clearCookieOptions = {
        ...cookieOptions,
        maxAge: undefined,
    };

    res.clearCookie("token", clearCookieOptions);

    return sendSuccess(res, "Logged out successfully", {}, 200);
});

export { googleLogin, getMe, logout };