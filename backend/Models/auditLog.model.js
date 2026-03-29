import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        actorName: {
            type: String,
            trim: true,
            default: "",
        },
        actorRole: {
            type: String,
            trim: true,
            default: "",
        },
        actorRoleLabel: {
            type: String,
            trim: true,
            default: "",
        },

        actionLabel: {
            type: String,
            required: true,
            trim: true,
        },
        actionTone: {
            type: String,
            enum: ["green", "slate"],
            default: "green",
        },

        department: {
            type: String,
            required: true,
            trim: true,
        },
        departmentTone: {
            type: String,
            enum: ["orange", "purple", "green", "slate"],
            default: "slate",
        },

        module: {
            type: String,
            trim: true,
            default: "",
        },

        entityType: {
            type: String,
            trim: true,
            default: "",
        },
        entityId: {
            type: String,
            trim: true,
            default: "",
        },
        entityRef: {
            type: String,
            trim: true,
            default: "",
        },

        fromStatus: {
            type: String,
            trim: true,
            default: "",
        },
        toStatus: {
            type: String,
            trim: true,
            default: "",
        },

        notes: {
            type: String,
            trim: true,
            default: "",
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
    },
    { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
