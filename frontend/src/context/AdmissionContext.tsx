"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { api } from "../utils/api";

// Define the shape of our form data
export interface AdmissionFormData {
    // Step 1: Personal
    fullName: string;
    fatherName: string;
    dob: string;
    gender: string;
    email: string;
    mobile: string;
    fatherMobile: string;
    motherMobile: string;
    address: string;
    hobbies: string[];
    achievements: string;

    // Step 2: Academic
    programApplied: string;
    branch: string;
    marks10th: number | string;
    marks12th: number | string;
    board10th: string;
    board12th: string;
    year10th: number | string;
    year12th: number | string;
    entranceExam: string;
    entranceScore: number | string;

    // Step 3: Documents
    docsUploaded: { [key: string]: { name: string; size?: number; type?: string } };

    // Step 4: Payment
    upiId: string;
    transactionId: string;

    // Progression
    highestStep: number;
}

const defaultFormData: AdmissionFormData = {
    fullName: "",
    fatherName: "",
    dob: "",
    gender: "",
    email: "",
    mobile: "",
    fatherMobile: "",
    motherMobile: "",
    address: "",
    hobbies: [],
    achievements: "",
    programApplied: "",
    branch: "",
    marks10th: "",
    marks12th: "",
    board10th: "",
    board12th: "",
    year10th: "",
    year12th: "",
    entranceExam: "",
    entranceScore: "",
    docsUploaded: {},
    upiId: "",
    transactionId: "",

    highestStep: 1,
};

/** Map frontend field names → backend Application model field names */
function toBackendPayload(data: AdmissionFormData): Record<string, unknown> {
    return {
        fullName:             data.fullName,
        fatherName:           data.fatherName,
        dateOfBirth:          data.dob,
        gender:               data.gender,
        email:                data.email,
        phone:                data.mobile,
        fatherPhone:          data.fatherMobile,
        motherPhone:          data.motherMobile,
        address:              data.address,
        hobbies:              data.hobbies,
        otherAchievements:    data.achievements,
        programApplied:       data.programApplied,
        branch:               data.branch,
        tenthMarks:           data.marks10th,
        twelfthMarks:         data.marks12th,
        tenthBoard:           data.board10th,
        twelfthBoard:         data.board12th,
        tenthPassingYear:     data.year10th,
        twelfthPassingYear:   data.year12th,
        entranceExam:         data.entranceExam,
        entranceScoreOrRank:  data.entranceScore,
    };
}

/** Map backend Application document → frontend form fields */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromBackendApplication(app: Record<string, any>): Partial<AdmissionFormData> {
    return {
        fullName:       app.fullName             ?? "",
        fatherName:     app.fatherName           ?? "",
        dob:            app.dateOfBirth          ?? "",
        gender:         app.gender               ?? "",
        email:          app.email                ?? "",
        mobile:         app.phone                ?? "",
        fatherMobile:   app.fatherPhone          ?? "",
        motherMobile:   app.motherPhone          ?? "",
        address:        app.address              ?? "",
        hobbies:        Array.isArray(app.hobbies) ? app.hobbies : [],
        achievements:   app.otherAchievements    ?? "",
        programApplied: app.programApplied       ?? "",
        branch:         app.branch               ?? "",
        marks10th:      app.tenthMarks           ?? "",
        marks12th:      app.twelfthMarks         ?? "",
        board10th:      app.tenthBoard           ?? "",
        board12th:      app.twelfthBoard         ?? "",
        year10th:       app.tenthPassingYear     ?? "",
        year12th:       app.twelfthPassingYear   ?? "",
        entranceExam:   app.entranceExam         ?? "",
        entranceScore:  app.entranceScoreOrRank  ?? "",
    };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidDraft(value: unknown): value is Partial<AdmissionFormData> {
    if (!isRecord(value)) return false;
    if ("hobbies" in value && !Array.isArray(value.hobbies)) return false;
    if ("docsUploaded" in value && !isRecord(value.docsUploaded)) return false;
    return true;
}

export interface GoogleUserInfo {
    name: string;
    email: string;
    picture?: string;
}

interface AdmissionContextType {
    formData: AdmissionFormData;
    updateFormData: (data: Partial<AdmissionFormData>) => void;
    saveAsDraft: (data?: Partial<AdmissionFormData>) => Promise<void>;
    clearDraft: () => void;
    googleUser: GoogleUserInfo | null;
    setGoogleUser: (user: GoogleUserInfo | null) => void;
    validationErrors: Record<string, string>;
    setValidationErrors: (errors: Record<string, string>) => void;
    clearValidationErrors: () => void;
    submitApplication: () => Promise<void>;
    selectedFiles: Record<string, File>;
    setSelectedFile: (docId: string, file: File) => void;
    removeSelectedFile: (docId: string) => void;
    isSyncing: boolean;
}

const AdmissionContext = createContext<AdmissionContextType | undefined>(undefined);

export function AdmissionProvider({ children }: { children: React.ReactNode }) {
    const [formData, setFormData] = useState<AdmissionFormData>(defaultFormData);
    const [isLoaded, setIsLoaded] = useState(false);
    const [googleUser, setGoogleUser] = useState<GoogleUserInfo | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
    const [isSyncing, setIsSyncing] = useState(false);
    // Fix #6: debounce ref — 1200ms after last keystroke fires the PATCH
    const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load from backend (or localStorage fallback) on mount
    useEffect(() => {
        async function init() {
            // Load Google user info
            const savedUser = localStorage.getItem("googleUserInfo");
            let userInfo: GoogleUserInfo | null = null;
            if (savedUser) {
                try {
                    userInfo = JSON.parse(savedUser) as GoogleUserInfo;
                    setGoogleUser(userInfo);
                } catch { /* ignore */ }
            }

            let formValues = { ...defaultFormData };

            const token = localStorage.getItem("authToken");
            if (token) {
                // Try to load from backend first
                try {
                    const res = await api.get("/api/student/application");
                    const app = res.data?.data?.application;
                    if (app) {
                        const backendValues = fromBackendApplication(app);
                        formValues = { ...formValues, ...backendValues };
                    }
                } catch {
                    // Not authenticated or server down — fall back to localStorage
                    const savedDraft = localStorage.getItem("admissionFormDraft");
                    if (savedDraft) {
                        try {
                            const parsed: unknown = JSON.parse(savedDraft);
                            if (isValidDraft(parsed)) formValues = { ...formValues, ...parsed };
                        } catch { /* ignore */ }
                    }
                }
            } else {
                // No token — use localStorage draft only
                const savedDraft = localStorage.getItem("admissionFormDraft");
                if (savedDraft) {
                    try {
                        const parsed: unknown = JSON.parse(savedDraft);
                        if (isValidDraft(parsed)) formValues = { ...formValues, ...parsed };
                    } catch { /* ignore */ }
                }
            }

            // Auto-fill from Google if fields are empty
            if (userInfo) {
                if (!formValues.fullName && userInfo.name)  formValues.fullName = userInfo.name;
                if (!formValues.email && userInfo.email)    formValues.email = userInfo.email;
            }

            setFormData(formValues);
            setIsLoaded(true);
        }
        init();
    }, []);

    const syncToBackend = useCallback(async (data: AdmissionFormData) => {
        const token = localStorage.getItem("authToken");
        if (!token) return;
        try {
            setIsSyncing(true);
            await api.patch("/api/student/application", toBackendPayload(data));
        } catch (error) {
            // Data is still safe in localStorage, but log the error for debugging
            console.error("Failed to sync form data to backend:", error);
            // Optional: Add toast notification here if using a toast library
            // eg: toast.error("Failed to save draft. Your changes are saved locally.");
        } finally {
            setIsSyncing(false);
        }
    }, []);

    const updateFormData = useCallback((newData: Partial<AdmissionFormData>) => {
        setFormData((prev) => {
            const updated = { ...prev, ...newData };
            // Always persist locally
            localStorage.setItem("admissionFormDraft", JSON.stringify(updated));
            // Fix #6: debounce — only sync to backend 1200ms after the last change
            if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
            syncTimerRef.current = setTimeout(() => syncToBackend(updated), 1200);
            return updated;
        });
    }, [syncToBackend]);

    const saveAsDraft = async (data?: Partial<AdmissionFormData>) => {
        const merged = data ? { ...formData, ...data } : formData;
        localStorage.setItem("admissionFormDraft", JSON.stringify(merged));
        if (data) setFormData(merged);
        await syncToBackend(merged);
    };

    const clearDraft = () => {
        localStorage.removeItem("admissionFormDraft");
        setFormData(defaultFormData);
    };

    const submitApplication = async () => {
        await api.post("/api/student/application/submit");
    };

    const clearValidationErrors = () => setValidationErrors({});

    const setSelectedFile = (docId: string, file: File) => {
        setSelectedFiles((prev) => ({ ...prev, [docId]: file }));
    };

    const removeSelectedFile = (docId: string) => {
        setSelectedFiles((prev) => {
            const next = { ...prev };
            delete next[docId];
            return next;
        });
    };

    // Fix #13: show a centered spinner instead of a blank page during initial load
    if (!isLoaded) return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#F8FAFC] z-50">
            <div className="w-8 h-8 border-4 border-[#0EA5E9] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <AdmissionContext.Provider value={{
            formData,
            updateFormData,
            saveAsDraft,
            clearDraft,
            googleUser,
            setGoogleUser,
            validationErrors,
            setValidationErrors,
            clearValidationErrors,
            submitApplication,
            selectedFiles,
            setSelectedFile,
            removeSelectedFile,
            isSyncing,
        }}>
            {children}
        </AdmissionContext.Provider>
    );
}

export function useAdmissionForm() {
    const context = useContext(AdmissionContext);
    if (context === undefined) {
        throw new Error("useAdmissionForm must be used within an AdmissionProvider");
    }
    return context;
}
