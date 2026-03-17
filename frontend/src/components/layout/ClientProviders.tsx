"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import ToastProvider from "./ToastProvider";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <ToastProvider />
            {children}
        </GoogleOAuthProvider>
    );
}
