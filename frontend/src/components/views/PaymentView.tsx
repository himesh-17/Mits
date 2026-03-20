"use client";

import { useState } from "react";
import { CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { useAdmissionForm } from "../../context/AdmissionContext";

export default function PaymentView() {
  const { formData, updateFormData } = useAdmissionForm();
  const [upiId, setUpiId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const isSubmitted = !!formData.transactionId;

  const handleSubmitInternal = () => {
    if (!upiId) return;
    updateFormData({ transactionId: upiId });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
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

      {/* Payment Form OR Transaction Summary */}
      {!isSubmitted ? (
        <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6 border w-full animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 text-yellow-600 mb-4">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium text-sm sm:text-base">Payment Not Yet Submitted</p>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Complete your application and submit payment via UPI.
          </p>

          {/* Instructions */}
          <div className="text-sm space-y-2 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p className="font-bold text-gray-700 mb-2">Payment Instructions</p>
            <p className="flex items-start gap-2 text-gray-600">
              <span className="bg-gray-200 text-gray-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">1</span>
              Open any UPI app (GPay, PhonePe, Paytm)
            </p>
            <p className="flex items-start gap-2 text-gray-600">
              <span className="bg-gray-200 text-gray-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">2</span>
              Transfer ₹75,000 to <b className="text-sky-600">mits.admissions@okaxis</b>
            </p>
            <p className="flex items-start gap-2 text-gray-600">
              <span className="bg-gray-200 text-gray-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">3</span>
              Take a screenshot of the successful payment
            </p>
            <p className="flex items-start gap-2 text-gray-600">
              <span className="bg-gray-200 text-gray-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">4</span>
              Enter the UPI ID and upload screenshot
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 max-w-md">
            <div>
              <label className="text-sm font-semibold text-gray-700">UPI Transaction ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="Enter 12-digit transaction ID"
                className="mt-1.5 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Upload Payment Screenshot</label>
              <div className="mt-1.5 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-sky-500 transition-colors cursor-pointer bg-gray-50/50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                  className="hidden"
                  id="screenshot-upload"
                />
                <label htmlFor="screenshot-upload" className="cursor-pointer">
                  {screenshot ? (
                    <span className="text-sky-600 font-medium text-sm">{screenshot.name}</span>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-gray-500 text-sm">Click to upload or drag and drop</span>
                      <span className="text-xs text-gray-400 mt-1">PNG, JPG, PDF up to 5MB</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button
              onClick={handleSubmitInternal}
              disabled={!upiId}
              className="w-full bg-sky-500 text-white font-bold py-3.5 rounded-lg hover:bg-sky-600 transition-all active:scale-[0.98] mt-4 shadow-md shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Payment Details →
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border p-6 shadow-sm animate-in zoom-in-95 duration-500">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Transaction Summary
          </h4>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="space-y-1">
              <p className="text-gray-400 font-medium">Transaction ID</p>
              <p className="font-mono text-lg font-bold text-gray-800">{formData.transactionId}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400 font-medium">Payment Method</p>
              <p className="text-lg font-bold text-gray-800">{formData.upiId || "UPI Transfer"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400 font-medium">Submission Date</p>
              <p className="text-lg font-bold text-gray-800">{new Date().toLocaleDateString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400 font-medium">Verification Status</p>
              <p className="text-lg font-bold text-orange-500">Processing</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm text-blue-700">
              <b>Note:</b> It may take 24-48 hours for your payment to be verified by our admissions office. You will receive an email confirmation once the process is complete.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
