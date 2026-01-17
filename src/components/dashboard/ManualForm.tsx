"use client";

import { useWallet } from "@/context/WalletContext";
import { generateCV } from "@/app/actions/openai";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

export const ManualForm = ({ onCVGenerated }: { onCVGenerated: (cv: string) => void }) => {
    const { deductCoins } = useWallet();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        jobTitle: "",
        experience: "",
        skills: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        if (!deductCoins(50)) {
            alert("Insufficient coins! You need 50 coins to generate a CV.");
            return;
        }

        setLoading(true);
        try {
            const result = await generateCV(formData);
            if (result.success && result.resume) {
                onCVGenerated(result.resume);
            } else {
                alert("Error: " + result.error);
            }
        } catch (err) {
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-slate-900/30 border border-slate-800 rounded-2xl">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Full Name</label>
                    <input
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Target Job Title</label>
                    <input
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Software Engineer"
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Experience Summary</label>
                <textarea
                    required
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="5 years of experience in React..."
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Key Skills</label>
                <input
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="TypeScript, Next.js, OpenAI API"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
            >
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        <Sparkles className="w-5 h-5" />
                        Generate CV (50 Coins)
                    </>
                )}
            </button>
        </form>
    );
};
