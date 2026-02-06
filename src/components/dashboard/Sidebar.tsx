"use client";

import { LayoutDashboard, History, Settings, LogOut, Wallet, FileText, X, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "jobs", label: "Jobs Applied", icon: History },
    { id: "cv", label: "My CV", icon: FileText },
    { id: "wallet", label: "Coin Wallet", icon: Wallet },
    { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({ isOpen, onClose, activeTab, onTabChange }: SidebarProps) {
    const handleTabClick = (id: string) => {
        onTabChange(id);
        if (window.innerWidth < 1024) {
            onClose();
        }
    };

    const sidebarContent = (
        <div className="flex flex-col h-full bg-slate-950 p-6 gap-8">
            {/* Header with Close Button for Mobile */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg italic text-white">
                        J
                    </div>
                    <span className="text-xl font-bold tracking-tighter text-white">Jobstivo</span>
                </div>
                <button
                    onClick={onClose}
                    className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <nav className="flex flex-col gap-2 flex-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleTabClick(item.id)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-left w-full",
                                isActive
                                    ? "bg-blue-600/10 text-blue-400 shadow-[inset_0_0_20px_rgba(37,99,235,0.05)]"
                                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                            )}
                        >
                            <Icon className={cn("w-4 h-4", isActive ? "animate-pulse" : "")} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-400/5 rounded-xl font-medium transition-all mt-auto group"
            >
                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Logout
            </button>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 border-r border-slate-900 flex-col shrink-0 sticky top-0 h-screen">
                {sidebarContent}
            </aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
                        />
                        {/* Sidebar Panel */}
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[280px] border-r border-slate-900 z-50 lg:hidden shadow-2xl"
                        >
                            {sidebarContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
