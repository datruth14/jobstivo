import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET /api/user - Get current user profile
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, user });
    } catch (error: any) {
        console.error('GET /api/user error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST /api/user - Update user profile
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const body = await request.json();
        const { name, phone, cvContent, cvs } = body;

        // Sanitize CV IDs (remove temp- IDs so Mongoose can generate valid ObjectIds)
        let sanitizedCVs = cvs;
        if (Array.isArray(cvs)) {
            sanitizedCVs = cvs.map((cv: any) => {
                if (cv._id && String(cv._id).startsWith('temp-')) {
                    const { _id, ...rest } = cv;
                    return rest;
                }
                return cv;
            });
        }

        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            {
                ...(name && { name }),
                ...(phone !== undefined && { phone }),
                ...(cvContent !== undefined && { cvContent }),
                ...(sanitizedCVs !== undefined && { cvs: sanitizedCVs }),
            },
            { new: true }
        );

        return NextResponse.json({ success: true, user });
    } catch (error: any) {
        console.error('POST /api/user error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

