"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
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
                await axios.get(`${apiBaseUrl}/api/auth/me`, {
                    withCredentials: true,
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
            {children}
        </AdmissionProvider>
    );
}
