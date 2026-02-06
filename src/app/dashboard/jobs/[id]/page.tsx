"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getJobById, JSearchJob } from "@/app/actions/jobs";
import { useWallet } from "@/context/WalletContext";
import { generateAndSaveCV } from "@/app/actions/openai";
import { useSession } from "next-auth/react";
import { Loader2, ArrowLeft, Building2, MapPin, DollarSign, Wand2, Send, CheckCircle2 } from "lucide-react";
import dynamic from 'next/dynamic';

const RichEditor = dynamic(() => import("@/components/dashboard/RichEditor"), {
    ssr: false,
    loading: () => <div className="h-64 flex items-center justify-center bg-slate-900/10 rounded-3xl animate-pulse"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
});

export default function JobApplicationPage() {
    const params = useParams();
    const router = useRouter();
    const { userCV, deductCoins, incrementJobsApplied } = useWallet();
    const { data: session } = useSession();

    const [job, setJob] = useState<JSearchJob | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [applying, setApplying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cvContent, setCvContent] = useState<string>("");
    const [coverLetter, setCoverLetter] = useState<string>("Applied via Jobstivo");
    const [isGenerated, setIsGenerated] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            if (!params.id) return;
            try {
                // In a real app we might fetch from our DB if we cached it, or use the server action
                // For now, let's try to fetch using the ID
                const result = await getJobById(params.id as string);
                if (result.success && result.job) {
                    setJob(result.job);
                } else {
                    setError("Job not found. It might have expired or removed.");
                }
            } catch (err) {
                setError("Failed to load job details.");
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [params.id]);

    useEffect(() => {
        if (userCV && !cvContent && !isGenerated) {
            // If we have a default CV logic or just empty, initially we might show nothing or the default user CV
            // For now, let's leave it empty to encourage generation, or load userCV if we want.
            // But the user explicitly wants "generate custom CV".
        }
    }, [userCV]);


    const handleGenerateCV = async () => {
        if (!job) return;
        if (!deductCoins(200)) {
            setError("Insufficient coins! You need 200 coins to generate a tailored CV.");
            return;
        }

        const userName = session?.user?.name || "Candidate";
        const userEmail = session?.user?.email || "candidate@example.com";

        setGenerating(true);
        setError(null);

        try {
            const result = await generateAndSaveCV(userName, userEmail, job.job_description, job.job_title);

            if (result.success && result.cvContent) {
                setCvContent(result.cvContent);
                setIsGenerated(true);
                // We could also set a default cover letter or generate one
            } else {
                throw new Error(result.error || "Failed to generate CV");
            }
        } catch (err: any) {
            setError("Generation failed: " + err.message);
        } finally {
            setGenerating(false);
        }
    };

    const handleApply = async () => {
        if (!job || !cvContent) return;

        // If they just generated, they already spent 50 coins.
        // Usually applying costs 50 coins.
        // We should decide if "Generate + Apply" is one cost or separate.
        // The implementation plan implies "Generate & Apply" in the modal was 50 total.
        // Here they might have clicked Generate (deducted 50).
        // If we charge again for Apply, it's 100. 
        // Let's assume applying uses the generated asset and doesn't cost EXTRA if they already paid for generation?
        // Or strictly: 
        // Generate = 50 coins (Service)
        // Apply = 50 coins (Service)
        // But previously "Apply" was 50 coins. "Generate Manual" was 50 coins.
        // Let's keep it simple: If they haven't generated, Apply costs 50.
        // If they JUST generated (deducted 50), maybe we shouldn't charge again?
        // BUT, `deductCoins` just subtracts. 
        // Let's charge 50 for generation. And 0 for apply if generated? 
        // OR: Generation is free/included in the "Apply" cost? 
        // The user said "once cv is generated... save...".
        // Let's check the wallet context. 
        // For now, I will NOT charge EXTRA for applying if they generated. 
        // But technically `deductCoins` returns true/false.

        // ACTUALLY: The modal logic was "Generate & Apply" = 50 coins.
        // Here we separated them.
        // To be safe and generous: 
        // If isGenerated is true, it means they paid 50. Apply is free.
        // If isGenerated is false (using default CV), check/deduct 50.

        if (!isGenerated) {
            if (!deductCoins(50)) {
                setError("Insufficient coins to apply.");
                return;
            }
        }

        setApplying(true);
        try {
            await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId: job.job_id,
                    jobTitle: job.job_title,
                    company: job.employer_name,
                    coverLetter: coverLetter,
                    cvContent: cvContent,
                    applyLink: job.job_apply_link,
                    coinsSpent: 50, // Tracking purposes
                    status: 'applied',
                }),
            });

            incrementJobsApplied();

            if (job.job_apply_link) {
                window.open(job.job_apply_link, '_blank');
            }

            router.push('/dashboard?tab=jobs&success=true');

        } catch (err: any) {
            setError("Application failed: " + err.message);
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-slate-950 p-8 text-white flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
                <button onClick={() => router.back()} className="text-blue-500 hover:underline">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 lg:p-12">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header / Back */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </button>

                {/* Job Details Header */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
                    <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight mb-4">{job.job_title}</h1>
                    <div className="flex flex-wrap gap-6 text-slate-400">
                        <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">{job.employer_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">{job.job_city}, {job.job_country}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-500" />
                            <span className="font-medium">
                                {job.job_min_salary ? `$${job.job_min_salary} - $${job.job_max_salary}` : "Salary Not Disclosed"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-12 gap-8">

                    {/* Left: Description */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Job Description</h3>
                            <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                                <p className="whitespace-pre-wrap leading-relaxed">{job.job_description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Application & CV */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* Generation Action */}
                        {!isGenerated && (
                            <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-2xl p-6 text-center space-y-4">
                                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                                    Tailor Your Application
                                </h3>
                                <p className="text-slate-400 text-sm">
                                    Generate a CV specifically optimized for this job description.
                                </p>
                                <button
                                    onClick={handleGenerateCV}
                                    disabled={generating}
                                    className="w-full flex items-center justify-center gap-2 py-4 bg-white text-slate-950 rounded-xl font-black uppercase tracking-widest hover:bg-slate-100 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                >
                                    {generating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="w-5 h-5" />
                                            Generate CV (200 Coins)
                                        </>
                                    )}
                                </button>
                                {error && (
                                    <p className="text-red-400 text-sm font-bold bg-red-950/30 p-2 rounded-lg">{error}</p>
                                )}
                            </div>
                        )}

                        {/* Editor Area */}
                        {(isGenerated || cvContent) && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        Your Tailored CV
                                    </h3>
                                    <span className="text-xs text-slate-600 uppercase font-bold">Editable</span>
                                </div>

                                <div className="border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
                                    <RichEditor
                                        data={cvContent}
                                        onChange={setCvContent}
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={handleApply}
                                        disabled={applying}
                                        className="w-full flex items-center justify-center gap-2 py-5 bg-green-500 text-slate-950 rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-green-400 transition-all shadow-xl shadow-green-500/20 active:scale-95 disabled:opacity-50"
                                    >
                                        {applying ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Submit Application
                                            </>
                                        )}
                                    </button>
                                    <p className="text-center text-xs text-slate-500 mt-2 font-bold uppercase tracking-wider">
                                        Will apply via Jobstivo and open external link
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
