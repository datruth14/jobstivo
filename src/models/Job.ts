import mongoose, { Schema, Model } from 'mongoose';

export interface IJob {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    jobId: string; // External job ID from JSearch API
    title: string;
    company: string;
    location: string;
    salary: string;
    description: string;
    applyLink?: string;
    employmentType?: string;
    isRemote?: boolean;
    postedAt?: Date;
    savedAt: Date;
}

const JobSchema = new Schema<IJob>(
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
        title: {
            type: String,
            required: true,
        },
        company: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        salary: {
            type: String,
            default: 'Not specified',
        },
        description: {
            type: String,
            required: true,
        },
        applyLink: {
            type: String,
        },
        employmentType: {
            type: String,
        },
        isRemote: {
            type: Boolean,
            default: false,
        },
        postedAt: {
            type: Date,
        },
        savedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: false,
    }
);

// Compound index to prevent duplicate saved jobs per user
JobSchema.index({ userId: 1, jobId: 1 }, { unique: true });

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);

export default Job;
