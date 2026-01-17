import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// PATCH /api/user/wallet - Update wallet balance
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const body = await request.json();
        const { balance, jobsApplied, coinsSpent } = body;

        const updateData: any = {};

        if (balance !== undefined) {
            updateData.walletBalance = balance;
        }

        if (jobsApplied !== undefined) {
            updateData.jobsApplied = jobsApplied;
        }

        if (coinsSpent !== undefined) {
            updateData.$inc = { totalCoinsSpent: coinsSpent };

            // Log spending transaction
            await Transaction.create({
                userEmail: session.user.email,
                type: 'Generation', // Default to generation for now, can be more specific later
                amount: -coinsSpent,
                status: 'Completed',
            });
        }

        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            updateData,
            { new: true }
        );

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, user });
    } catch (error: any) {
        console.error('PATCH /api/user/wallet error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

