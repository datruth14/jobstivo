import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import User from '@/models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET /api/applications - Get application history
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ success: true, applications: [] });
        }

        const applications = await Application.find({ userId: user._id })
            .sort({ appliedAt: -1 })
            .limit(50); // Limit to last 50 applications

        return NextResponse.json({ success: true, applications });
    } catch (error: any) {
        console.error('GET /api/applications error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST /api/applications - Record a new application
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const body = await request.json();

        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        const application = await Application.create({
            userId: user._id,
            jobId: body.jobId,
            jobTitle: body.jobTitle,
            company: body.company,
            coverLetter: body.coverLetter,
            cvContent: body.cvContent, // Save the tailored CV
            applyLink: body.applyLink,
            coinsSpent: body.coinsSpent,
            status: body.status || 'applied',
        });

        return NextResponse.json({ success: true, application });
    } catch (error: any) {
        console.error('POST /api/applications error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

