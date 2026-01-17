import mongoose, { Schema, Model } from 'mongoose';

export interface IScrapedJob {
    _id: mongoose.Types.ObjectId;
    title: string;
    company: string;
    location: string;
    salary: string;
    description: string;
    applyLink: string;
    source: string;
    postedAt: Date;
    scrapedAt: Date;
}

const ScrapedJobSchema = new Schema<IScrapedJob>(
    {
        title: {
            type: String,
            required: true,
            index: true,
        },
        company: {
            type: String,
            required: true,
            index: true,
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
            required: true,
            unique: true, // Prevent duplicate jobs from the same source link
        },
        source: {
            type: String,
            required: true,
        },
        postedAt: {
            type: Date,
            default: Date.now,
            index: true, // Crucial for sorting by time
        },
        scrapedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for better search
ScrapedJobSchema.index({ title: 'text', description: 'text', company: 'text' });

const ScrapedJob: Model<IScrapedJob> = mongoose.models.ScrapedJob || mongoose.model<IScrapedJob>('ScrapedJob', ScrapedJobSchema);

export default ScrapedJob;
