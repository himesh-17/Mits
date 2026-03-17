"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { AdmissionProvider } from "../../context/AdmissionContext";

export default function AdmissionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

    useEffect(() => {
        let isMounted = true;

        async function validateSession() {
            try {
                const token = localStorage.getItem("authToken");
                await axios.get(`${apiBaseUrl}/api/auth/me`, {
                    withCredentials: true,
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });

                if (isMounted) {
                    setIsAuthorized(true);
                }
            } catch {
                if (isMounted) {
                    setIsAuthorized(false);
                    router.replace(`/login?next=${encodeURIComponent(pathname || "/admission")}`);
                }
            } finally {
                if (isMounted) {
                    setIsChecking(false);
                }
            }
        }

        validateSession();
        return () => {
            isMounted = false;
        };
    }, [apiBaseUrl, pathname, router]);

    if (isChecking || !isAuthorized) {
        return null;
    }

    return (
        <AdmissionProvider>
            <AnimatePresence mode="wait">
                <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </AdmissionProvider>
    );
}
