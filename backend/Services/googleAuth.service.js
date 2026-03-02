import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client();

function resolveRoleFromEmail(email) {
    const adminDomain = process.env.ADMIN_EMAIL_DOMAIN;

    if (adminDomain && email?.toLowerCase().endsWith(`@${adminDomain.toLowerCase()}`)) {
        return "admin";
    }

    return "student";
}

async function verifyGoogleIdToken(idToken) {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId) {
        throw new Error("GOOGLE_CLIENT_ID is missing in environment variables");
    }

    const ticket = await client.verifyIdToken({
        idToken,
        audience: googleClientId,
    });

    const payload = ticket.getPayload();

    if (!payload?.sub || !payload?.email) {
        throw new Error("Invalid Google token payload");
    }

    return {
        googleSub: payload.sub,
        email: payload.email,
        name: payload.name || "",
        picture: payload.picture || "",
        role: resolveRoleFromEmail(payload.email),
        emailVerified: Boolean(payload.email_verified),
    };
}

export { verifyGoogleIdToken, resolveRoleFromEmail };