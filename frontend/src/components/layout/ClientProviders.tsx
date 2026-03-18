"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import ToastProvider from "./ToastProvider";
import { AdmissionProvider } from "../../context/AdmissionContext";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <AdmissionProvider>
                <ToastProvider />
                {children}
            </AdmissionProvider>
        </GoogleOAuthProvider>
    );
}
