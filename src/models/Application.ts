import mongoose, { Schema, Model } from 'mongoose';

export interface IApplication {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    jobId: string;
    jobTitle: string;
    company: string;
    coverLetter: string;
    cvContent?: string;
    applyLink?: string;
    coinsSpent: number;
    status: 'pending' | 'applied' | 'failed';
    appliedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        jobId: {
            type: String,
            required: true,
        },
        jobTitle: {
            type: String,
            required: true,
        },
        company: {
            type: String,
            required: true,
        },
        coverLetter: {
            type: String,
            required: true,
        },
        applyLink: {
            type: String,
        },
        cvContent: {
            type: String,
        },
        coinsSpent: {
            type: Number,
            required: true,
            default: 50,
        },
        status: {
            type: String,
            enum: ['pending', 'applied', 'failed'],
            default: 'applied',
        },
        appliedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: false,
    }
);

// Index for efficient queries
ApplicationSchema.index({ userId: 1, appliedAt: -1 });

const Application: Model<IApplication> = mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application;
