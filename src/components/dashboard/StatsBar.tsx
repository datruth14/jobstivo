"use client";

import { useWallet } from "@/context/WalletContext";
import { Coins, Briefcase } from "lucide-react";

export const StatsBar = () => {
    const { coins, jobsApplied } = useWallet();

    return (
        <div className="flex gap-3 sm:gap-6 p-2 sm:p-4 bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-amber-500/10 rounded-lg">
                    <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                </div>
                <div>
                    <p className="text-[10px] sm:text-xs text-slate-400 font-medium hidden sm:block">Coins Remaining</p>
                    <p className="text-sm sm:text-xl font-bold text-white tracking-tight">{coins}</p>
                </div>
            </div>

            <div className="w-px h-8 sm:h-10 bg-slate-800 self-center" />

            <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg">
                    <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                </div>
                <div>
                    <p className="text-[10px] sm:text-xs text-slate-400 font-medium hidden sm:block">Jobs Applied</p>
                    <p className="text-sm sm:text-xl font-bold text-white tracking-tight">{jobsApplied}</p>
                </div>
            </div>
        </div>
    );
};
