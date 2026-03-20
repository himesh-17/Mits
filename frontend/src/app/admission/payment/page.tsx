"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, UserRound } from "lucide-react";
import toast from "react-hot-toast";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema, PaymentFormData } from "../../../lib/validationSchemas";

import AdmissionHeader from "../../../components/admission/AdmissionHeader";
import ProgressBar from "../../../components/admission/ProgressBar";
import StepTabs from "../../../components/admission/StepTabs";
import PaymentSubmission from "../../../components/admission/PaymentSubmission";
import PaymentActions from "../../../components/admission/PaymentActions";
import { useAdmissionForm } from "../../../context/AdmissionContext";
import { api } from "../../../utils/api";

import AdmissionNavbar from "../../../components/admission/AdmissionNavbar";

export default function PaymentPage() {
    const { formData, updateFormData } = useAdmissionForm();
    const [progress, setProgress] = useState(75);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const methods = useForm<PaymentFormData>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            upiId: formData.upiId,
            transactionId: formData.transactionId,
        },
        mode: "onChange",
    });

    useEffect(() => {
        methods.reset({
            upiId: formData.upiId,
            transactionId: formData.transactionId,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData]);

    useEffect(() => {
        const subscription = methods.watch((value) => {
            updateFormData(value as Partial<PaymentFormData>);
        });
        return () => subscription.unsubscribe();
    }, [methods, updateFormData]);

    const handleSubmit = async () => {
        const values = methods.getValues();
        if (!values.upiId || !values.transactionId) {
            toast.error("Please fill in your UPI ID and Transaction ID.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Get the screenshot URL from the uploaded payment document
            // TODO: wire up file upload — store the CDN URL in state after upload completes
            const screenshotUrl = formData.docsUploaded?.["payment"]
                ? (formData.docsUploaded["payment"] as unknown as { url?: string }).url
                : undefined;

            if (!screenshotUrl) {
                toast.error("Please upload your payment screenshot before submitting.");
                setIsSubmitting(false);
                return;
            }

            // Submit payment details (application is already "submitted" from the documents step)
            await api.post("/api/student/payment/submit", {
                upiId: values.upiId,
                transactionId: values.transactionId,
                screenshotUrl,
                amount: 1000,
            });

            setProgress(100);
            toast.success("Payment submitted successfully!");
            setTimeout(() => setIsSubmitted(true), 600);
        } catch (error: unknown) {
            const msg =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message
                || "Submission failed. Please try again.";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FormProvider {...methods}>
            <div className="min-h-screen bg-[#F8FAFC]">
                <AdmissionNavbar />

                {/* MAIN CONTENT */}
                <main className="max-w-[900px] mx-auto py-6 md:py-8 px-4 relative">
                    <div className="mb-6 transition-all duration-500">
                        <AdmissionHeader step={4} title="Payment Submission" percentText={`${progress}% Completed`} />
                        <ProgressBar percent={progress} />
                    </div>

                    {/* Payment Status Card */}
                    <div className={`mb-6 p-4 rounded-xl border flex items-center gap-4 transition-all duration-500 ${isSubmitted
                        ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
                        : 'bg-[#FFFBEB] border-[#FEF3C7] text-[#92400E]'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isSubmitted ? 'bg-[#DCFCE7]' : 'bg-[#FEF3C7]'}`}>
                            {isSubmitted ? (
                                <CheckCircle2 className="w-6 h-6 text-[#16A34A]" />
                            ) : (
                                <UserRound className="w-6 h-6 text-[#D97706]" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-sm sm:text-base">
                                {isSubmitted ? "Payment Submitted Successfully" : "Payment Not Yet Submitted"}
                            </h3>
                            <p className="text-xs opacity-80">
                                {isSubmitted
                                    ? "Your transaction is being processed. It may take 24-48 hours to verify."
                                    : "Please complete the payment and enter your transaction details below."}
                            </p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <StepTabs activeStep={4} />
                    </div>

                    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-4 sm:p-6 md:p-8 pb-8 md:pb-10">
                        <div className="space-y-8">
                            <PaymentSubmission />
                            <PaymentActions onSubmit={handleSubmit} isSubmitting={isSubmitting} />
                        </div>
                    </div>

                    {/* Success Modal */}
                    {isSubmitted && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                            <div className="bg-white rounded-2xl p-8 sm:p-10 max-w-md w-full mx-4 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                                <CheckCircle2 className="w-16 sm:w-20 h-16 sm:h-20 text-[#16A34A] mb-6" />
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-4">Payment Submitted!</h2>
                                <p className="text-[#64748B] mb-8 text-sm sm:text-base">
                                    Your admission form and payment details have been successfully submitted for verification.
                                    We will notify you once verified.
                                </p>
                                <button
                                    onClick={() => window.location.href = '/student-dashboard'}
                                    className="w-full h-12 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold rounded-lg transition-colors cursor-pointer active:scale-[0.98]"
                                >
                                    Return to Dashboard
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </FormProvider>
    );
}
