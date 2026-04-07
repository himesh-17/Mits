export interface AdmissionProgressInput {
    fullName?: string;
    fatherName?: string;
    motherName?: string;
    dob?: string;
    gender?: string;
    email?: string;
    mobile?: string;
    fatherMobile?: string;
    motherMobile?: string;
    address?: string;

    programApplied?: string;
    branch?: string;
    marks10th?: number | string;
    marks12th?: number | string;
    board10th?: string;
    board12th?: string;
    year10th?: number | string;
    year12th?: number | string;

    docsUploaded?: { [key: string]: { name: string; size?: number; type?: string } };

    upiId?: string;
    transactionId?: string;
}

const REQUIRED_DOC_IDS = [
    "aadhar",
    "marksheet_10",
    "marksheet_12",
    "domicile",
    "photo",
    "signature",
];

function hasValue(value: unknown) {
    if (value === undefined || value === null) return false;
    if (typeof value === "string") return value.trim().length > 0;
    return true;
}

export function getAdmissionProgress(data: AdmissionProgressInput): number {
    const checks = [
        hasValue(data.fullName),
        hasValue(data.fatherName),
        hasValue(data.motherName),
        hasValue(data.dob),
        hasValue(data.gender),
        hasValue(data.email),
        hasValue(data.mobile),
        hasValue(data.fatherMobile),
        hasValue(data.motherMobile),
        hasValue(data.address),

        hasValue(data.programApplied),
        hasValue(data.branch),
        hasValue(data.marks10th),
        hasValue(data.marks12th),
        hasValue(data.board10th),
        hasValue(data.board12th),
        hasValue(data.year10th),
        hasValue(data.year12th),

        ...REQUIRED_DOC_IDS.map((id) => hasValue(data.docsUploaded?.[id]?.name)),

        hasValue(data.upiId),
        hasValue(data.transactionId),
    ];

    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
}
