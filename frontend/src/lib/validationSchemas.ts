import { z } from "zod";

// ─── Personal Form Validation ───
export const personalSchema = z.object({
    fullName: z
        .string()
        .min(3, "Name must be between 3 and 50 characters")
        .max(50, "Name must be between 3 and 50 characters")
        .regex(/^[A-Za-z ]+$/, "Name must contain only letters"),
    fatherName: z
        .string()
        .min(3, "Name must be between 3 and 50 characters")
        .max(50, "Name must be between 3 and 50 characters")
        .regex(/^[A-Za-z ]+$/, "Name must contain only letters"),
    dob: z
        .string()
        .min(1, "Date of Birth is required")
        .refine((dateStr) => {
            const date = new Date(dateStr);
            const minDate = new Date();
            minDate.setFullYear(minDate.getFullYear() - 15);
            return date <= minDate;
        }, { message: "Student must be at least 15 years old" }),
    gender: z.string().min(1, "Gender is required"),
    email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),
    mobile: z
        .string()
        .min(1, "Mobile number is required")
        .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
    fatherMobile: z
        .string()
        .min(1, "Father's mobile is required")
        .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
    motherMobile: z
        .string()
        .min(1, "Mother's mobile is required")
        .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
    address: z
        .string()
        .min(10, "Address must be at least 10 characters")
        .max(200, "Address must be under 200 characters"),
    hobbies: z.array(z.string()).optional(),
    achievements: z.string().optional(),
});

export type PersonalFormData = z.infer<typeof personalSchema>;

// ─── Academic Form Validation ───
export const academicSchema = z.object({
    programApplied: z.string().min(1, "Program is required"),
    branch: z.string().min(1, "Branch is required"),
    // Marks come from <input type="number"> so react-hook-form gives a number value.
    // z.coerce.number() accepts both strings and numbers.
    marks10th: z.coerce
        .number()
        .min(33, "Minimum qualifying mark is 33%")
        .max(100, "Marks cannot exceed 100%"),
    marks12th: z.coerce
        .number()
        .min(33, "Minimum qualifying mark is 33%")
        .max(100, "Marks cannot exceed 100%"),
    board10th: z.string().min(1, "10th board is required"),
    board12th: z.string().min(1, "12th board is required"),
    // Year comes from a <select> whose option values are numbers (e.g. 2023).
    year10th: z.coerce
        .number()
        .min(2000, "Year must be 2000 or later")
        .max(new Date().getFullYear(), `Year cannot be after ${new Date().getFullYear()}`),
    year12th: z.coerce
        .number()
        .min(2000, "Year must be 2000 or later")
        .max(new Date().getFullYear(), `Year cannot be after ${new Date().getFullYear()}`),
    entranceExam: z.string().optional(),
    entranceScore: z.coerce.number().optional(),
});

export type AcademicFormData = z.infer<typeof academicSchema>;

// ─── Documents Validation ───
// Keys must match the backend Document model's docType enum
export const REQUIRED_DOCS = ["aadhar", "marksheet_10", "marksheet_12", "domicile", "photo", "signature"] as const;

export function validateDocuments(docsUploaded: Record<string, { name: string; size?: number; type?: string }>) {
    const errors: Record<string, string> = {};
    for (const docId of REQUIRED_DOCS) {
        if (!docsUploaded[docId]) {
            errors[docId] = "This document is required";
        }
    }
    return errors;
}

// ─── Payment Validation ───
export const paymentSchema = z.object({
    upiId: z
        .string()
        .min(10, "UPI ID must be at least 10 characters")
        .max(40, "UPI ID must be under 40 characters")
        // Fix #8: accepts sub-handles like user.name@okaxis or john-doe@paytm
        .regex(/^[\w.\-]+@[a-zA-Z0-9]+$/, "Please enter a valid UPI ID (e.g. name@bank)"),
    transactionId: z
        .string()
        .min(1, "Transaction ID is required")
        .min(10, "Minimum length 10")
        .max(40, "Maximum length 40")
        .regex(/^[A-Za-z0-9]+$/, "Only alphanumeric characters allowed"),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

// ─── File validation helpers ───
export const ALLOWED_FILE_TYPES = ["image/png", "image/jpeg"];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFile(file: File): string | null {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return "Only JPG or PNG files are allowed";
    }
    if (file.size > MAX_FILE_SIZE) {
        return `File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
    }
    return null;
}
