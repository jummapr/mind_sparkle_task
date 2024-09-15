require("dotenv").config();

import mongoose, {Document, Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
    first_name: string;
    last_name: string;
    email: string;
    country: string;
    password: string;
    phone_number: number;
    role?: string;
    isVerified?: boolean;
    comparePassword: (password: string) => Promise<boolean>;
    getJwtToken: () => void;
    resetPasswordToken?: string;
    resetPasswordTime?: string;
}

// Regular expression for validating email and password
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

const userSchema: Schema<IUser> = new mongoose.Schema(
    {
        first_name: {
            type: String,
            required: [true, "Please enter your first_name"],
        },
        last_name: {
            type: String,
            required: [true, "Please enter your last_name"],
        },
        email: {
            type: String,
            required: [true, "Please enter your email"],
            validate: {
                validator: (email: string) => emailRegex.test(email),
                message: "Please enter a valid email address",
            },
            unique: true, // Optional: Ensures email is unique
            trim: true,   // Trims leading/trailing whitespaces
            lowercase: true,
        },
        country: {
            type: String,
            required: [true, "Please enter your country"],
        },
        password: {
            type: String,
            required: [true, "Please enter your password"],
            validate: {
                validator: (password: string) => passwordRegex.test(password),
                message: "Password must be at least 8 characters long and contain at least one number and one special character",
            },
        },
        phone_number: {
            type: Number,
            required: [true, "Please enter your phone number"],
        },
        role: {
            type: String,
            default: "user",
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        resetPasswordToken: String,
        resetPasswordTime: Date,
    },
    { timestamps: true }
);

// Hash Password
userSchema.pre<IUser>("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// jwt token
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY!, {
        expiresIn: process.env.JWT_EXPIRES,
    });
};

userSchema.methods.passwordResetToken = function () {
    const token = jwt.sign({ id: this._id }, process.env.PASSWORD_RESET_TOKEN_SECRET!, {
        expiresIn: process.env.PASSWORD_RESET_TOKEN_EXPIRES,
    });
    this.resetPasswordToken = token;
    this.resetPasswordTime =  new Date(Date.now() + 15 * 60 * 1000);
    this.save();
    return token;
};

// compare password
userSchema.methods.comparePassword = async function (
    enteredPassword: string
): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User: mongoose.Model<IUser> = mongoose.model("User", userSchema);

export default User;