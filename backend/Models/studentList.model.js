import mongoose from "mongoose";

const studentListSchema = new mongoose.Schema(
    {
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        fileName: { type: String, trim: true, default: "" },
        fileUrl: { type: String, trim: true, default: "" },
        batchYear: { type: Number, default: () => new Date().getFullYear() },
        branch: { type: String, trim: true, default: "" },
        course: { type: String, trim: true, default: "" },

        students: [
            {
                name: { type: String, trim: true },
                email: { type: String, trim: true, lowercase: true },
                rollNumber: { type: String, trim: true },
                status: {
                    type: String,
                    enum: ["not_admitted", "admitted"],
                    default: "not_admitted",
                },
                matchedUser: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    default: null,
                },
            },
        ],

        totalCount: { type: Number, default: 0 },
        admittedCount: { type: Number, default: 0 },
        notAdmittedCount: { type: Number, default: 0 },

        emailSentAt: { type: Date, default: null },
    },
    { timestamps: true }
);

const StudentList = mongoose.model("StudentList", studentListSchema);

export default StudentList;
