import "dotenv/config";
import mongoose from "mongoose";

import { main as connectDb } from "../Services/Connections/db.connection.js";
import User from "../Models/user.model.js";
import Application from "../Models/application.model.js";
import Payment from "../Models/payment.model.js";
import RoleAssignment from "../Models/roleAssignment.model.js";
import AuditLog from "../Models/auditLog.model.js";

function shiftMonths(baseDate, monthsBack) {
    const d = new Date(baseDate);
    d.setUTCDate(8 + (monthsBack % 10));
    d.setUTCMonth(d.getUTCMonth() - monthsBack);
    d.setUTCHours(10, 0, 0, 0);
    return d;
}

function randomGoogleSub(prefix, index) {
    return `seed-${prefix}-${index}-${Date.now()}`;
}

async function upsertUser({ email, name, role, picture = "", emailVerified = true, isActive = true }, index) {
    const normalizedEmail = String(email).toLowerCase();

    const user = await User.findOneAndUpdate(
        { email: normalizedEmail },
        {
            $set: {
                name,
                role,
                picture,
                emailVerified,
                isActive,
            },
            $setOnInsert: {
                googleSub: randomGoogleSub(normalizedEmail.split("@")[0], index),
            },
        },
        {
            upsert: true,
            returnDocument: "after",
        }
    );

    return user;
}

async function seedUsers() {
    const staffSeed = [
        { email: "super.admin@mitsgwl.ac.in", name: "Super Admin", role: "administrator" },
        { email: "admission.cell@mitsgwl.ac.in", name: "Admission Officer", role: "admissionCell" },
        { email: "general.office@mitsgwl.ac.in", name: "General Office", role: "generalOffice" },
        { email: "accounts.office@mitsgwl.ac.in", name: "Accounts Officer", role: "accountOffice" },
        { email: "hod.cse@mitsgwl.ac.in", name: "HOD CSE", role: "hod" },
    ];

    const studentSeed = [
        { email: "arjun.mehta@gmail.com", name: "Arjun Mehta" },
        { email: "riya.sharma@gmail.com", name: "Riya Sharma" },
        { email: "vivek.gupta@gmail.com", name: "Vivek Gupta" },
        { email: "nisha.iyer@gmail.com", name: "Nisha Iyer" },
        { email: "karan.singh@gmail.com", name: "Karan Singh" },
        { email: "pooja.verma@gmail.com", name: "Pooja Verma" },
        { email: "rahul.jain@gmail.com", name: "Rahul Jain" },
        { email: "tanvi.patel@gmail.com", name: "Tanvi Patel" },
        { email: "aman.khan@gmail.com", name: "Aman Khan" },
        { email: "sneha.roy@gmail.com", name: "Sneha Roy" },
    ];

    const staffUsers = [];
    for (let i = 0; i < staffSeed.length; i += 1) {
        const user = await upsertUser(staffSeed[i], i + 1);
        staffUsers.push(user);

        if (user.role !== "student") {
            await RoleAssignment.findOneAndUpdate(
                { email: user.email },
                {
                    $set: {
                        role: user.role,
                        branch: user.role === "hod" ? "CSE" : "",
                        assignedBy: staffUsers[0]?._id || user._id,
                    },
                },
                { upsert: true, returnDocument: "after" }
            );
        }
    }

    const studentUsers = [];
    for (let i = 0; i < studentSeed.length; i += 1) {
        const student = await upsertUser(
            {
                email: studentSeed[i].email,
                name: studentSeed[i].name,
                role: "student",
            },
            i + 100
        );
        studentUsers.push(student);
    }

    return {
        adminUser: staffUsers[0],
        staffUsers,
        studentUsers,
    };
}

async function seedApplicationsAndPayments(studentUsers) {
    const statuses = [
        "draft",
        "submitted",
        "under_review",
        "documents_verified",
        "payment_pending",
        "payment_submitted",
        "payment_verified",
        "admitted",
        "rejected",
        "re_upload",
    ];

    const programs = ["BTECH", "BCA", "MBA", "MCA", "BTECH", "BCA", "MBA", "MCA", "BTECH", "BCA"];
    const branches = ["CSE", "IT", "EE", "ECE", "MECH", "CIVIL", "ET", "AI", "IOT", "CSE"];

    const seededApps = [];
    const now = new Date();

    for (let i = 0; i < studentUsers.length; i += 1) {
        const student = studentUsers[i];
        const status = statuses[i % statuses.length];
        const createdAt = shiftMonths(now, i % 6);

        const app = await Application.findOneAndUpdate(
            { student: student._id },
            {
                $set: {
                    fullName: student.name,
                    fatherName: `Father ${i + 1}`,
                    motherName: `Mother ${i + 1}`,
                    email: student.email,
                    phone: `9898989${String(i).padStart(2, "0")}`,
                    fatherPhone: `9797979${String(i).padStart(2, "0")}`,
                    motherPhone: `9696969${String(i).padStart(2, "0")}`,
                    address: `Street ${i + 1}, Gwalior`,
                    city: "Gwalior",
                    state: "Madhya Pradesh",
                    pincode: "474001",
                    gender: i % 2 === 0 ? "male" : "female",
                    dateOfBirth: new Date(`200${i % 4}-0${(i % 8) + 1}-15`),
                    programApplied: programs[i],
                    branch: branches[i],
                    tenthMarks: 70 + i,
                    twelfthMarks: 72 + i,
                    tenthBoard: "CBSE",
                    twelfthBoard: "CBSE",
                    tenthPassingYear: 2020,
                    twelfthPassingYear: 2022,
                    entranceExam: "JEE",
                    entranceScoreOrRank: String(12000 + i * 111),
                    status,
                    progressBar: {
                        formFilled: true,
                        documentsUploaded: status !== "draft",
                        documentsVerified: ["documents_verified", "payment_pending", "payment_submitted", "payment_verified", "admitted"].includes(status),
                        paymentDone: ["payment_submitted", "payment_verified", "admitted"].includes(status),
                        admissionConfirmed: status === "admitted",
                    },
                    submittedAt: status === "draft" ? null : createdAt,
                    verifiedAt: ["documents_verified", "payment_pending", "payment_submitted", "payment_verified", "admitted"].includes(status) ? createdAt : null,
                    admittedAt: status === "admitted" ? createdAt : null,
                    remarksGeneralOffice: status === "rejected" ? "Rejected during review" : "",
                    remarksAdmissionCell: ["documents_verified", "payment_pending", "payment_submitted", "payment_verified", "admitted"].includes(status) ? "Documents checked" : "",
                    remarksAccountOffice: ["payment_pending", "payment_submitted", "payment_verified", "admitted"].includes(status) ? "Payment tracked" : "",
                },
            },
            { upsert: true, returnDocument: "after" }
        );

        // Spread data across months for reports charts.
        await Application.updateOne(
            { _id: app._id },
            { $set: { createdAt, updatedAt: createdAt } },
            { timestamps: false }
        );

        const shouldHavePayment = ["payment_pending", "payment_submitted", "payment_verified", "admitted", "rejected"].includes(status);

        if (shouldHavePayment) {
            const paymentStatus = status === "payment_pending"
                ? "pending"
                : status === "payment_submitted"
                    ? "submitted"
                    : ["payment_verified", "admitted"].includes(status)
                        ? "verified"
                        : "rejected";

            await Payment.findOneAndUpdate(
                { application: app._id },
                {
                    $set: {
                        student: student._id,
                        application: app._id,
                        upiId: `student${i + 1}@upi`,
                        transactionId: `TXNSEED${String(1000 + i)}`,
                        screenshotUrl: "",
                        amount: 10000 + i * 500,
                        minLimit: 10000,
                        maxLimit: 15000,
                        status: paymentStatus,
                        paymentMode: "online",
                        sendLink: "https://payment.test.local",
                        remarks: paymentStatus === "rejected" ? "Seed rejection" : "Seed payment",
                        rejectionReason: paymentStatus === "rejected" ? "Seed verification failed" : "",
                        verifiedAt: paymentStatus === "verified" ? createdAt : null,
                    },
                },
                { upsert: true, returnDocument: "after" }
            );
        }

        seededApps.push(app);
    }

    return seededApps;
}

async function seedAuditLogs({ adminUser, staffUsers, studentUsers, applications }) {
    await AuditLog.deleteMany({ "metadata.seeded": true });

    const actorPool = [adminUser, ...staffUsers.slice(1), ...studentUsers.slice(0, 3)].filter(Boolean);

    const logTemplates = [
        { actionLabel: "USER_ROLE_UPDATED", module: "admin", department: "ADMIN PANEL", departmentTone: "slate" },
        { actionLabel: "APPLICATION_DOCUMENTS_VERIFIED", module: "admission-cell", department: "ADMISSION CELL", departmentTone: "purple" },
        { actionLabel: "PAYMENT_APPROVED", module: "account-office", department: "ACCOUNTANT", departmentTone: "green" },
        { actionLabel: "APPLICATION_REJECTED", module: "general-office", department: "GENERAL OFFICE", departmentTone: "orange" },
        { actionLabel: "APPLICATION_DELETED", module: "admin", department: "ADMIN PANEL", departmentTone: "slate" },
    ];

    for (let i = 0; i < 12; i += 1) {
        const actor = actorPool[i % actorPool.length];
        const app = applications[i % applications.length];
        const template = logTemplates[i % logTemplates.length];
        const createdAt = shiftMonths(new Date(), i % 6);

        await AuditLog.create({
            actor: actor?._id || null,
            actorName: actor?.name || "System",
            actorRole: actor?.role || "administrator",
            actorRoleLabel: actor?.role === "administrator" ? "Super Admin" : (actor?.role || "System"),
            actionLabel: template.actionLabel,
            actionTone: template.actionLabel.includes("REJECTED") || template.actionLabel.includes("DELETED") ? "slate" : "green",
            department: template.department,
            departmentTone: template.departmentTone,
            module: template.module,
            entityType: "application",
            entityId: String(app?._id || ""),
            entityRef: `Application #${String(app?._id || "").slice(-6).toUpperCase()}`,
            fromStatus: "SUBMITTED",
            toStatus: "UPDATED",
            notes: "Seeded audit activity",
            metadata: { seeded: true },
            createdAt,
            updatedAt: createdAt,
        });
    }
}

async function runSeed() {
    await connectDb();

    const { adminUser, staffUsers, studentUsers } = await seedUsers();
    const applications = await seedApplicationsAndPayments(studentUsers);
    await seedAuditLogs({ adminUser, staffUsers, studentUsers, applications });

    console.log("Admin test dataset seeded successfully.");
    console.log(`Admin login user: ${adminUser.email}`);
    console.log(`Staff users created/updated: ${staffUsers.length}`);
    console.log(`Student users created/updated: ${studentUsers.length}`);
    console.log(`Applications created/updated: ${applications.length}`);

    await mongoose.disconnect();
}

runSeed().catch(async (error) => {
    console.error("Failed to seed admin test dataset:", error);
    await mongoose.disconnect();
    process.exit(1);
});
