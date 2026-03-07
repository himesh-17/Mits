"use client";

import { UserRound } from "lucide-react";
import { useAdmissionForm } from "../../context/AdmissionContext";

export default function AcademicInformation() {
    const { formData, updateFormData } = useAdmissionForm();

    return (
        <div className="space-y-5">
            {/* Section Title */}
            <div className="flex items-center gap-2">
                <UserRound className="w-5 h-5 text-[#0F172A]" />
                <h2 className="text-base font-bold text-[#0F172A]">
                    Academic Information
                </h2>
            </div>

            {/* Row 1: Program Applied + Branch */}
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Program Applied <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            value={formData.programApplied}
                            onChange={(e) => updateFormData({ programApplied: e.target.value })}
                            className="w-full h-10 px-3 rounded-md border border-[#E5E7EB] text-sm text-[#0F172A] bg-white focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] appearance-none cursor-pointer"
                        >
                            <option value="">Select Program</option>
                            <option value="btech">B.Tech</option>
                            <option value="mtech">M.Tech</option>
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Branch <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            value={formData.branch}
                            onChange={(e) => updateFormData({ branch: e.target.value })}
                            className="w-full h-10 px-3 rounded-md border border-[#E5E7EB] text-sm text-[#0F172A] bg-white focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] appearance-none cursor-pointer"
                        >
                            <option value="">Select Branch</option>
                            <option value="cse">Computer Science</option>
                            <option value="ee">Electrical</option>
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 2: 10th Marks + 12th Marks */}
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        10th Marks (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 86.4"
                        value={formData.marks10th}
                        onChange={(e) => updateFormData({ marks10th: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-[#E5E7EB] text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9]"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        12th Marks (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 92.3"
                        value={formData.marks12th}
                        onChange={(e) => updateFormData({ marks12th: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-[#E5E7EB] text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9]"
                    />
                </div>
            </div>

            {/* Row 3: 10th Board + 10th Passing Year */}
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        10th Board <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            value={formData.board10th}
                            onChange={(e) => updateFormData({ board10th: e.target.value })}
                            className="w-full h-10 px-3 rounded-md border border-[#E5E7EB] text-sm text-[#0F172A] bg-white focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] appearance-none cursor-pointer"
                        >
                            <option value="">Select board</option>
                            <option value="cbse">CBSE</option>
                            <option value="icse">ICSE</option>
                            <option value="state">State Board</option>
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        10th Passing Year <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            value={formData.year10th}
                            onChange={(e) => updateFormData({ year10th: e.target.value })}
                            className="w-full h-10 px-3 rounded-md border border-[#E5E7EB] text-sm text-[#0F172A] bg-white focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] appearance-none cursor-pointer"
                        >
                            <option value="">Select year</option>
                            <option value="2022">2022</option>
                            <option value="2023">2023</option>
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 4: 12th Board + 12th Passing Year */}
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        12th Board <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            value={formData.board12th}
                            onChange={(e) => updateFormData({ board12th: e.target.value })}
                            className="w-full h-10 px-3 rounded-md border border-[#E5E7EB] text-sm text-[#0F172A] bg-white focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] appearance-none cursor-pointer"
                        >
                            <option value="">Select board</option>
                            <option value="cbse">CBSE</option>
                            <option value="icse">ICSE</option>
                            <option value="state">State Board</option>
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        12th Passing Year <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            value={formData.year12th}
                            onChange={(e) => updateFormData({ year12th: e.target.value })}
                            className="w-full h-10 px-3 rounded-md border border-[#E5E7EB] text-sm text-[#0F172A] bg-white focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] appearance-none cursor-pointer"
                        >
                            <option value="">Select year</option>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 5: Entrance Exam + Entrance Score/Rank */}
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Entrance Exam
                    </label>
                    <div className="relative">
                        <select
                            value={formData.entranceExam}
                            onChange={(e) => updateFormData({ entranceExam: e.target.value })}
                            className="w-full h-10 px-3 rounded-md border border-[#E5E7EB] text-sm text-[#0F172A] bg-white focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] appearance-none cursor-pointer"
                        >
                            <option value="">Select Exam (Optional)</option>
                            <option value="jee_main">JEE Main</option>
                            <option value="jee_advanced">JEE Advanced</option>
                            <option value="state_cet">State CET</option>
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Entrance Score/Rank
                    </label>
                    <input
                        type="number"
                        placeholder="e.g. 50000"
                        value={formData.entranceScore}
                        onChange={(e) => updateFormData({ entranceScore: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-[#E5E7EB] text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9]"
                    />
                </div>
            </div>
        </div>
    );
}
