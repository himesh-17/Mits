import AuditLog from "../Models/auditLog.model.js";

const ROLE_TO_DEPARTMENT = {
    administrator: { label: "ADMIN PANEL", tone: "slate" },
    generalOffice: { label: "GENERAL OFFICE", tone: "orange" },
    admissionCell: { label: "ADMISSION CELL", tone: "purple" },
    accountOffice: { label: "ACCOUNTANT", tone: "green" },
    hod: { label: "HOD", tone: "slate" },
    student: { label: "STUDENT", tone: "slate" },
};

const ROLE_TO_LABEL = {
    administrator: "Super Admin",
    generalOffice: "General Office",
    admissionCell: "Admission Officer",
    accountOffice: "Accounts Officer",
    hod: "HOD",
    student: "Student",
};

function resolveDepartment(role = "") {
    return ROLE_TO_DEPARTMENT[role] || { label: String(role || "SYSTEM").toUpperCase(), tone: "slate" };
}

function resolveActorRoleLabel(role = "") {
    return ROLE_TO_LABEL[role] || role || "System";
}

function toLogString(value = "") {
    return String(value || "")
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "_");
}

async function writeAuditLog({
    req,
    actionLabel,
    actionTone = "green",
    module = "",
    entityType = "",
    entityId = "",
    entityRef = "",
    fromStatus = "",
    toStatus = "",
    notes = "",
    metadata = null,
}) {
    try {
        const actorRole = req?.user?.role || "";
        const department = resolveDepartment(actorRole);

        await AuditLog.create({
            actor: req?.user?.id || null,
            actorName: req?.user?.name || "",
            actorRole,
            actorRoleLabel: resolveActorRoleLabel(actorRole),
            actionLabel: toLogString(actionLabel),
            actionTone,
            department: department.label,
            departmentTone: department.tone,
            module,
            entityType,
            entityId: entityId ? String(entityId) : "",
            entityRef,
            fromStatus: toLogString(fromStatus),
            toStatus: toLogString(toStatus),
            notes,
            metadata,
        });
    } catch (error) {
        // Audit logging should never block user flows.
        console.error("[AuditLog] failed to write log", error?.message || error);
    }
}

export { writeAuditLog, resolveDepartment, resolveActorRoleLabel, toLogString };
