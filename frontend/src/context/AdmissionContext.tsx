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

interface AdmissionContextType {
    formData: AdmissionFormData;
    updateFormData: (data: Partial<AdmissionFormData>) => void;
    saveAsDraft: () => void;
    clearDraft: () => void;
}

const AdmissionContext = createContext<AdmissionContextType | undefined>(undefined);

export function AdmissionProvider({ children }: { children: React.ReactNode }) {
    const [formData, setFormData] = useState<AdmissionFormData>(defaultFormData);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        const savedDraft = localStorage.getItem("admissionFormDraft");
        if (savedDraft) {
            try {
                setFormData(JSON.parse(savedDraft));
            } catch (e) {
                console.error("Failed to parse draft", e);
            }
        }
        setIsLoaded(true);
    }, []);

    const updateFormData = (newData: Partial<AdmissionFormData>) => {
        setFormData((prev) => {
            const updated = { ...prev, ...newData };
            // Auto-save disabled by default, but we could add auto-save here
            // localStorage.setItem("admissionFormDraft", JSON.stringify(updated));
            return updated;
        });
    };

    const saveAsDraft = () => {
        localStorage.setItem("admissionFormDraft", JSON.stringify(formData));
        alert("Form saved as draft successfully. You can return later to complete it.");
    };

    const clearDraft = () => {
        localStorage.removeItem("admissionFormDraft");
        setFormData(defaultFormData);
    };

    if (!isLoaded) return null; // Wait for hydration

    return (
        <AdmissionContext.Provider value={{ formData, updateFormData, saveAsDraft, clearDraft }}>
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
