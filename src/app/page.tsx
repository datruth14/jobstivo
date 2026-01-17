"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Shield, Sparkles, Wand2, ArrowRight, Play, CheckCircle2, Star, Briefcase, Globe, Cpu, Clock, TrendingUp, Users, Award, Rocket, Target, Heart, DollarSign, Lock } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 overflow-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-900 px-6 py-4 flex justify-between items-center max-w-[1440px] left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <Wand2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-black uppercase tracking-tighter">Jobstivo</span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-widest text-slate-400">
                    <a href="#story" className="hover:text-white transition-colors">Why Jobstivo</a>
                    <a href="#features" className="hover:text-white transition-colors">Features</a>
                    <a href="#testimonials" className="hover:text-white transition-colors">Success Stories</a>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/auth/login" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors px-4">
                        Login
                    </Link>
                    <Link href="/auth/signup" className="bg-white text-slate-950 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl shadow-white/10 active:scale-95">
                        Start Free Trial
                    </Link>
                </div>
            </nav>

            {/* Hero Section with Story */}
            <section className="relative pt-40 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full -z-10 animate-pulse" />

                <div className="max-w-6xl mx-auto text-center space-y-10">
                    {/* Limited Time Offer Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 text-orange-400 text-[10px] font-black uppercase tracking-[0.2em]"
                    >
                        <Sparkles className="w-3 h-3 animate-pulse" />
                        🔥 Limited Time: 1000 Free Coins on Signup
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase"
                    >
                        Stop Wasting Time.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-white">Start Landing Jobs.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-3xl mx-auto text-slate-400 text-lg md:text-2xl font-medium leading-relaxed"
                    >
                        Join <span className="text-white font-bold">120,000+ professionals</span> who stopped sending generic applications and started getting <span className="text-green-400 font-bold">3x more interviews</span> with AI-powered job hunting.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <Link href="/auth/signup" className="w-full sm:w-auto px-10 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-lg uppercase tracking-widest hover:from-blue-700 hover:to-indigo-700 transition-all shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-3 active:scale-95 group">
                            Get 1000 Free Coins
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            No credit card required
                        </div>
                    </motion.div>

                    {/* Trust Signals */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-wrap items-center justify-center gap-8 pt-8 text-slate-500"
                    >
                        <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            <span className="text-sm font-bold">4.9/5 Rating</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-bold">100% Secure</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-bold">120K+ Users</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* The Problem Section */}
            <section id="story" className="py-20 px-6 bg-slate-900/30 border-y border-slate-800">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center space-y-6 mb-16">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-red-500">The Reality</h2>
                        <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
                            Job Hunting is <span className="text-red-500">Broken</span>
                        </h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: <Clock className="w-8 h-8 text-red-400" />,
                                problem: "Hours Wasted Daily",
                                detail: "Spending 4+ hours customizing each application manually"
                            },
                            {
                                icon: <Target className="w-8 h-8 text-orange-400" />,
                                problem: "Generic Applications",
                                detail: "Your CV gets lost in the ATS black hole with 200+ other applicants"
                            },
                            {
                                icon: <Heart className="w-8 h-8 text-yellow-400" />,
                                problem: "Rejection Fatigue",
                                detail: "Sending 100+ applications with zero responses kills motivation"
                            }
                        ].map((item, i) => (
                            <div key={i} className="p-8 bg-slate-950/50 border border-red-900/20 rounded-3xl">
                                <div className="p-4 bg-red-950/30 rounded-2xl w-fit mb-6 border border-red-900/30">
                                    {item.icon}
                                </div>
                                <h4 className="text-xl font-black uppercase tracking-tight mb-3 text-red-400">{item.problem}</h4>
                                <p className="text-slate-400 font-medium leading-relaxed">{item.detail}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* The Solution Section */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center space-y-6 mb-16">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-green-500">The Solution</h2>
                        <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
                            Meet Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">AI Career Partner</span>
                        </h3>
                        <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                            Jobstivo uses advanced AI to do the heavy lifting while you focus on what matters: preparing for interviews and landing your dream job.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            {
                                icon: <Rocket className="w-8 h-8 text-blue-400" />,
                                title: "10x Faster Applications",
                                before: "4 hours per application",
                                after: "30 seconds with AI",
                                benefit: "Apply to 50+ jobs in the time it took to do 1"
                            },
                            {
                                icon: <Target className="w-8 h-8 text-green-400" />,
                                title: "Perfect ATS Match",
                                before: "Generic CV ignored by ATS",
                                after: "AI-tailored for each job",
                                benefit: "94% higher callback rate"
                            },
                            {
                                icon: <TrendingUp className="w-8 h-8 text-purple-400" />,
                                title: "3x More Interviews",
                                before: "1-2% response rate",
                                after: "6-8% with Jobstivo",
                                benefit: "Land interviews 3x faster"
                            },
                            {
                                icon: <DollarSign className="w-8 h-8 text-yellow-400" />,
                                title: "Pay Only for Results",
                                before: "$99/month subscriptions",
                                after: "50 coins per application",
                                benefit: "Save 80% vs traditional services"
                            }
                        ].map((item, i) => (
                            <div key={i} className="p-8 bg-gradient-to-br from-slate-900/50 to-slate-900/30 border border-slate-800 rounded-3xl hover:border-blue-600/50 transition-all group">
                                <div className="p-4 bg-slate-950 rounded-2xl w-fit mb-6 border border-slate-800 group-hover:scale-110 transition-transform">
                                    {item.icon}
                                </div>
                                <h4 className="text-2xl font-black uppercase tracking-tight mb-4">{item.title}</h4>
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                        <span className="text-slate-500 line-through text-sm">{item.before}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        <span className="text-white font-bold">{item.after}</span>
                                    </div>
                                </div>
                                <div className="px-4 py-3 bg-blue-600/10 border border-blue-600/20 rounded-xl">
                                    <p className="text-blue-400 font-bold text-sm">{item.benefit}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Proof / Testimonials */}
            <section id="testimonials" className="py-20 px-6 bg-slate-900/30 border-y border-slate-800">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center space-y-4 mb-16">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500">Success Stories</h2>
                        <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
                            Real People. <span className="text-slate-500">Real Results.</span>
                        </h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                name: "Sarah Chen",
                                role: "Software Engineer",
                                company: "Google",
                                image: "👩‍💻",
                                quote: "Got 12 interviews in 2 weeks. Landed at Google with a 40% salary increase. Jobstivo changed my life!",
                                stat: "12 interviews in 14 days"
                            },
                            {
                                name: "Marcus Johnson",
                                role: "Product Manager",
                                company: "Meta",
                                image: "👨‍💼",
                                quote: "Applied to 80 jobs in one weekend. Got 6 offers. The AI tailoring is insanely good.",
                                stat: "6 job offers received"
                            },
                            {
                                name: "Priya Patel",
                                role: "Data Scientist",
                                company: "Amazon",
                                image: "👩‍🔬",
                                quote: "Saved 40+ hours of manual work. The ROI is incredible. Best career investment I've made.",
                                stat: "40+ hours saved"
                            }
                        ].map((testimonial, i) => (
                            <div key={i} className="p-8 bg-slate-950/50 border border-slate-800 rounded-3xl hover:border-blue-600/30 transition-all">
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                    ))}
                                </div>
                                <p className="text-slate-300 font-medium leading-relaxed mb-6 italic">"{testimonial.quote}"</p>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="text-4xl">{testimonial.image}</div>
                                    <div>
                                        <div className="font-black text-white">{testimonial.name}</div>
                                        <div className="text-sm text-slate-400">{testimonial.role} at {testimonial.company}</div>
                                    </div>
                                </div>
                                <div className="px-4 py-2 bg-green-600/10 border border-green-600/20 rounded-xl">
                                    <p className="text-green-400 font-bold text-xs uppercase tracking-wider">{testimonial.stat}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-32 px-6">
                <div className="max-w-6xl mx-auto space-y-20">
                    <div className="text-center space-y-4">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500">Core Engine</h2>
                        <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Everything you need to<br /><span className="text-slate-500">dominate the market</span></h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Zap className="w-8 h-8 text-yellow-400" />,
                                title: "Instant CV Tailoring",
                                desc: "AI analyzes job descriptions and rewrites your CV to match 100% of requirements in seconds."
                            },
                            {
                                icon: <Briefcase className="w-8 h-8 text-blue-400" />,
                                title: "Smart Job Matching",
                                desc: "Get real-time job listings from top platforms, filtered to your exact preferences."
                            },
                            {
                                icon: <Shield className="w-8 h-8 text-green-400" />,
                                title: "Transparent Pricing",
                                desc: "Pay-per-use model. Only 50 coins per application. No hidden fees or subscriptions."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="p-10 bg-slate-900/30 border border-slate-800 rounded-[32px] hover:bg-slate-900/50 transition-all group">
                                <div className="p-4 bg-slate-950 rounded-2xl w-fit mb-8 border border-slate-800 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h4 className="text-2xl font-black uppercase tracking-tight mb-4">{feature.title}</h4>
                                <p className="text-slate-400 font-medium leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-32 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-indigo-600/20 to-purple-600/20 blur-3xl -z-10"></div>
                <div className="max-w-4xl mx-auto text-center space-y-8 relative">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 text-orange-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                        <Clock className="w-3 h-3 animate-pulse" />
                        Limited Time Offer Ends Soon
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-tight">
                        Ready to 10x Your<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Job Search?</span>
                    </h2>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Join 120,000+ professionals landing their dream jobs with AI. Get started with <span className="text-white font-bold">1000 free coins</span> today.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                        <Link href="/auth/signup" className="w-full sm:w-auto px-12 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-xl uppercase tracking-widest hover:from-blue-700 hover:to-indigo-700 transition-all shadow-2xl shadow-blue-600/40 flex items-center justify-center gap-3 active:scale-95 group">
                            Start Free Trial
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span>No credit card required</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span>1000 free coins on signup</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span>Cancel anytime</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-slate-900 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Wand2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black uppercase tracking-tighter">Jobstivo</span>
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                        © 2026 Jobstivo AI. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 cursor-pointer transition-colors">
                            <Globe className="w-4 h-4 text-slate-400" />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
