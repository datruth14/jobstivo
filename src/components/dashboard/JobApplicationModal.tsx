"use client";

import { useWallet } from "@/context/WalletContext";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Building2, MapPin, DollarSign, Loader2, Send, X, Sparkles, Wand2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { tailorAndApply } from "@/app/actions/openai";


export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    description: string;
    applyLink?: string;
}

interface JobApplicationModalProps {
    job: Job | null;
    isOpen: boolean;
    onClose: () => void;
    userCV: string | null;
    onApplySuccess: (letter: string, applyLink?: string) => void;
}

export function JobApplicationModal({ job, isOpen, onClose, userCV, onApplySuccess }: JobApplicationModalProps) {
    const { data: session } = useSession();
    const [applying, setApplying] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { deductCoins, incrementJobsApplied } = useWallet();

    const handleApply = async () => {
        if (!job) return;
        setError(null);

        if (!userCV) {
            setError("No CV found. Please go to the Dashboard to generate or upload your CV first.");
            return;
        }

        if (!deductCoins(50)) {
            setError("Insufficient coins! You need 50 coins to apply.");
            return;
        }

        setApplying(true);

        try {
            // Save application to MongoDB
            await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId: job.id,
                    jobTitle: job.title,
                    company: job.company,
                    coverLetter: 'Applied via Jobstivo',
                    applyLink: job.applyLink,
                    coinsSpent: 50,
                    status: 'applied',
                }),
            });

            incrementJobsApplied();

            // Open job application page in new tab
            if (job.applyLink) {
                window.open(job.applyLink, '_blank');
            }

            // Show success message
            setTimeout(() => {
                onApplySuccess("Applied via Jobstivo", job.applyLink);
                setApplying(false);
                onClose();
            }, 500);

        } catch (err: any) {
            setError("Failed to save application: " + err.message);
            setApplying(false);
        }
    };

    const handleGenerateAndApply = async () => {
        if (!job) return;
        setError(null);

        if (!userCV) {
            setError("No CV found. Please go to the Dashboard to generate or upload your CV first.");
            return;
        }

        if (!deductCoins(50)) {
            setError("Insufficient coins! You need 50 coins to generate and apply.");
            return;
        }

        setGenerating(true);

        try {
            // 1. Generate Tailored CV and Cover Letter
            const result = await tailorAndApply(userCV, job.description);

            if (!result.success || !result.tailoredCV) {
                throw new Error(result.error || "Failed to generate tailored CV");
            }

            // 2. Save application with generated content
            await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId: job.id,
                    jobTitle: job.title,
                    company: job.company,
                    coverLetter: result.coverLetter || 'Applied via Jobstivo',
                    cvContent: result.tailoredCV,
                    applyLink: job.applyLink,
                    coinsSpent: 50,
                    status: 'applied',
                }),
            });

            incrementJobsApplied();

            // 3. Open job application page
            if (job.applyLink) {
                window.open(job.applyLink, '_blank');
            }

            // 4. Show success
            setTimeout(() => {
                onApplySuccess(result.coverLetter || "Applied with Tailored CV", job.applyLink);
                setGenerating(false);
                onClose();
            }, 500);

        } catch (err: any) {
            setError("Failed to generate and apply: " + err.message);
            setGenerating(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && job && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-slate-900 border border-slate-800 rounded-[32px] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] my-auto"
                    >
                        <div className="p-6 sm:p-8 border-b border-slate-800 bg-slate-800/20 flex justify-between items-start shrink-0">
                            <div className="space-y-1 pr-4">
                                <h2 className="text-xl sm:text-2xl font-bold text-white line-clamp-2">{job.title}</h2>
                                <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm">
                                    <div className="flex items-center gap-1.5">
                                        <Building2 className="w-4 h-4 text-blue-500" />
                                        {job.company}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-blue-500" />
                                        {job.location}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => !applying && onClose()}
                                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-white shrink-0"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar">
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">About the role</h4>
                                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                    {job.description}
                                </p>
                            </div>

                            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Potential Salary</p>
                                    <p className="text-lg sm:text-xl font-bold text-white">{job.salary}</p>
                                </div>
                                <div className="text-left sm:text-right">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Application Cost</p>
                                    <div className="flex items-center gap-1.5 sm:justify-end">
                                        <DollarSign className="w-4 h-4 text-green-500" />
                                        <span className="text-lg sm:text-xl font-bold text-white">50 Coins</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 sm:p-8 bg-slate-800/10 border-t border-slate-800 shrink-0">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 flex items-center gap-3 text-red-400 text-sm">
                                    <div className="bg-red-500/20 p-1.5 rounded-full">
                                        <X className="w-4 h-4" />
                                    </div>
                                    {error}
                                </div>
                            )}
                            <button
                                onClick={handleGenerateAndApply}
                                disabled={applying || generating}
                                className="w-full group relative flex items-center justify-center gap-3 py-5 mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-lg transition-all hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-purple-600/20 active:scale-[0.98] overflow-hidden"
                            >
                                {generating ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span className="uppercase tracking-[0.1em]">Tailoring CV...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                        <span className="uppercase tracking-[0.1em]">Generate Tailored CV & Apply</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleApply}
                                disabled={applying}
                                className="w-full group relative flex items-center justify-center gap-3 py-5 bg-white text-slate-950 rounded-2xl font-black text-lg transition-all hover:bg-slate-100 shadow-xl active:scale-[0.98] overflow-hidden"
                            >
                                {applying ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span className="uppercase tracking-[0.1em]">Opening Application...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        <span className="uppercase tracking-[0.1em]">Apply Now</span>
                                        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors" />
                                    </>
                                )}
                            </button>
                            <p className="text-center text-[10px] text-slate-500 mt-4 uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2">
                                <Sparkles className="w-3 h-3 text-blue-500" />
                                Opens job application page in a new tab
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
