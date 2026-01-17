"use client";

import { useEffect, useState } from "react";
import { Wallet, Plus, ArrowUpRight, History, CheckCircle2, AlertCircle } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { useSearchParams } from "next/navigation";

export function WalletView() {
    const { coins } = useWallet();
    const searchParams = useSearchParams();
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState(1000);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        const msg = searchParams.get('message');

        if (success === 'true') {
            setMessage({ type: 'success', text: msg || "Top up successful!" });
        } else if (error) {
            setMessage({ type: 'error', text: error });
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await fetch('/api/user/transactions');
                const data = await response.json();
                if (data.success) {
                    setTransactions(data.transactions);
                }
            } catch (error) {
                console.error("Failed to fetch transactions:", error);
            }
        };

        fetchTransactions();
    }, []);

    const handleTopUp = async () => {
        if (topUpAmount < 1000) return;
        setLoading(true);
        try {
            const response = await fetch('/api/paystack/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coins: topUpAmount }),
            });
            const data = await response.json();
            if (data.success && data.authorization_url) {
                window.location.href = data.authorization_url;
            } else {
                alert(data.error || "Failed to initialize payment");
            }
        } catch (error) {
            console.error("Topup error:", error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Coin Wallet</h2>
                    <p className="text-slate-400">Manage your credits and top up to keep applying.</p>
                </div>
                {message && (
                    <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
                        }`}>
                        {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span className="text-sm font-medium">{message.text}</span>
                        <button onClick={() => setMessage(null)} className="ml-2 hover:opacity-70">✕</button>
                    </div>
                )}
                {!isTopUpOpen && (
                    <button
                        onClick={() => setIsTopUpOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Top Up Balance
                    </button>
                )}
            </div>

            {isTopUpOpen && (
                <div className="bg-slate-900 border border-blue-500/30 rounded-3xl p-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold">Top Up Coins</h3>
                        <button onClick={() => setIsTopUpOpen(false)} className="text-slate-400 hover:text-white">Cancel</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Number of Coins</label>
                                <input
                                    type="number"
                                    min="1000"
                                    step="100"
                                    value={topUpAmount}
                                    onChange={(e) => setTopUpAmount(Math.max(1000, parseInt(e.target.value) || 0))}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Min top-up: 1000 coins</p>
                            </div>
                            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Total Cost</span>
                                    <span className="text-2xl font-black text-white">₦{(topUpAmount / 1000) * 3000}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col justify-end">
                            <button
                                onClick={handleTopUp}
                                disabled={loading}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20 text-lg flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <ArrowUpRight className="w-5 h-5" />
                                        Pay with Paystack
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        <Wallet className="w-32 h-32" />
                    </div>
                    <p className="text-slate-400 font-medium uppercase tracking-widest text-xs">Available Balance</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-white">{coins}</span>
                        <span className="text-blue-400 font-bold uppercase tracking-widest text-sm">Coins</span>
                    </div>
                    <div className="pt-4 flex gap-4">
                        <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                            <ArrowUpRight className="w-4 h-4" />
                            +12% this month
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white space-y-4 shadow-2xl shadow-blue-900/20">
                    <h3 className="text-xl font-bold">Premium Benefits</h3>
                    <ul className="space-y-3 text-blue-100 text-sm">
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            Unlimited AI CV tailoring
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            Priority job indexing
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            Advanced insights & analytics
                        </li>
                    </ul>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <History className="w-5 h-5 text-slate-400" />
                    <h3 className="font-bold">Transaction History</h3>
                </div>
                <div className="divide-y divide-slate-800">
                    {transactions.length > 0 ? (
                        transactions.map((t) => (
                            <div key={t._id} className="p-6 flex justify-between items-center hover:bg-slate-800/50 transition-colors">
                                <div className="space-y-1">
                                    <p className="font-bold">{t.type}</p>
                                    <p className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className={t.amount > 0 ? "text-green-400 font-bold" : "text-slate-300 font-bold"}>
                                        {t.amount > 0 ? "+" : ""}{t.amount} Coins
                                    </p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t.status}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-500">
                            No transactions yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
