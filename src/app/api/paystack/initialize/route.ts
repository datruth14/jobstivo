import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { coins } = await request.json();

        if (!coins || coins < 1000) {
            return NextResponse.json({ success: false, error: "Minimum topup is 1000 coins" }, { status: 400 });
        }

        // Calculation: 1000 coins cost 3000 Naira
        // Amount = (coins / 1000) * 3000
        const amountNaira = (coins / 1000) * 3000;
        const amountKobo = amountNaira * 100;

        const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!paystackSecretKey) {
            throw new Error("PAYSTACK_SECRET_KEY is not defined");
        }

        const baseUrl = process.env.NEXTAUTH_URL || new URL(request.url).origin;
        const callbackUrl = new URL('/api/paystack/verify', baseUrl).toString();

        console.log('[Paystack Initialize] Final Callback URL:', callbackUrl);

        const response = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${paystackSecretKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: session.user.email,
                amount: amountKobo,
                callback_url: callbackUrl,
                metadata: {
                    coins: coins,
                    email: session.user.email,
                },
            }),
        });

        const data = await response.json();

        if (!data.status) {
            return NextResponse.json({ success: false, error: data.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, authorization_url: data.data.authorization_url, reference: data.data.reference });
    } catch (error: any) {
        console.error('Paystack Initialize error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
