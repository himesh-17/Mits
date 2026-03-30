"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    UserRound,
    Search,
    Bell,
    LayoutDashboard,
    FileText,
    CreditCard,
    LogOut,
    AlertTriangle,
    CheckCircle2,
    Upload,
    X,
    Activity,
    Menu,
    AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { validateFile } from "../../lib/validationSchemas";
import { api } from "../../utils/api";

export default function PaymentsPage() {
    const [paymentStatus, setPaymentStatus] = useState<"pending" | "submitted">("pending");
    const [showModal, setShowModal] = useState(false);
    const [upiId, setUpiId] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ upiId?: string; transactionId?: string; screenshot?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mobileSidebar, setMobileSidebar] = useState(false);
    const [userName, setUserName] = useState("Student");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const saved = localStorage.getItem("googleUserInfo");
        if (saved) {
            try {
                const info = JSON.parse(saved);
                if (info.name) setUserName(info.name);
            } catch { /* ignore */ }
        }
    }, []);

    const handleSubmitClick = () => {
        setShowModal(true);
        setErrors({});
    };

    const validateAndSubmit = async () => {
        const newErrors: { upiId?: string; transactionId?: string; screenshot?: string } = {};
        if (!upiId.trim()) newErrors.upiId = "UPI ID is required";
        if (!transactionId.trim()) newErrors.transactionId = "Transaction ID is required";
        if (!screenshot) newErrors.screenshot = "Payment screenshot is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post("/api/student/payment/submit", {
                upiId: upiId.trim(),
                transactionId: transactionId.trim(),
                amount: 75000,
            });
            setPaymentStatus("submitted");
            setShowModal(false);
            toast.success("Payment submitted successfully!");
        } catch (error) {
            const message =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                "Payment submission failed. Please try again.";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const error = validateFile(file);
            if (error) {
                setErrors((prev) => ({ ...prev, screenshot: error }));
                return;
            }

            // Generate preview
            const reader = new FileReader();
            reader.onload = (ev) => {
                setPreviewUrl(ev.target?.result as string);
            };
            reader.readAsDataURL(file);

            setScreenshot(file);
            setErrors((prev) => ({ ...prev, screenshot: undefined }));
        }
    };

    return (
        <div className="min-h-screen bg-[#F3F4F6] flex flex-col">
            {/* ─── TOP NAVBAR ─── */}
            <nav className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB] h-16 flex items-center px-4 md:px-6 justify-between">
                {/* Left — Logo + Brand */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setMobileSidebar(!mobileSidebar)}
                        className="lg:hidden p-1 text-[#0F172A] cursor-pointer mr-1"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <Image
                        src="/mits.png"
                        alt="MITS Logo"
                        width={48}
                        height={48}
                        className="object-contain"
                    />
                    <span className="text-lg font-bold text-[#0EA5E9]">Admission Portal</span>
                </div>

                {/* Center — Session text */}
                <span className="text-sm font-medium text-[#64748B] hidden md:block">
                    Admission 2026-27
                </span>

                {/* Right — Icons + User */}
                <div className="flex items-center gap-3 sm:gap-5">
                    <Search className="w-5 h-5 text-[#94A3B8] cursor-pointer hover:text-[#0F172A] transition hidden sm:block" />
                    <Bell className="w-5 h-5 text-[#94A3B8] cursor-pointer hover:text-[#0F172A] transition" />
                    <div className="flex items-center gap-3 ml-1 sm:ml-2">
                        <div className="text-right leading-tight hidden sm:block">
                            <p className="text-xs font-semibold text-[#0EA5E9]">GJ-2026-8842</p>
                            <p className="text-xs text-[#0F172A] font-medium">{userName}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 overflow-hidden">
                            <UserRound className="w-7 h-7 mt-2" />
                        </div>
                    </div>
                </div>
            </nav>

            {/* ─── BODY: SIDEBAR + MAIN ─── */}
            <div className="flex flex-1">
                {/* Mobile sidebar overlay */}
                {mobileSidebar && (
                    <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileSidebar(false)}>
                        <div className="absolute inset-0 bg-black/30" />
                    </div>
                )}

                {/* ─── LEFT SIDEBAR ─── */}
                <aside className={`${mobileSidebar ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-50 lg:z-auto w-[250px] bg-white border-r border-[#E5E7EB] flex flex-col justify-between min-h-[calc(100vh-64px)] transition-transform duration-300`}>
                    <div className="py-6">
                        <div className="flex items-center justify-between px-6 mb-4">
                            <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">
                                My Application
                            </p>
                            <button onClick={() => setMobileSidebar(false)} className="lg:hidden p-1 text-[#94A3B8] cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <nav className="flex flex-col gap-1 px-3">
                            <Link
                                href="/student-dashboard"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#334155] hover:bg-[#F1F5F9] transition"
                            >
                                <LayoutDashboard className="w-[18px] h-[18px] text-[#64748B]" />
                                Dashboard
                            </Link>

                            <Link
                                href="/admission"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#334155] hover:bg-[#F1F5F9] transition"
                            >
                                <FileText className="w-[18px] h-[18px] text-[#64748B]" />
                                Application Form
                            </Link>

                            <Link
                                href="/payments"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#38BDF8] transition"
                            >
                                <CreditCard className="w-[18px] h-[18px] text-white" />
                                Payments
                            </Link>

                            <a
                                href="#"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#334155] hover:bg-[#F1F5F9] transition"
                            >
                                <Activity className="w-[18px] h-[18px] text-[#64748B]" />
                                Status Tracker
                            </a>
                        </nav>
                    </div>

                    {/* Bottom: User Profile + Logout */}
                    <div className="px-6 pb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 overflow-hidden">
                                <UserRound className="w-7 h-7 mt-2" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[#0F172A]">{userName}</p>
                                <p className="text-xs text-[#94A3B8]">Student Portal</p>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600 transition cursor-pointer">
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </aside>

                {/* ─── MAIN CONTENT ─── */}
                <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto">
                    {/* Page Title */}
                    <div className="mb-6">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">Payment</h1>
                        <p className="text-lg font-bold text-[#FACC15] mt-0.5">BTECH</p>
                    </div>

                    {/* ─── ADMISSION FEE CARD ─── */}
                    <div className="w-full max-w-[620px] bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] rounded-2xl p-5 sm:p-8 mb-6 shadow-md">
                        <p className="text-sm text-white/80 font-medium mb-1">Admission Fee Amount</p>
                        <p className="text-3xl sm:text-5xl font-extrabold text-white mb-2">₹ 75,000</p>
                        <p className="text-sm text-white/80 font-medium">
                            One-time admission processing fee (non-refundable)
                        </p>
                    </div>

                    {/* ─── PAYMENT STATUS CARD ─── */}
                    <div className="w-full max-w-[620px] bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5 sm:p-8">
                        {/* Status Banner */}
                        {paymentStatus === "pending" ? (
                            <div className="flex items-start gap-3 mb-6">
                                <AlertTriangle className="w-7 h-7 text-[#FACC15] flex-shrink-0 mt-0.5" />
                                <div>
                                    <h2 className="text-lg font-bold text-[#EAB308]">Payment Not Yet Submitted</h2>
                                    <p className="text-sm text-[#64748B]">
                                        Complete your application and submit payment via UPI.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start gap-3 mb-6">
                                <CheckCircle2 className="w-7 h-7 text-[#16A34A] flex-shrink-0 mt-0.5" />
                                <div>
                                    <h2 className="text-lg font-bold text-[#16A34A]">
                                        Payment Submitted Successfully
                                    </h2>
                                    <p className="text-sm text-[#64748B]">
                                        Your payment details have been submitted and are under verification.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Payment Instructions */}
                        {paymentStatus === "pending" && (
                            <>
                                <h3 className="text-base font-bold text-[#0F172A] mb-3">Payment Instructions</h3>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-[#475569] mb-8">
                                    <li>Open any UPI app (Gpay, PhonePe, Paytm)</li>
                                    <li>
                                        Transfer <span className="font-semibold text-[#0F172A]">₹75,000</span> to{" "}
                                        <span className="font-semibold text-[#0F172A]">mits.admissions@okaxis</span>
                                    </li>
                                    <li>Take a screenshot of the successful payment</li>
                                    <li>Enter the UPI ID, and upload the screenshot in your application</li>
                                </ol>

                                {/* Submit Button */}
                                <button
                                    onClick={handleSubmitClick}
                                    className="w-full h-12 bg-[#38BDF8] hover:bg-[#0EA5E9] text-white font-bold text-base rounded-xl transition-colors cursor-pointer shadow-sm active:scale-[0.98]"
                                >
                                    Submit Payment Details →
                                </button>
                            </>
                        )}

                        {paymentStatus === "submitted" && (
                            <div className="mt-2 p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl">
                                <p className="text-sm text-[#166534] font-medium">
                                    <span className="font-bold">Transaction ID:</span> {transactionId}
                                </p>
                                {screenshot && (
                                    <p className="text-sm text-[#166534] font-medium mt-1">
                                        <span className="font-bold">Screenshot:</span> {screenshot.name}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* ─── MODAL ─── */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 sm:p-8 relative animate-in zoom-in-95 duration-200">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#0F172A] transition cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl font-bold text-[#0F172A] mb-1">Submit Payment Details</h2>
                        <p className="text-sm text-[#64748B] mb-6">
                            Enter your UPI transaction details below.
                        </p>

                        {/* UPI ID */}
                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-[#334155] mb-1.5">
                                Your UPI ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={upiId}
                                onChange={(e) => {
                                    setUpiId(e.target.value);
                                    setErrors((prev) => ({ ...prev, upiId: undefined }));
                                }}
                                placeholder="e.g. yourname@bank"
                                className={`w-full h-11 px-4 rounded-lg border text-sm text-[#0F172A] placeholder:text-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] transition ${errors.upiId ? "border-red-400" : "border-[#E2E8F0]"
                                    }`}
                            />
                            {errors.upiId && (
                                <p className="text-xs text-red-500 mt-1">{errors.upiId}</p>
                            )}
                        </div>

                        {/* Transaction ID */}
                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-[#334155] mb-1.5">
                                UPI Transaction ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={transactionId}
                                onChange={(e) => {
                                    setTransactionId(e.target.value);
                                    setErrors((prev) => ({ ...prev, transactionId: undefined }));
                                }}
                                placeholder="e.g. 4283901273849"
                                className={`w-full h-11 px-4 rounded-lg border text-sm text-[#0F172A] placeholder:text-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] transition ${errors.transactionId ? "border-red-400" : "border-[#E2E8F0]"
                                    }`}
                            />
                            {errors.transactionId && (
                                <p className="text-xs text-red-500 mt-1">{errors.transactionId}</p>
                            )}
                        </div>

                        {/* Screenshot Upload */}
                        <div className="mb-8">
                            <label className="block text-sm font-semibold text-[#334155] mb-1.5">
                                Payment Screenshot <span className="text-red-500">*</span>
                            </label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center cursor-pointer hover:border-[#0EA5E9] transition ${errors.screenshot ? "border-red-400 bg-red-50" : "border-[#E2E8F0] bg-[#FAFAFA]"
                                    }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                {screenshot ? (
                                    <div className="flex flex-col items-center gap-2">
                                        {previewUrl && (
                                            <div className="w-14 h-14 rounded-lg border border-[#E5E7EB] overflow-hidden">
                                                <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <p className="text-sm font-medium text-[#16A34A]">{screenshot.name}</p>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 text-[#94A3B8] mb-2" />
                                        <p className="text-sm text-[#94A3B8]">
                                            Click to upload <span className="text-[#64748B]">(PNG, JPG only, max 10MB)</span>
                                        </p>
                                    </>
                                )}
                            </div>
                            {errors.screenshot && (
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                                    <p className="text-xs text-red-500">{errors.screenshot}</p>
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            onClick={validateAndSubmit}
                            disabled={isSubmitting}
                            className="w-full h-12 bg-[#38BDF8] hover:bg-[#0EA5E9] text-white font-bold text-base rounded-xl transition-colors cursor-pointer active:scale-[0.98]"
                        >
                            {isSubmitting ? "Submitting..." : "Confirm & Submit"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
