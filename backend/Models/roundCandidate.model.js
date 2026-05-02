import mongoose from "mongoose";

function normalizeNameKey(value = "") {
    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
    .trim()
    .slice(0, 120);
}

function normalizePhone(value = "") {
    const digits = String(value || "").replace(/\D/g, "");
    return digits.length >= 10 ? digits.slice(-10) : digits;
}

const roundCandidateSchema = new mongoose.Schema(
    {
        round: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AdmissionRound",
            required: true,
            index: true,
        },
        studentName: { type: String, trim: true, default: "" },
        fatherName: { type: String, trim: true, default: "" },
        motherName: { type: String, trim: true, default: "" },
        studentPhone: { type: String, trim: true, default: "" },
        fatherPhone: { type: String, trim: true, default: "" },
        motherPhone: { type: String, trim: true, default: "" },
        email: { type: String, trim: true, lowercase: true, default: "" },
        rollNumber: { type: String, trim: true, default: "" },
        meritRank: { type: String, trim: true, default: "" },
        meritMarks: { type: String, trim: true, default: "" },
        eligibleCategory: { type: String, trim: true, default: "" },
        allottedCategory: { type: String, trim: true, default: "" },
        domicileStatus: { type: String, trim: true, default: "" },
        genderRaw: { type: String, trim: true, default: "" },
        ewsStatus: { type: String, trim: true, default: "" },
        allottedRound: { type: String, trim: true, default: "" },
        finalStatus: { type: String, trim: true, default: "" },
        program: { type: String, trim: true, default: "" },
        branch: { type: String, trim: true, default: "" },
        sourceFile: { type: String, trim: true, default: "" },

        studentNameKey: { type: String, trim: true, default: "", index: true },
        fatherNameKey: { type: String, trim: true, default: "", index: true },
        motherNameKey: { type: String, trim: true, default: "", index: true },
        studentPhoneKey: { type: String, trim: true, default: "" },
        fatherPhoneKey: { type: String, trim: true, default: "" },
        motherPhoneKey: { type: String, trim: true, default: "" },

        matchedApplication: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
            default: null,
        },
        matchedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

roundCandidateSchema.index({ round: 1, studentNameKey: 1, fatherNameKey: 1, motherNameKey: 1 });
roundCandidateSchema.index({ round: 1, createdAt: -1 });

roundCandidateSchema.pre("validate", function normalizeDerivedKeys(next) {
    this.studentNameKey = normalizeNameKey(this.studentName);
    this.fatherNameKey = normalizeNameKey(this.fatherName);
    this.motherNameKey = normalizeNameKey(this.motherName);
    this.studentPhoneKey = normalizePhone(this.studentPhone);
    this.fatherPhoneKey = normalizePhone(this.fatherPhone);
    this.motherPhoneKey = normalizePhone(this.motherPhone);
    next();
});

const RoundCandidate = mongoose.model("RoundCandidate", roundCandidateSchema);

export default RoundCandidate;
