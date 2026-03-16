"use client";

import { UserRound } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { AcademicFormData } from "../../lib/validationSchemas";

export default function AcademicInformation() {
    const { register, formState: { errors } } = useFormContext<AcademicFormData>();

    const inputClass = (hasError: boolean) =>
        `w-full h-11 md:h-10 px-3 rounded-md border text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-colors ${hasError ? 'border-red-400 bg-red-50/50' : 'border-[#E5E7EB]'}`;

    const selectClass = (hasError: boolean) =>
        `w-full h-11 md:h-10 px-3 rounded-md border text-sm text-[#0F172A] bg-white focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] appearance-none cursor-pointer transition-colors ${hasError ? 'border-red-400 bg-red-50/50' : 'border-[#E5E7EB]'}`;

    const ErrorMsg = ({ message }: { message?: string }) =>
        message ? <p className="text-xs text-red-500 mt-1">{message}</p> : null;

    const ChevronIcon = () => (
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </div>
    );

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Program Applied <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            {...register("programApplied")}
                            aria-invalid={!!errors.programApplied}
                            aria-describedby={errors.programApplied ? "programApplied-error" : undefined}
                            className={selectClass(!!errors.programApplied)}
                        >
                            <option value="">Select Program</option>
                            <option value="btech">B.Tech</option>
                            <option value="mtech">M.Tech</option>
                        </select>
                        <ChevronIcon />
                    </div>
                    <ErrorMsg message={errors.programApplied?.message} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Branch <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            {...register("branch")}
                            aria-invalid={!!errors.branch}
                            aria-describedby={errors.branch ? "branch-error" : undefined}
                            className={selectClass(!!errors.branch)}
                        >
                            <option value="">Select Branch</option>
                            <option value="cse">Computer Science</option>
                            <option value="ee">Electrical</option>
                        </select>
                        <ChevronIcon />
                    </div>
                    <ErrorMsg message={errors.branch?.message} />
                </div>
            </div>

            {/* Row 2: 10th Marks + 12th Marks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        10th Marks (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="e.g. 86.4"
                        {...register("marks10th")}
                        aria-invalid={!!errors.marks10th}
                        aria-describedby={errors.marks10th ? "marks10th-error" : undefined}
                        className={inputClass(!!errors.marks10th)}
                    />
                    <ErrorMsg message={errors.marks10th?.message} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        12th Marks (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="e.g. 92.3"
                        {...register("marks12th")}
                        aria-invalid={!!errors.marks12th}
                        aria-describedby={errors.marks12th ? "marks12th-error" : undefined}
                        className={inputClass(!!errors.marks12th)}
                    />
                    <ErrorMsg message={errors.marks12th?.message} />
                </div>
            </div>

            {/* Row 3: 10th Board + 10th Passing Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        10th Board <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            {...register("board10th")}
                            aria-invalid={!!errors.board10th}
                            aria-describedby={errors.board10th ? "board10th-error" : undefined}
                            className={selectClass(!!errors.board10th)}
                        >
                            <option value="">Select board</option>
                            <option value="cbse">CBSE</option>
                            <option value="icse">ICSE</option>
                            <option value="state">State Board</option>
                        </select>
                        <ChevronIcon />
                    </div>
                    <ErrorMsg message={errors.board10th?.message} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        10th Passing Year <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            {...register("year10th")}
                            aria-invalid={!!errors.year10th}
                            aria-describedby={errors.year10th ? "year10th-error" : undefined}
                            className={selectClass(!!errors.year10th)}
                        >
                            <option value="">Select year</option>
                            <option value="2022">2022</option>
                            <option value="2023">2023</option>
                        </select>
                        <ChevronIcon />
                    </div>
                    <ErrorMsg message={errors.year10th?.message} />
                </div>
            </div>

            {/* Row 4: 12th Board + 12th Passing Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        12th Board <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            {...register("board12th")}
                            aria-invalid={!!errors.board12th}
                            aria-describedby={errors.board12th ? "board12th-error" : undefined}
                            className={selectClass(!!errors.board12th)}
                        >
                            <option value="">Select board</option>
                            <option value="cbse">CBSE</option>
                            <option value="icse">ICSE</option>
                            <option value="state">State Board</option>
                        </select>
                        <ChevronIcon />
                    </div>
                    <ErrorMsg message={errors.board12th?.message} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        12th Passing Year <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            {...register("year12th")}
                            aria-invalid={!!errors.year12th}
                            aria-describedby={errors.year12th ? "year12th-error" : undefined}
                            className={selectClass(!!errors.year12th)}
                        >
                            <option value="">Select year</option>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                        </select>
                        <ChevronIcon />
                    </div>
                    <ErrorMsg message={errors.year12th?.message} />
                </div>
            </div>

            {/* Row 5: Entrance Exam + Entrance Score/Rank */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Entrance Exam
                    </label>
                    <div className="relative">
                        <select
                            {...register("entranceExam")}
                            aria-invalid={!!errors.entranceExam}
                            aria-describedby={errors.entranceExam ? "entranceExam-error" : undefined}
                            className={selectClass(!!errors.entranceExam)}
                        >
                            <option value="">Select Exam (Optional)</option>
                            <option value="jee_main">JEE Main</option>
                            <option value="jee_advanced">JEE Advanced</option>
                            <option value="state_cet">State CET</option>
                        </select>
                        <ChevronIcon />
                    </div>
                    <ErrorMsg message={errors.entranceExam?.message} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Entrance Score/Rank
                    </label>
                    <input
                        type="number"
                        placeholder="e.g. 50000"
                        {...register("entranceScore")}
                        aria-invalid={!!errors.entranceScore}
                        aria-describedby={errors.entranceScore ? "entranceScore-error" : undefined}
                        className={inputClass(!!errors.entranceScore)}
                    />
                    <ErrorMsg message={errors.entranceScore?.message} />
                </div>
            </div>
        </div>
    );
}
