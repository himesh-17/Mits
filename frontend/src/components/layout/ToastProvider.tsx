"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 3000,
                style: {
                    background: "#0F172A",
                    color: "#fff",
                    fontSize: "14px",
                    borderRadius: "12px",
                    padding: "12px 16px",
                },
                success: {
                    iconTheme: {
                        primary: "#16A34A",
                        secondary: "#fff",
                    },
                },
                error: {
                    iconTheme: {
                        primary: "#EF4444",
                        secondary: "#fff",
                    },
                },
            }}
        />
    );
}
