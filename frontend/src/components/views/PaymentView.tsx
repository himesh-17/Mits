"use client";

import { CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { useAdmissionForm } from "../../context/AdmissionContext";

export default function PaymentView() {
    const { formData } = useAdmissionForm();
    const isSubmitted = !!formData.transactionId;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
                <p className="text-gray-500 text-sm">Review your admission fee and payment status.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fee Card */}
                <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <span className="font-semibold uppercase tracking-wider text-sm opacity-90">Admission Fee</span>
                        </div>

                        <div className="mt-8">
                            <span className="text-4xl font-bold">₹75,000</span>
                            <p className="mt-2 text-sky-100 text-sm italic">Academic Year 2026-27</p>
                        </div>
                    </div>
                </div>

                {/* Status Card */}
                <div className={`rounded-2xl border p-6 flex flex-col justify-between transition-all duration-500 bg-white ${isSubmitted ? "border-green-200" : "border-yellow-200"
                    }`}>
                    <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-xl ${isSubmitted ? "bg-green-50" : "bg-yellow-50"}`}>
                            {isSubmitted ? (
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            ) : (
                                <AlertCircle className="w-8 h-8 text-yellow-600" />
                            )}
                        </div>

                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${isSubmitted ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            }`}>
                            {isSubmitted ? "Paid" : "Pending"}
                        </span>
                    </div>

                    <div className="mt-4">
                        <h3 className="text-lg font-bold text-gray-900">
                            {isSubmitted ? "Payment Successful" : "Action Required"}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {isSubmitted
                                ? "Your fee has been submitted and is currently under verification."
                                : "Please complete your payment to proceed with the admission process."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Transaction Summary */}
            {isSubmitted && (
                <div className="bg-white rounded-xl border p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-4">Transaction Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-400">Transaction ID</p>
                            <p className="font-mono font-medium text-gray-700 mt-1">{formData.transactionId}</p>
                        </div>
                        <div>
                            <p className="text-gray-400">Method</p>
                            <p className="font-medium text-gray-700 mt-1">{formData.upiId || "UPI Transfer"}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
