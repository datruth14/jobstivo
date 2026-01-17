"use client";

import { useEffect, useState } from "react";
import { Briefcase, Calendar, CheckCircle, Clock, ExternalLink, FileText, Loader2 } from "lucide-react";

interface Application {
    _id: string;
    jobTitle: string;
    company: string;
    appliedAt: string;
    status: string;
    coinsSpent: number;
    applyLink?: string;
    coverLetter: string;
}

export const ApplicationHistory = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await fetch('/api/applications');
                const data = await response.json();
                if (data.success) {
                    setApplications(data.applications);
                }
            } catch (error) {
                console.error("Failed to fetch applications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-20 text-slate-500 italic">
                    <p>No applications yet. Start applying to jobs!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-white">Application History</h2>
                    <p className="text-slate-400 text-sm mt-1">Track your job applications and AI-tailored letters.</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl">
                    <span className="text-blue-400 font-bold">{applications.length} Total Applications</span>
                </div>
            </div>

            <div className="grid gap-4">
                {applications.map((app) => (
                    <div key={app._id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                                    <Briefcase className="w-6 h-6 text-blue-400" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                                        {app.jobTitle}
                                    </h3>
                                    <p className="text-slate-400 font-medium">{app.company}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 md:text-right md:justify-end shrink-0">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(app.appliedAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-green-500 uppercase tracking-widest bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    {app.status}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-800/50 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    Spent {app.coinsSpent} Coins
                                </span>
                            </div>
                            <div className="flex gap-2">
                                {app.applyLink && (
                                    <a
                                        href={app.applyLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                                        title="View Original Job"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </a>
                                )}
                                <button
                                    onClick={() => {
                                        // You could show a modal with the cover letter here
                                        alert(`Cover Letter for ${app.jobTitle}:\n\n${app.coverLetter.substring(0, 300)}...`);
                                    }}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-widest rounded-lg transition-all flex items-center gap-2"
                                >
                                    <FileText className="w-4 h-4" />
                                    Review Letter
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
