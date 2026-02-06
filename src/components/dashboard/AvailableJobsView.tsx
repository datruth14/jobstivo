"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, MapPin, DollarSign, Filter, Loader2, Briefcase, ChevronDown, CheckCircle, Send, Wand2, ExternalLink, Sparkles } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Job as ModalJob } from "@/components/dashboard/JobApplicationModal"; // Keep interface
import { getJobs, JSearchJob } from "@/app/actions/jobs";
import Link from "next/link";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Extend ModalJob to include extra fields used here
interface Job extends ModalJob {
    postedAt: string;
    type: string;
    applyLink?: string;
    isRemote?: boolean;
    source?: string;
}

export function AvailableJobsView({ userCV, onApplySuccess }: { userCV: string | null; onApplySuccess: (letter: string, applyLink?: string) => void }) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Input State
    const [searchTerm, setSearchTerm] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("All Types");

    // Applied Filter State
    const [appliedFilters, setAppliedFilters] = useState({
        search: "",
        location: "",
        type: "All Types"
    });

    const [page, setPage] = useState(1);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);

    const observer = useRef<IntersectionObserver | null>(null);
    const lastJobElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    // Apply Filters Handler
    const handleApplyFilters = () => {
        setAppliedFilters({
            search: searchTerm,
            location: locationFilter,
            type: typeFilter
        });
        setJobs([]);
        setPage(1);
        setHasMore(true);
    };



    const fetchJobs = async () => {
        // If search is empty, don't fetch anything initially
        if (!appliedFilters.search) {
            setLoading(false);
            return;
        }

        if (!hasMore && page > 1) return;

        setLoading(true);
        try {
            const result = await getJobs(
                appliedFilters.search,
                page,
                appliedFilters.location
            ) as any; // Cast for custom fields

            if (result.success && result.jobs) {
                const newJobs: Job[] = result.jobs.map((j: JSearchJob & { source?: string }) => ({
                    id: j.job_id,
                    title: j.job_title,
                    company: j.employer_name,
                    location: `${j.job_city || ''}${j.job_city && j.job_country ? ', ' : ''}${j.job_country || ''}` || "Remote",
                    salary: j.job_min_salary && j.job_max_salary
                        ? `$${j.job_min_salary} - $${j.job_max_salary}`
                        : (j.job_salary_currency ? "Salary: Negotiable" : "Not specified"),
                    description: j.job_description,
                    postedAt: j.job_posted_at_datetime_utc ? new Date(j.job_posted_at_datetime_utc).toLocaleDateString() : "Just now",
                    type: j.job_employment_type || "Full-time",
                    applyLink: j.job_apply_link,
                    isRemote: j.job_is_remote,
                    source: j.source || result.source || "API"
                }));

                // Client-side filtering
                const filteredNewJobs = appliedFilters.type !== "All Types"
                    ? newJobs.filter(j => {
                        if (appliedFilters.type === "Remote") return j.isRemote;
                        if (appliedFilters.type === "Hybrid") return j.title.toLowerCase().includes("hybrid") || j.description.toLowerCase().includes("hybrid") || j.location.toLowerCase().includes("hybrid");
                        return j.type?.toLowerCase().includes(appliedFilters.type.toLowerCase())
                    })
                    : newJobs;

                setJobs(prev => {
                    // Deduplicate
                    const uniqueIds = new Set(prev.map(p => p.id));
                    const uniqueNew = filteredNewJobs.filter(j => !uniqueIds.has(j.id));
                    return [...prev, ...uniqueNew];
                });

                if (newJobs.length === 0) {
                    setHasMore(false);
                }
            } else {
                console.error("API Error:", result.error);
                setHasMore(false); // Stop trying if error
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [page, appliedFilters]);

    return (
        <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-white">Available Jobs</h2>
                <p className="text-slate-400">Real-time opportunities from top companies.</p>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/50 p-4 rounded-3xl border border-slate-800 backdrop-blur-md sticky top-24 z-20">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Job title (e.g. React Developer)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none text-white transition-all"
                    />
                </div>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Location (e.g. London)"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none text-white transition-all"
                    />
                </div>
                <div className="relative">
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none text-white appearance-none cursor-pointer transition-all"
                    >
                        <option>All Types</option>
                        <option>Full-time</option>
                        <option>Contract</option>
                        <option>Part-time</option>
                        <option>Internship</option>
                        <option>Remote</option>
                        <option>Hybrid</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
                <button
                    onClick={handleApplyFilters}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95"
                >
                    <Filter className="w-4 h-4" />
                    Search
                </button>
            </div>

            {/* Jobs List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map((job, index) => {
                    const isLastElement = jobs.length === index + 1;
                    return (
                        <div
                            key={job.id}
                            ref={isLastElement ? lastJobElementRef : null}
                            className="bg-slate-900/40 border border-slate-800 p-6 rounded-[32px] hover:border-slate-700 transition-all group hover:bg-slate-900/60"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1 w-full">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">{job.title}</h3>
                                            <p className="text-sm text-slate-400 line-clamp-1">{job.company}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-6 font-medium">
                                <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                    {job.location || "Remote"}
                                </div>
                                <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                                    <DollarSign className="w-3.5 h-3.5 text-green-500" />
                                    {job.salary}
                                </div>
                                {job.source && (
                                    <div className="flex items-center gap-1 bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md border border-blue-500/20">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        {job.source}
                                    </div>
                                )}
                                <div className="ml-auto text-slate-500 flex items-center gap-1">
                                    <Loader2 className="w-3 h-3" />
                                    {job.postedAt}
                                </div>
                            </div>

                            <p className="text-sm text-slate-400 line-clamp-2 mb-6 leading-relaxed h-10">
                                {job.description}
                            </p>

                            <div className="flex gap-3">
                                <Link
                                    href={`/dashboard/jobs/${job.id}`}
                                    className="flex-1 py-3 bg-white text-slate-950 hover:bg-slate-100 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl"
                                >
                                    <Send className="w-4 h-4" />
                                    View & Apply
                                </Link>
                            </div>
                        </div>
                    )
                })}
            </div>

            {loading && (
                <div className="flex justify-center py-10">
                    <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-6 py-3 rounded-full shadow-2xl">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                        <span className="text-sm font-bold text-white uppercase tracking-widest">Finding best matches...</span>
                    </div>
                </div>
            )}

            {!hasMore && !loading && jobs.length > 0 && (
                <div className="text-center py-10 text-slate-500 font-medium">
                    That's all the relevant jobs we found.
                </div>
            )}

            {!loading && jobs.length === 0 && (
                <div className="text-center py-20 bg-slate-900/20 rounded-[32px] border border-slate-800/50 backdrop-blur-sm">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-500">
                        <Briefcase className="w-8 h-8" />
                    </div>
                    {/* Different message if search is empty vs no results found for query */}
                    {!appliedFilters.search ? (
                        <>
                            <h3 className="text-xl font-bold text-white mb-2">Ready to Search</h3>
                            <p className="text-slate-400 max-w-sm mx-auto mb-8">
                                Enter a job title above to find your next opportunity.
                            </p>
                        </>
                    ) : (
                        <>
                            <h3 className="text-xl font-bold text-white mb-2">No Jobs Found</h3>
                            <p className="text-slate-400 max-w-sm mx-auto mb-8">
                                No jobs match your current filters. Try adjusting your search criteria.
                            </p>
                            <button
                                onClick={() => {
                                    setAppliedFilters({ search: "", location: "", type: "All Types" });
                                    setSearchTerm("");
                                    setLocationFilter("");
                                    setPage(1);
                                    setHasMore(true);
                                    setJobs([]);
                                }}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all active:scale-95"
                            >
                                Clear Search
                            </button>
                        </>
                    )}
                </div>
            )}


        </div>
    );
}
