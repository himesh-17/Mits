import mongoose from "mongoose";

const roleAssignmentSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        role: {
            type: String,
            enum: ["administrator", "admissionCell", "generalOffice", "accountOffice", "hod"],
            required: true,
        },
        branch: {
            type: String,
            default: "",
            trim: true,
        },
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { timestamps: true }
);

const RoleAssignment = mongoose.model("RoleAssignment", roleAssignmentSchema);

export default RoleAssignment;
