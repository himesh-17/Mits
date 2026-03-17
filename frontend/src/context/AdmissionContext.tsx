"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
    marks10th: string;
    marks12th: string;
    board10th: string;
    board12th: string;
    year10th: string;
    year12th: string;
    entranceExam: string;
    entranceScore: string;

    // Step 3: Documents (Storing file names or base64 if needed, keeping simple strings for now to simulate)
    docsUploaded: { [key: string]: { name: string, size?: number, type?: string } };

    // Step 4: Payment
    upiId: string;
    transactionId: string;
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
};

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
    saveAsDraft: () => void;
    clearDraft: () => void;
    googleUser: GoogleUserInfo | null;
    validationErrors: Record<string, string>;
    setValidationErrors: (errors: Record<string, string>) => void;
    clearValidationErrors: () => void;
}

const AdmissionContext = createContext<AdmissionContextType | undefined>(undefined);

export function AdmissionProvider({ children }: { children: React.ReactNode }) {
    const [formData, setFormData] = useState<AdmissionFormData>(defaultFormData);
    const [isLoaded, setIsLoaded] = useState(false);
    const [googleUser, setGoogleUser] = useState<GoogleUserInfo | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Load from local storage on mount + auto-fill from Google user info
    useEffect(() => {
        // Load Google user info
        const savedUser = localStorage.getItem("googleUserInfo");
        let userInfo: GoogleUserInfo | null = null;
        if (savedUser) {
            try {
                userInfo = JSON.parse(savedUser) as GoogleUserInfo;
                setGoogleUser(userInfo);
            } catch {
                // ignore parse errors
            }
        }

        // Load draft
        const savedDraft = localStorage.getItem("admissionFormDraft");
        let formValues = { ...defaultFormData };
        if (savedDraft) {
            try {
                const parsed: unknown = JSON.parse(savedDraft);
                if (isValidDraft(parsed)) {
                    formValues = { ...defaultFormData, ...parsed };
                } else {
                    localStorage.removeItem("admissionFormDraft");
                }
            } catch (e) {
                console.error("Failed to parse draft", e);
                localStorage.removeItem("admissionFormDraft");
            }
        }

        // Auto-fill from Google if fields are empty
        if (userInfo) {
            if (!formValues.fullName && userInfo.name) {
                formValues.fullName = userInfo.name;
            }
            if (!formValues.email && userInfo.email) {
                formValues.email = userInfo.email;
            }
        }

        setFormData(formValues);
        setIsLoaded(true);
    }, []);

    const updateFormData = (newData: Partial<AdmissionFormData>) => {
        setFormData((prev) => {
            const updated = { ...prev, ...newData };
            // Auto-save to localStorage
            localStorage.setItem("admissionFormDraft", JSON.stringify(updated));
            return updated;
        });
    };

    const saveAsDraft = () => {
        localStorage.setItem("admissionFormDraft", JSON.stringify(formData));
    };

    const clearDraft = () => {
        localStorage.removeItem("admissionFormDraft");
        setFormData(defaultFormData);
    };

    const clearValidationErrors = () => setValidationErrors({});

    if (!isLoaded) return null; // Wait for hydration

    return (
        <AdmissionContext.Provider value={{
            formData,
            updateFormData,
            saveAsDraft,
            clearDraft,
            googleUser,
            validationErrors,
            setValidationErrors,
            clearValidationErrors,
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
