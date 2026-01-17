import mongoose, { Schema, Model } from 'mongoose';

export interface ITransaction {
    _id: mongoose.Types.ObjectId;
    userEmail: string;
    type: 'Topup' | 'Tailoring' | 'Generation';
    amount: number; // Positive for topup, negative for spending
    status: 'Pending' | 'Completed' | 'Failed';
    reference?: string;
    createdAt: Date;
    updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        userEmail: {
            type: String,
            required: true,
            index: true,
        },
        type: {
            type: String,
            required: true,
            enum: ['Topup', 'Tailoring', 'Generation'],
        },
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: ['Pending', 'Completed', 'Failed'],
            default: 'Pending',
        },
        reference: {
            type: String,
            unique: true,
            sparse: true,
        },
    },
    {
        timestamps: true,
    }
);

const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
