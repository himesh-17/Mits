"use client";

import { Phone } from "lucide-react";
import { useAdmissionForm } from "../../context/AdmissionContext";

export default function ContactDetails() {
    const { formData, updateFormData } = useAdmissionForm();

    return (
        <div className="space-y-5">
            {/* Section Title */}
            <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#0F172A]" />
                <h2 className="text-base font-bold text-[#0F172A]">Contact Details</h2>
            </div>

            {/* Row 1: Email + Mobile */}
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        placeholder="example@gmail.com"
                        value={formData.email}
                        onChange={(e) => updateFormData({ email: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-[#E5E7EB] text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9]"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 h-10 rounded-l-md border border-r-0 border-[#E5E7EB] bg-[#F8FAFC] text-sm text-[#64748B] font-medium">
                            +91
                        </span>
                        <input
                            type="tel"
                            placeholder="9876543210"
                            value={formData.mobile}
                            onChange={(e) => updateFormData({ mobile: e.target.value })}
                            className="w-full h-10 px-3 rounded-r-md border border-[#E5E7EB] text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9]"
                        />
                    </div>
                </div>
            </div>

            {/* Row 2: Father's Mobile + Mother's Mobile */}
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Father&apos;s Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 h-10 rounded-l-md border border-r-0 border-[#E5E7EB] bg-[#F8FAFC] text-sm text-[#64748B] font-medium">
                            +91
                        </span>
                        <input
                            type="tel"
                            placeholder="9876543210"
                            value={formData.fatherMobile}
                            onChange={(e) => updateFormData({ fatherMobile: e.target.value })}
                            className="w-full h-10 px-3 rounded-r-md border border-[#E5E7EB] text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9]"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Mother&apos;s Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 h-10 rounded-l-md border border-r-0 border-[#E5E7EB] bg-[#F8FAFC] text-sm text-[#64748B] font-medium">
                            +91
                        </span>
                        <input
                            type="tel"
                            placeholder="9876543210"
                            value={formData.motherMobile}
                            onChange={(e) => updateFormData({ motherMobile: e.target.value })}
                            className="w-full h-10 px-3 rounded-r-md border border-[#E5E7EB] text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9]"
                        />
                    </div>
                </div>
            </div>

            {/* Permanent Address */}
            <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                    Permanent Address <span className="text-red-500">*</span>
                </label>
                <textarea
                    rows={4}
                    placeholder="Flat No., Building, Street Area..."
                    value={formData.address}
                    onChange={(e) => updateFormData({ address: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-md border border-[#E5E7EB] text-sm text-[#0F172A] placeholder-[#94A3B8] resize-none focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9]"
                />
            </div>
        </div>
    );
}
