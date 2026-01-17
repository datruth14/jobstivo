"use client";

import { StatsBar } from "@/components/dashboard/StatsBar";
import { FileUpload } from "@/components/dashboard/FileUpload";
import { ManualForm } from "@/components/dashboard/ManualForm";
import { JobFeed } from "@/components/dashboard/JobFeed";
import { useState } from "react";
import { Wand2, Menu, CheckCircle2, X } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";

import { WalletView } from "@/components/dashboard/WalletView";
import { CVView } from "@/components/dashboard/CVView";
import { AvailableJobsView } from "@/components/dashboard/AvailableJobsView";
import { SettingsView } from "@/components/dashboard/SettingsView";
import { useWallet } from "@/context/WalletContext";
import { ApplicationHistory } from "@/components/dashboard/ApplicationHistory";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export const dynamic = 'force-dynamic';

export default function Dashboard() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { userCV, updateCV, createCV } = useWallet();
  const [successLetter, setSuccessLetter] = useState<string | null>(null);
  const [applicationLink, setApplicationLink] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["dashboard", "available_jobs", "wallet", "cv", "jobs", "settings"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const userName = session?.user?.name ? session.user.name.split(' ')[0] : 'User';

  const handleApplySuccess = (letter: string, link?: string) => {
    setSuccessLetter(letter);
    setApplicationLink(link || null);
  };

  const handleUploadSuccess = () => {
    setActiveTab("cv");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="p-4 lg:p-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column: CV Management */}
            <div className="lg:col-span-12 xl:col-span-5 space-y-6 lg:space-y-8">
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-bold">Preparation</h2>
                </div>

                <div className="space-y-6">
                  <FileUpload onUpload={async (content) => {
                    const name = `CV ${new Date().toLocaleDateString()}`;
                    await createCV(name, content);
                    handleUploadSuccess();
                  }} />

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-900" />
                    </div>
                    <div className="relative flex justify-center text-[10px] lg:text-xs uppercase">
                      <span className="bg-slate-950 px-2 text-slate-500 font-bold">Or generate manually</span>
                    </div>
                  </div>

                  <ManualForm onCVGenerated={async (content) => {
                    const name = `AI CV ${new Date().toLocaleDateString()}`;
                    await createCV(name, content);
                    handleUploadSuccess();
                  }} />
                </div>
              </section>
            </div>

            {/* Right Column: Job Feed */}
            <div className="lg:col-span-12 xl:col-span-7">
              <JobFeed
                userCV={userCV}
                onApplySuccess={handleApplySuccess}
                onViewMore={() => setActiveTab("available_jobs")}
              />
            </div>
          </div>
        );
      case "available_jobs":
        return <AvailableJobsView userCV={userCV} onApplySuccess={handleApplySuccess} />;
      case "wallet":
        return <WalletView />;
      case "cv":
        return <CVView onGoToDashboard={() => setActiveTab("dashboard")} />;
      case "jobs":
        return <ApplicationHistory />;
      case "settings":
        return <SettingsView />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex selection:bg-blue-500/30">
      <div className="no-print">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md p-4 lg:p-6 flex justify-between items-center no-print">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors shrink-0"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight truncate">AI Command Center</h1>
              <p className="text-slate-400 text-xs lg:text-sm hidden sm:block truncate">Welcome back, Victor. Your AI career assistant is ready.</p>
            </div>
          </div>
          <StatsBar />
        </header>

        {renderContent()}
      </main>

      {/* Success Modal */}
      {successLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-green-500/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <h2 className="text-xl font-bold">Application Successful!</h2>
              </div>
              <button
                onClick={() => setSuccessLetter(null)}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-slate-400 font-medium uppercase tracking-widest text-[10px]">Tailored Cover Letter</p>
                <p className="text-blue-400/60 font-medium uppercase tracking-widest text-[10px]">Edit enabled</p>
              </div>
              <div className="relative group">
                <textarea
                  value={successLetter || ""}
                  onChange={(e) => setSuccessLetter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 h-[400px] overflow-y-auto focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none resize-none font-serif leading-relaxed text-slate-300 transition-all text-sm"
                  placeholder="Your cover letter will appear here..."
                />
              </div>
              {applicationLink ? (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(successLetter || "");
                    window.open(applicationLink, '_blank');
                    setSuccessLetter(null);
                  }}
                  className="w-full py-4 bg-white text-slate-950 font-bold rounded-2xl hover:bg-slate-100 transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span>Copy Letter & Go to Application</span>
                  <Wand2 className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    console.log("Applying with letter:", successLetter);
                    setSuccessLetter(null);
                  }}
                  className="w-full py-4 bg-white text-slate-950 font-bold rounded-2xl hover:bg-slate-100 transition-all shadow-xl active:scale-[0.98]"
                >
                  Apply with Edited Letter
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
