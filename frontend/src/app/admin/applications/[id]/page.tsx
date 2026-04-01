"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiUser, FiBook, FiFile, FiEye, FiCheck, FiX, FiAlertTriangle, FiFileText, FiRefreshCw } from "react-icons/fi";
import { api } from "../../../../utils/api";
import StatusBadge from "../../../../components/admin/StatusBadge";
import DocumentViewer from "../../../../components/admin/DocumentViewer";

type DocItem = {
    docType: string;
    fileName: string;
    fileUrl: string;
    mimeType: string;
    status: string;
};

type ApplicationDetail = {
    id: string;
    fullName: string;
    fatherName: string;
    motherName: string;
    dateOfBirth: string;
    gender: string;
    email: string;
    phone: string;
    fatherPhone: string;
    motherPhone: string;
    address: string;
    hobbies: string[];
    otherAchievements: string;
    programApplied: string;
    branch: string;
    tenthMarks: number | null;
    twelfthMarks: number | null;
    tenthBoard: string;
    twelfthBoard: string;
    tenthPassingYear: number | null;
    twelfthPassingYear: number | null;
    entranceExam: string;
    entranceScoreOrRank: string;
    status: string;
    documents: DocItem[];
};

const MOCK_APP: ApplicationDetail = {
    id: "mock-1",
    fullName: "Arjun Mehta",
    fatherName: "Rajesh Mehta",
    motherName: "Sunita Mehta",
    dateOfBirth: "2005-06-15",
    gender: "male",
    email: "arjun.mehta@gmail.com",
    phone: "9876543210",
    fatherPhone: "9876543211",
    motherPhone: "9876543212",
    address: "123 Main Street, Gwalior, MP 474001",
    hobbies: ["Cricket", "Reading", "Coding"],
    otherAchievements: "State level science olympiad winner",
    programApplied: "BTECH",
    branch: "CSE",
    tenthMarks: 92.4,
    twelfthMarks: 88.6,
    tenthBoard: "CBSE",
    twelfthBoard: "CBSE",
    tenthPassingYear: 2021,
    twelfthPassingYear: 2023,
    entranceExam: "JEE Main",
    entranceScoreOrRank: "45000",
    status: "Under Review",
    documents: [
        { docType: "aadhar", fileName: "aadhar_card.jpg", fileUrl: "/uploads/documents/aadhar_card.jpg", mimeType: "image/jpeg", status: "pending" },
        { docType: "marksheet_10", fileName: "10th_marksheet.jpg", fileUrl: "/uploads/documents/10th_marksheet.jpg", mimeType: "image/jpeg", status: "pending" },
        { docType: "marksheet_12", fileName: "12th_marksheet.jpg", fileUrl: "/uploads/documents/12th_marksheet.jpg", mimeType: "image/jpeg", status: "pending" },
        { docType: "domicile", fileName: "domicile.pdf", fileUrl: "/uploads/documents/domicile.pdf", mimeType: "application/pdf", status: "pending" },
        { docType: "photo", fileName: "photo.jpg", fileUrl: "/uploads/documents/photo.jpg", mimeType: "image/jpeg", status: "pending" },
        { docType: "signature", fileName: "signature.png", fileUrl: "/uploads/documents/signature.png", mimeType: "image/png", status: "pending" },
    ],
};

const DOC_LABELS: Record<string, string> = {
    aadhar: "Aadhar Card",
    marksheet_10: "10th Marksheet",
    marksheet_12: "12th Marksheet",
    domicile: "Domicile Certificate",
    photo: "Passport Photo",
    signature: "Signature",
};

export default function ApplicationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const appId = params?.id as string;
    const [app, setApp] = useState<ApplicationDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewingDoc, setViewingDoc] = useState<DocItem | null>(null);
    const [actionLoading, setActionLoading] = useState("");

    useEffect(() => {
        async function fetchDetail() {
            try {
                const res = await api.get(`/api/admin/application/${appId}`);
                const data = res?.data?.data?.application;
                if (data) {
                    const docsRes = await api.get(`/api/admin/application/${appId}/documents`).catch(() => null);
                    const docs = Array.isArray(docsRes?.data?.data?.documents) ? docsRes.data.data.documents : [];
                    setApp({ ...data, documents: docs });
                    if (docs.length > 0) setViewingDoc(docs[0]);
                    return;
                }
                setApp(MOCK_APP);
                if (MOCK_APP.documents.length > 0) setViewingDoc(MOCK_APP.documents[0]);
            } catch {
                setApp(MOCK_APP);
            } finally {
                setIsLoading(false);
            }
        }
        void fetchDetail();
    }, [appId]);

    const handleAction = async (action: "approve" | "reject" | "request_changes") => {
        setActionLoading(action);
        try {
            await api.post(`/api/admin/application/${appId}/${action}`);
            if (app) {
                const newStatus = action === "approve" ? "Documents Verified" : action === "reject" ? "Rejected" : "Under Review";
                setApp({ ...app, status: newStatus });
            }
        } catch {
            // silent
        } finally {
            setActionLoading("");
        }
    };

    if (isLoading) {
        return (
            <section className="admin-section-enter w-full space-y-4">
                <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-64 bg-white rounded-lg border border-black/10 animate-pulse" />
                <div className="h-48 bg-white rounded-lg border border-black/10 animate-pulse" />
            </section>
        );
    }

    if (!app) return <p className="text-[#94A3B8]">Application not found.</p>;

    return (
        <section className="admin-section-enter w-full space-y-6 [font-family:var(--font-inter)]">
            {/* Breadcrumb Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[14px]">
                    <span className="text-[#8A98A8]">Applications</span>
                    <span className="text-[#8A98A8]">/</span>
                    <span className="font-bold text-[#2DA8E1]">ADM-TUDENT{app.id.slice(-2).toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-3">
                    <h1 className="text-[18px] font-bold text-[#0F1724]">{app.fullName}</h1>
                    <StatusBadge status={app.status} size="sm" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-8 items-start">
                {/* Left Column: Info Cards */}
                <div className="space-y-6">
                    {/* Personal Information */}
                    <div className="bg-white rounded-xl border border-black/[0.05] shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-black/[0.05] flex items-center gap-3 bg-[#F8FAFC]/50">
                            <FiUser className="text-[#2DA8E1]" />
                            <h2 className="text-[15px] font-bold text-[#0F1724]">Personal Information</h2>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-x-8 gap-y-5">
                            <InfoItem label="Date of Birth" value={app.dateOfBirth} />
                            <InfoItem label="Gender" value={app.gender} />
                            <InfoItem label="Blood Group" value="O+ Positive" />
                            <InfoItem label="Category" value="SC" />
                            <InfoItem label="Email Address" value={app.email} />
                            <InfoItem label="Primary Contact" value={app.phone} />
                        </div>
                    </div>

                    {/* Academic Information */}
                    <div className="bg-white rounded-xl border border-black/[0.05] shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-black/[0.05] flex items-center gap-3 bg-[#F8FAFC]/50">
                            <FiBook className="text-[#2DA8E1]" />
                            <h2 className="text-[15px] font-bold text-[#0F1724]">Academic Information</h2>
                        </div>
                        <div className="p-6 space-y-8">
                            <div className="space-y-4">
                                <p className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider">Class XII (Senior Secondary)</p>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[15px] font-bold text-[#0F1724]">{app.twelfthBoard} Board</p>
                                        <p className="text-[13px] text-[#8A98A8]">Science Stream • Year: {app.twelfthPassingYear}</p>
                                    </div>
                                    <p className="text-[18px] font-bold text-[#10B981]">{app.twelfthMarks}%</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-black/[0.05] space-y-4">
                                <p className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider">Entrance Exam (JEE MAIN)</p>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[14px] font-bold text-[#0F1724]">Score / Rank</p>
                                        <p className="text-[13px] text-[#8A98A8]">Application Number: --</p>
                                    </div>
                                    <p className="text-[16px] font-bold text-[#0F1724]">AIR {app.entranceScoreOrRank}</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-black/[0.05] grid grid-cols-2 gap-8">
                                <InfoItem label="Program Applied" value={app.programApplied} valueColor="text-[#10B981]" />
                                <InfoItem label="Branch Applied" value={app.branch} valueColor="text-[#10B981]" />
                            </div>
                        </div>
                    </div>

                    {/* Uploaded Documents */}
                    <div className="bg-white rounded-xl border border-black/[0.05] shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-black/[0.05] flex items-center gap-3 bg-[#F8FAFC]/50">
                            <FiFile className="text-[#2DA8E1]" />
                            <h2 className="text-[15px] font-bold text-[#0F1724]">Uploaded Documents</h2>
                        </div>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {app.documents.map((doc, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setViewingDoc(doc)}
                                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left group ${viewingDoc?.docType === doc.docType ? "border-[#2DA8E1] bg-[#F0F9FF]" : "border-black/[0.05] bg-white hover:bg-gray-50"}`}
                                >
                                    <div className={`h-8 w-8 rounded flex items-center justify-center shrink-0 ${viewingDoc?.docType === doc.docType ? "bg-[#2DA8E1] text-white" : "bg-gray-100 text-[#64748B] group-hover:bg-[#2DA8E1]/10 group-hover:text-[#2DA8E1]"}`}>
                                        <FiFileText />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[13px] font-bold text-[#0F1724] truncate">{DOC_LABELS[doc.docType] || doc.docType}</p>
                                        <p className="text-[11px] text-[#8A98A8] truncate">{doc.fileName}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Activity Log */}
                    <div className="bg-white rounded-xl border border-black/[0.05] shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-black/[0.05] flex items-center gap-3 bg-[#F8FAFC]/50">
                            <FiFileText className="text-[#2DA8E1]" />
                            <h2 className="text-[15px] font-bold text-[#0F1724]">Activity Log</h2>
                        </div>
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 h-3 w-3 rounded-full bg-[#10B981] shadow-[0_0_0_4px_rgba(16,185,129,0.1)]" />
                                <div>
                                    <p className="text-[14px] font-bold text-[#0F1724]">Applied Successfully</p>
                                    <p className="text-[12px] text-[#8A98A8]">15 Jul 2024, 05:30 am</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Viewer + Actions */}
                <div className="space-y-6 lg:sticky lg:top-6">
                    <div className="bg-white rounded-xl border border-black/[0.05] shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                        <div className="px-4 py-3 border-b border-black/[0.05] bg-[#F8FAFC]/50 flex items-center justify-between">
                            <p className="text-[13px] text-[#64748B]">Viewing: <span className="font-bold text-[#0F1724]">{viewingDoc ? (DOC_LABELS[viewingDoc.docType] || viewingDoc.docType) : "Select a document"}</span></p>

                            {viewingDoc && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-[#8A98A8] uppercase">Doc Status:</span>
                                    <select
                                        className="text-[12px] font-bold bg-white border border-black/10 rounded px-2 py-1 outline-none focus:border-[#2DA8E1]"
                                        value={viewingDoc.status || "pending"}
                                        onChange={(e) => {
                                            if (app) {
                                                const newDocs = app.documents.map(d =>
                                                    d.docType === viewingDoc.docType ? { ...d, status: e.target.value } : d
                                                );
                                                setApp({ ...app, documents: newDocs });
                                                setViewingDoc({ ...viewingDoc, status: e.target.value });
                                            }
                                        }}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F1F5F9]/30">
                            {viewingDoc ? (
                                <div className="w-full h-full min-h-[400px] relative">
                                    {viewingDoc.mimeType.startsWith("image/") ? (
                                        <img src={viewingDoc.fileUrl} alt={viewingDoc.fileName} className="max-w-full h-auto rounded-lg shadow-sm" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-4">
                                            <FiFile className="text-6xl text-[#94A3B8]" />
                                            <p className="text-sm text-[#64748B]">{viewingDoc.fileName}</p>
                                            <a href={viewingDoc.fileUrl} target="_blank" rel="noreferrer" className="text-blue-500 font-bold hover:underline">Download PDF</a>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4 text-[#94A3B8]">
                                    <FiFile className="text-6xl opacity-20" />
                                    <p className="text-[14px] font-medium">No documents uploaded yet</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-white border-t border-black/[0.05] space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => void handleAction("approve")}
                                    className="h-11 rounded-lg bg-[#10B981] text-white text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-[#059669] transition-all"
                                >
                                    <FiCheck /> Approve
                                </button>
                                <button
                                    onClick={() => void handleAction("request_changes")}
                                    className="h-11 rounded-lg bg-[#F59E0B] text-white text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-[#D97706] transition-all"
                                >
                                    <FiRefreshCw /> Request Re-upload
                                </button>
                            </div>
                            <button
                                onClick={() => void handleAction("reject")}
                                className="w-full h-11 rounded-lg border border-[#EF4444] text-[#EF4444] text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-[#FEF2F2] transition-all"
                            >
                                <FiX /> Reject
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="h-12 rounded-xl bg-[#64748B] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#475569] transition-all">
                            Previous
                        </button>
                        <button className="h-12 rounded-xl bg-[#2DA8E1] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#1D91C8] transition-all">
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

function InfoItem({
    label,
    value,
    className = "",
    valueColor = "text-[#0F1724]"
}: {
    label: string;
    value: string;
    className?: string;
    valueColor?: string;
}) {
    return (
        <div className={className}>
            <p className="text-[12px] font-bold text-[#8A98A8] mb-1">{label}</p>
            <p className={`text-[15px] font-medium ${valueColor}`}>{value || "-"}</p>
        </div>
    );
}
