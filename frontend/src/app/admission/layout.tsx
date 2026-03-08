import { AdmissionProvider } from "../../context/AdmissionContext";

export default function AdmissionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdmissionProvider>
            {children}
        </AdmissionProvider>
    );
}
