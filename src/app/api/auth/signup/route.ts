import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                { success: false, error: 'All fields are required' },
                { status: 400 }
            );
        }

        const emailLower = email.toLowerCase().trim();

        // Find existing user
        let user = await User.findOne({ email: emailLower });

        if (user) {
            // If user exists and has a password, they are truly already registered
            if (user.password) {
                return NextResponse.json(
                    { success: false, error: 'An account with this email already exists' },
                    { status: 400 }
                );
            }

            // If they exist but have no password (OAuth or legacy), update it
            const hashedPassword = await bcrypt.hash(password, 12);
            user.password = hashedPassword;
            if (name) user.name = name; // Update name too if provided
            await user.save();

            console.log('User password updated (healing):', emailLower);
        } else {
            // Create new user
            const hashedPassword = await bcrypt.hash(password, 12);
            user = await User.create({
                name,
                email: emailLower,
                password: hashedPassword,
                walletBalance: 500,
            });
            console.log('New user created:', emailLower);
        }

        return NextResponse.json({
            success: true,
            message: 'User registered successfully'
        });
    } catch (error: any) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

