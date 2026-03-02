import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        googleSub: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        name: {
            type: String,
            default: "",
            trim: true,
        },
        picture: {
            type: String,
            default: "",
            trim: true,
        },
        role: {
            type: String,
            enum: ["student", "admin"],
            default: "student",
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;