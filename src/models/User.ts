import mongoose, { Schema, Model } from 'mongoose';

export interface ICV {
    _id?: mongoose.Types.ObjectId;
    name: string;
    content: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUser {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password?: string;
    phone?: string;
    cvContent: string; // Keep for backward compatibility
    cvs: ICV[];
    walletBalance: number;
    jobsApplied: number;
    totalCoinsSpent: number;
    createdAt: Date;
    updatedAt: Date;
}

const CVSchema = new Schema<ICV>(
    {
        name: { type: String, required: true },
        content: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
        },
        phone: {
            type: String,
            trim: true,
        },
        cvContent: {
            type: String,
            default: '',
        },
        cvs: {
            type: [CVSchema],
            default: [],
        },
        walletBalance: {
            type: Number,
            default: 500,
            min: 0,
        },
        jobsApplied: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalCoinsSpent: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent model recompilation in development
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
