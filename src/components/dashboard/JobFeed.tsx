"use client";

import { useState, useEffect } from "react";
import { Building2, MapPin, DollarSign, Send, Briefcase, Loader2 } from "lucide-react";
import { Job } from "@/components/dashboard/JobApplicationModal"; // Keep interface for now or move it
import { getJobs, JSearchJob } from "@/app/actions/jobs";
import Link from "next/link";


export const JobCard = ({ job, onClick }: { job: Job; onClick: () => void }) => {
    return (
        <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                        {job.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {job.company}
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-green-500/20">
                    <DollarSign className="w-3 h-3" />
                    {job.salary}
                </div>
            </div>

            <p className="text-sm text-slate-300 mb-6 line-clamp-2 leading-relaxed">
                {job.description}
            </p>

            <Link
                href={`/dashboard/jobs/${job.id}`}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white text-slate-950 hover:bg-slate-200 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-white/20"
            >
                <Send className="w-4 h-4" />
                <span className="text-xs uppercase tracking-widest font-black">View & Apply</span>
            </Link>
        </div>
    );
};

export const JobFeed = ({ userCV, onApplySuccess, onViewMore }: { userCV: string | null; onApplySuccess: (letter: string, applyLink?: string) => void; onViewMore: () => void }) => {
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedJobs = async () => {
            try {
                // Randomize query to keep "Featured Jobs" fresh
                const queries = ["Remote Developer", "Frontend Engineer", "React Developer", "Full Stack Engineer", "Next.js Developer"];
                const randomQuery = queries[Math.floor(Math.random() * queries.length)];

                const result = await getJobs(randomQuery, 1, "");
                if (result.success && result.jobs) {
                    const mappedJobs: Job[] = result.jobs.slice(0, 3).map((j: JSearchJob) => ({
                        id: j.job_id,
                        title: j.job_title,
                        company: j.employer_name,
                        location: `${j.job_city || ''}${j.job_city && j.job_country ? ', ' : ''}${j.job_country || ''}` || "Remote",
                        salary: j.job_min_salary && j.job_max_salary
                            ? `$${j.job_min_salary} - $${j.job_max_salary}`
                            : (j.job_salary_currency ? "Salary: Market Rate" : "Not specified"),
                        description: j.job_description,
                        applyLink: j.job_apply_link
                    }));
                    setJobs(mappedJobs);
                }
            } catch (error) {
                console.error("Failed to fetch featured jobs", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedJobs();
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-white tracking-tight text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Discover Opportunities
                </h2>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Updated Just Now</span>
                </div>
            </div>

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-blue-500" />
                    <h3 className="text-2xl font-bold text-white">Featured Jobs</h3>
                </div>
                <button
                    onClick={onViewMore}
                    className="flex items-center gap-1 text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors group"
                >
                    View More
                    <Send className="w-4 h-4 -rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                ) : jobs.length > 0 ? (
                    jobs.map((job) => (
                        <JobCard key={job.id} job={job} onClick={() => setSelectedJob(job)} />
                    ))
                ) : (
                    <div className="p-10 border border-dashed border-slate-800 rounded-2xl text-center">
                        <p className="text-sm text-slate-500 mb-4 uppercase tracking-widest font-bold">No Featured Jobs Yet</p>
                        <button
                            onClick={onViewMore}
                            className="text-xs font-black uppercase tracking-tighter text-blue-500 hover:text-blue-400"
                        >
                            Explore Available Jobs
                        </button>
                    </div>
                )}
            </div>


        </div>
    );
};
