import User from "../models/user.model.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyGoogleIdToken } from "../Services/googleAuth.service.js";

const googleLogin = asyncHandler(async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        throw new ApiError(400, "idToken is required");
    }

    const profile = await verifyGoogleIdToken(idToken);

    let user = await User.findOne({ googleSub: profile.googleSub });

    if (!user) {
        user = await User.findOne({ email: profile.email });
    }

    if (!user) {
        user = await User.create(profile);
    } else {
        user.googleSub = profile.googleSub;
        user.name = profile.name;
        user.picture = profile.picture;
        user.emailVerified = profile.emailVerified;
        if (!user.role) {
            user.role = profile.role;
        }
        await user.save();
    }

    return sendSuccess(
        res,
        "Google authentication successful",
        {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                picture: user.picture,
            },
        },
        200
    );
});

const getMe = asyncHandler(async (req, res) => {
    return sendSuccess(
        res,
        "Authenticated user fetched successfully",
        {
            user: req.user,
        },
        200
    );
});

export { googleLogin, getMe };