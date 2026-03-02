import User from "../models/user.model.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyGoogleIdToken } from "../Services/googleAuth.service.js";
import jwt from "jsonwebtoken";

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
                    email: profile.email,
                    role: profile.role,
                },
            },
            { upsert: true, new: true }
        );
    } catch (error) {
        if (error?.code === 11000) {
            user = await User.findOne({ googleSub: profile.googleSub })
                || (profile.emailVerified ? await User.findOne({ email: profile.email }) : null);
            if (!user) throw error;
        } else {
            throw error;
        }
    }

    if (!user.role) {
        user.role = profile.role;
        await user.save();
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new ApiError(500, "JWT_SECRET is missing in environment variables");
    }

    const token = jwt.sign(
        {
            sub: user._id.toString(),
            role: user.role,
            email: user.email,
        },
        jwtSecret,
        { expiresIn: "7d" }
    );

    res.cookie("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const safeUser = sanitizeUser(user);

    return sendSuccess(
        res,
        "Google authentication successful",
        {
            user: safeUser,
            token,
        },
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
        {
            user: safeUser,
        },
        200
    );
});

export { googleLogin, getMe };