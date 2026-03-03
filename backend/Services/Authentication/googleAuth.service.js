import { OAuth2Client } from "google-auth-library";
import { ApiError } from "../../utils/ApiError.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleIdToken = async (idToken) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload) {
            throw new ApiError(401, "Invalid Google token payload");
        }

        if (payload.iss !== "accounts.google.com" && payload.iss !== "https://accounts.google.com") {
            throw new ApiError(401, "Invalid token issuer");
        }

        if (!payload.email_verified) {
            throw new ApiError(403, "Google email not verified");
        }

        return {
            googleSub: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            emailVerified: payload.email_verified,
        };

    } catch (error) {
        throw new ApiError(401, "Invalid or expired Google token");
    }
};