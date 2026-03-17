"use client";

import { UserRound } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { PersonalFormData } from "../../lib/validationSchemas";

export default function IdentityInformation() {
    const { register, formState: { errors } } = useFormContext<PersonalFormData>();

    return (
        <div className="space-y-5">
            {/* Section Title */}
            <div className="flex items-center gap-2">
                <UserRound className="w-5 h-5 text-[#0F172A]" />
                <h2 className="text-base font-bold text-[#0F172A]">
                    Identity Information
                </h2>
            </div>

            {/* Row 1: Full Name + Date of Birth */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Full Name (as per ID) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Full Name"
                        {...register("fullName", {
                            onChange: (e) => {
                                e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                            }
                        })}
                        aria-invalid={!!errors.fullName}
                        aria-describedby={errors.fullName ? "fullName-error" : undefined}
                        className={`w-full h-11 md:h-10 px-3 rounded-md border text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-colors ${errors.fullName ? 'border-red-400 bg-red-50/50' : 'border-[#E5E7EB]'}`}
                    />
                    {errors.fullName && (
                        <p id="fullName-error" className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        placeholder="mm/dd/yyyy"
                        {...register("dob")}
                        aria-invalid={!!errors.dob}
                        aria-describedby={errors.dob ? "dob-error" : undefined}
                        className={`w-full h-11 md:h-10 px-3 rounded-md border text-sm text-[#0F172A] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-colors ${errors.dob ? 'border-red-400 bg-red-50/50' : 'border-[#E5E7EB]'}`}
                    />
                    {errors.dob && (
                        <p id="dob-error" className="text-xs text-red-500 mt-1">{errors.dob.message}</p>
                    )}
                </div>
            </div>

            {/* Row 2: Father's Full Name + Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Father&apos;s Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Guardian Name"
                        {...register("fatherName", {
                            onChange: (e) => {
                                e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                            }
                        })}
                        aria-invalid={!!errors.fatherName}
                        aria-describedby={errors.fatherName ? "fatherName-error" : undefined}
                        className={`w-full h-11 md:h-10 px-3 rounded-md border text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-colors ${errors.fatherName ? 'border-red-400 bg-red-50/50' : 'border-[#E5E7EB]'}`}
                    />
                    {errors.fatherName && (
                        <p id="fatherName-error" className="text-xs text-red-500 mt-1">{errors.fatherName.message}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...register("gender")}
                        aria-invalid={!!errors.gender}
                        aria-describedby={errors.gender ? "gender-error" : undefined}
                        className={`w-full h-11 md:h-10 px-3 rounded-md border text-sm text-[#0F172A] bg-white focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] appearance-none transition-colors ${errors.gender ? 'border-red-400 bg-red-50/50' : 'border-[#E5E7EB]'}`}
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                    {errors.gender && (
                        <p id="gender-error" className="text-xs text-red-500 mt-1">{errors.gender.message}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
