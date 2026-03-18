"use client";

import { useState } from "react";

export default function PaymentView() {
  const [upiId, setUpiId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Title */}
      <h1 className="text-xl sm:text-2xl font-semibold">Payment</h1>
      <p className="text-[#2DA8E1] font-medium mb-6">BTECH</p>

      {/* Fee Card */}
      <div className="w-full bg-[#2DA8E1] text-white rounded-xl p-5 sm:p-6 mb-6">
        <p className="text-sm">Admission Fee Amount</p>

        <h2 className="text-3xl sm:text-4xl font-bold mt-1">₹ 75,000</h2>

        <p className="text-sm mt-2">
          One-time admission processing fee (non-refundable)
        </p>
      </div>

      {/* Payment Form */}
      <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6 border w-full">
        {/* Status */}
        <div className="flex items-center gap-2 text-yellow-600 mb-4">
          <span>⚠</span>
          <p className="font-medium">Payment Not Yet Submitted</p>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Complete your application and submit payment via UPI.
        </p>

        {/* Instructions */}
        <div className="text-sm space-y-2 mb-6">
          <p className="font-medium">Payment Instructions</p>

          <p>1. Open any UPI app (GPay, PhonePe, Paytm)</p>
          <p>
            2. Transfer ₹75,000 to <b>mits.admissions@okaxis</b>
          </p>
          <p>3. Take a screenshot of the successful payment</p>
          <p>4. Enter the UPI ID and upload screenshot</p>
        </div>

        {/* UPI ID */}
        <div className="mb-4">
          <label className="text-sm font-medium">UPI Transaction ID</label>

          <input
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="Enter UPI transaction ID"
            className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2DA8E1]"
          />
        </div>

        {/* Screenshot Upload */}
        <div className="mb-6">
          <label className="text-sm font-medium">
            Upload Payment Screenshot
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
            className="mt-2 w-full text-sm"
          />
        </div>

        {/* Submit Button */}
        <button className="w-full bg-[#2DA8E1] text-white py-3 rounded-md hover:bg-[#2594c7] transition">
          Submit Payment Details →
        </button>
      </div>
    </div>
  );
}
