import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    // Fallback to absolute URL construction
    const baseUrl = process.env.NEXTAUTH_URL || new URL(request.url).origin;
    const redirectUrl = new URL('/dashboard', baseUrl);
    redirectUrl.searchParams.set('tab', 'wallet');

    console.log('[Paystack Verify] Reference:', reference);
    console.log('[Paystack Verify] Base URL:', baseUrl);

    if (!reference) {
        redirectUrl.searchParams.set('error', 'No reference found');
        return NextResponse.redirect(redirectUrl.toString());
    }

    try {
        const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!paystackSecretKey) {
            throw new Error("PAYSTACK_SECRET_KEY is not defined");
        }

        console.log('[Paystack Verify] Fetching verification from Paystack...');
        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${paystackSecretKey}`,
            },
        });

        const data = await response.json();
        console.log('[Paystack Verify] Paystack data status:', data.status);

        if (data.status && data.data.status === 'success') {
            const coins = Number(data.data.metadata.coins);
            const email = data.data.customer.email;

            console.log(`[Paystack Verify] Success! Crediting ${coins} coins to ${email}`);

            await connectDB();

            // Create transaction record
            await Transaction.create({
                userEmail: email,
                type: 'Topup',
                amount: coins,
                status: 'Completed',
                reference: reference,
            });

            const user = await User.findOneAndUpdate(
                { email: { $regex: new RegExp("^" + email + "$", "i") } }, // Case-insensitive
                { $inc: { walletBalance: coins } },
                { new: true }
            );

            if (!user) {
                console.error('[Paystack Verify] User not found during credit:', email);
                redirectUrl.searchParams.set('error', 'User not found in database');
                return NextResponse.redirect(redirectUrl.toString());
            }

            console.log('[Paystack Verify] Credit successful. New balance:', user.walletBalance);
            redirectUrl.searchParams.set('success', 'true');
            redirectUrl.searchParams.set('message', `Successfully topped up ${coins} coins`);
            return NextResponse.redirect(redirectUrl.toString());
        } else {
            console.error('[Paystack Verify] Payment failed or unsuccessful status:', data.data.status);
            redirectUrl.searchParams.set('error', data.message || 'Payment failed');
            return NextResponse.redirect(redirectUrl.toString());
        }
    } catch (error: any) {
        console.error('[Paystack Verify] Unexpected error:', error);
        redirectUrl.searchParams.set('error', error.message);
        return NextResponse.redirect(redirectUrl.toString());
    }
}
