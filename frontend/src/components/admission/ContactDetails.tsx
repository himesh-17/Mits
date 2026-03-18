"use client";

import { Phone, Lock } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useAdmissionForm } from "../../context/AdmissionContext";
import { PersonalFormData } from "../../lib/validationSchemas";

export default function ContactDetails() {
    const { googleUser } = useAdmissionForm();
    const { register, watch, formState: { errors } } = useFormContext<PersonalFormData>();
    const emailValue = watch("email");
    const isEmailFromGoogle = Boolean(googleUser?.email && emailValue === googleUser.email);

    return (
        <div className="space-y-5">
            {/* Section Title */}
            <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#0F172A]" />
                <h2 className="text-base font-bold text-[#0F172A]">Contact Details</h2>
            </div>

            {/* Row 1: Email + Mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="email"
                            placeholder="example@gmail.com"
                            {...register("email", {
                                onChange: (e) => {
                                    e.target.value = e.target.value.toLowerCase();
                                }
                            })}
                            readOnly={isEmailFromGoogle}
                            aria-invalid={!!errors.email}
                            aria-describedby={errors.email ? "email-error" : undefined}
                            className={`w-full h-11 md:h-10 px-3 rounded-md border text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-colors ${isEmailFromGoogle ? 'bg-[#F8FAFC] cursor-not-allowed pr-10' : ''} ${errors.email ? 'border-red-400 bg-red-50/50' : 'border-[#E5E7EB]'}`}
                        />
                        {isEmailFromGoogle && (
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                        )}
                    </div>
                    {isEmailFromGoogle && (
                        <p className="text-xs text-[#0EA5E9] mt-1">Auto-filled from Google account</p>
                    )}
                    {errors.email && (
                        <p id="email-error" className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 h-11 md:h-10 rounded-l-md border border-r-0 border-[#E5E7EB] bg-[#F8FAFC] text-sm text-[#64748B] font-medium">
                            +91
                        </span>
                        <input
                            type="tel"
                            placeholder="9876543210"
                            {...register("mobile", {
                                onChange: (e) => {
                                    e.target.value = e.target.value.replace(/\D/g, "");
                                }
                            })}
                            maxLength={10}
                            aria-invalid={!!errors.mobile}
                            aria-describedby={errors.mobile ? "mobile-error" : undefined}
                            className={`w-full h-11 md:h-10 px-3 rounded-r-md border text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-colors ${errors.mobile ? 'border-red-400 bg-red-50/50' : 'border-[#E5E7EB]'}`}
                        />
                    </div>
                    {errors.mobile && (
                        <p id="mobile-error" className="text-xs text-red-500 mt-1">{errors.mobile.message}</p>
                    )}
                </div>
            </div>

            {/* Row 2: Father's Mobile + Mother's Mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Father&apos;s Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 h-11 md:h-10 rounded-l-md border border-r-0 border-[#E5E7EB] bg-[#F8FAFC] text-sm text-[#64748B] font-medium">
                            +91
                        </span>
                        <input
                            type="tel"
                            placeholder="9876543210"
                            {...register("fatherMobile", {
                                onChange: (e) => {
                                    e.target.value = e.target.value.replace(/\D/g, "");
                                }
                            })}
                            maxLength={10}
                            aria-invalid={!!errors.fatherMobile}
                            aria-describedby={errors.fatherMobile ? "fatherMobile-error" : undefined}
                            className={`w-full h-11 md:h-10 px-3 rounded-r-md border text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-colors ${errors.fatherMobile ? 'border-red-400 bg-red-50/50' : 'border-[#E5E7EB]'}`}
                        />
                    </div>
                    {errors.fatherMobile && (
                        <p id="fatherMobile-error" className="text-xs text-red-500 mt-1">{errors.fatherMobile.message}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Mother&apos;s Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 h-11 md:h-10 rounded-l-md border border-r-0 border-[#E5E7EB] bg-[#F8FAFC] text-sm text-[#64748B] font-medium">
                            +91
                        </span>
                        <input
                            type="tel"
                            placeholder="9876543210"
                            {...register("motherMobile", {
                                onChange: (e) => {
                                    e.target.value = e.target.value.replace(/\D/g, "");
                                }
                            })}
                            maxLength={10}
                            aria-invalid={!!errors.motherMobile}
                            aria-describedby={errors.motherMobile ? "motherMobile-error" : undefined}
                            className={`w-full h-11 md:h-10 px-3 rounded-r-md border text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-colors ${errors.motherMobile ? 'border-red-400 bg-red-50/50' : 'border-[#E5E7EB]'}`}
                        />
                    </div>
                    {errors.motherMobile && (
                        <p id="motherMobile-error" className="text-xs text-red-500 mt-1">{errors.motherMobile.message}</p>
                    )}
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
                    {...register("address")}
                    maxLength={200}
                    aria-invalid={!!errors.address}
                    aria-describedby={errors.address ? "address-error" : undefined}
                    className={`w-full px-3 py-2.5 rounded-md border text-sm text-[#0F172A] placeholder-[#94A3B8] resize-none focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-colors ${errors.address ? 'border-red-400 bg-red-50/50' : 'border-[#E5E7EB]'}`}
                />
                {errors.address && (
                    <p id="address-error" className="text-xs text-red-500 mt-1">{errors.address.message}</p>
                )}
            </div>
        </div>
    );
}
