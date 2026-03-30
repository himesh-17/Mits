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

const ALLOWED_METADATA_KEYS = new Set([
    "processed",
    "usersCreated",
    "usersUpdated",
    "applicationsCreated",
    "applicationsUpdated",
    "skipped",
    "applicationStatusFrom",
    "applicationStatusTo",
    "seeded",
    "seedId",
    "previousRole",
    "newRole",
    "reason",
    "incompleteImports",
    "filesCount",
    "rowsCount",
    "securityEvent",
    "elevationReason",
]);

function looksLikeSensitive(value = "") {
    const text = String(value || "").toLowerCase();
    const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
    const hasSsnLike = /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/.test(text);
    const hasAddressLike = /\b(street|st\.|road|rd\.|avenue|ave\.|lane|ln\.|block|sector|district|zip|postal)\b/i.test(text);
    return hasEmail || hasSsnLike || hasAddressLike;
}

function sanitizeMetadata(metadata) {
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
        return null;
    }

    const sanitized = {};

    for (const [key, value] of Object.entries(metadata)) {
        if (!ALLOWED_METADATA_KEYS.has(key)) {
            continue;
        }

        if (value === null || value === undefined) {
            continue;
        }

        if (typeof value === "string") {
            if (!looksLikeSensitive(value)) {
                sanitized[key] = value.slice(0, 300);
            }
            continue;
        }

        if (typeof value === "number" || typeof value === "boolean") {
            sanitized[key] = value;
        }
    }

    return Object.keys(sanitized).length > 0 ? sanitized : null;
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
        if (!actionLabel || String(actionLabel).trim() === "") {
            console.error("[AuditLog] skipped write: actionLabel is required");
            return;
        }

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
            metadata: sanitizeMetadata(metadata),
        });
    } catch (error) {
        // Audit logging should never block user flows.
        console.error("[AuditLog] failed to write log", error?.message || error);
    }
}

export { writeAuditLog, resolveDepartment, resolveActorRoleLabel, toLogString };
