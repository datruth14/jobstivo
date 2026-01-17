import { improveUploadedCV } from "@/app/actions/openai";
import { useState, useEffect } from "react";
import {
    Download, FileText, Sparkles, ExternalLink, Save, Edit,
    Layout, ScrollText, X, ChevronRight, Check, Trash2, Edit3,
    Plus, Star, MoreVertical, Loader2
} from "lucide-react";
import dynamic from "next/dynamic";
import { useWallet } from "@/context/WalletContext";

// Load RichEditor dynamically to avoid SSR issues with CKEditor
const RichEditor = dynamic(() => import("./RichEditor"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[800px] bg-slate-900/10 animate-pulse rounded-2xl flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Sparkles className="w-8 h-8 text-blue-500 animate-bounce" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading AI Editor...</p>
            </div>
        </div>
    )
});

export function CVView({ onGoToDashboard }: { onGoToDashboard: () => void }) {
    const { userCVs, updateCV, removeCV, setDefaultCV, renameCV, deductCoins } = useWallet();

    // Local state for management
    const [selectedCVId, setSelectedCVId] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isImproving, setIsImproving] = useState(false);
    const [theme, setTheme] = useState<"modern" | "classic" | "creative">("modern");
    const [editedContent, setEditedContent] = useState("");
    const [isRenaming, setIsRenaming] = useState<string | null>(null);
    const [newName, setNewName] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Initialize selection
    useEffect(() => {
        if (userCVs.length > 0 && !selectedCVId) {
            const defaultCV = userCVs.find(cv => cv.isDefault) || userCVs[0];
            setSelectedCVId(defaultCV._id || null);
            setEditedContent(defaultCV.content);
        }
    }, [userCVs, selectedCVId]);

    // Update editor content when selected CV changes
    useEffect(() => {
        const selected = userCVs.find(cv => cv._id === selectedCVId);
        if (selected) {
            setEditedContent(selected.content);
        }
    }, [selectedCVId, userCVs]);

    const activeCV = userCVs.find(cv => cv._id === selectedCVId);

    const handleSave = async () => {
        if (!selectedCVId) return;
        await updateCV(editedContent, selectedCVId);
        setIsEditing(false);
    };

    const handleAIImprove = async () => {
        if (!selectedCVId) return;
        setError(null);

        if (!deductCoins(50)) {
            setError("Insufficient coins. You need 50 coins to improve your CV.");
            return;
        }

        setIsImproving(true);
        try {
            const result = await improveUploadedCV(editedContent);
            if (result.success && result.resume) {
                setEditedContent(result.resume);
                await updateCV(result.resume, selectedCVId);
                setIsEditing(false); // Switch to viewing mode to see the result
            } else {
                setError(result.error || "Failed to improve CV with AI.");
            }
        } catch (err) {
            console.error("AI Improvement Error:", err);
            setError("An unexpected error occurred.");
        } finally {
            setIsImproving(false);
        }
    };

    const handleDownload = () => {
        if (!editedContent) return;
        window.print();
    };

    const handleRenameSubmit = async (cvId: string) => {
        if (!newName.trim()) {
            setIsRenaming(null);
            return;
        }
        await renameCV(cvId, newName);
        setIsRenaming(null);
    };

    // Helper to get theme classes
    const getThemeClasses = (t: string) => {
        switch (t) {
            case 'classic': return 'font-serif text-slate-900 [&>h1]:text-3xl [&>h1]:border-b-2 [&>h1]:border-black [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:uppercase [&>h2]:mt-6 [&>h2]:mb-2 [&>ul]:list-disc [&>ul]:ml-5 [&>p]:mb-4';
            case 'creative': return 'font-sans text-slate-800 [&>h1]:text-4xl [&>h1]:font-black [&>h1]:text-blue-600 [&>h1]:mb-6 [&>h2]:text-2xl [&>h2]:text-blue-500 [&>h2]:mt-8 [&>h2]:mb-3 [&>ul]:list-disc [&>ul]:ml-5 [&>ul]:text-blue-900 [&>p]:mb-4';
            default: return 'font-sans text-slate-700 [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:text-slate-900 [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:text-slate-800 [&>h2]:bg-slate-100 [&>h2]:p-2 [&>h2]:border-l-4 [&>h2]:border-blue-500 [&>h2]:mt-6 [&>h2]:mb-3 [&>ul]:list-disc [&>ul]:ml-5 [&>p]:mb-4';
        }
    };

    if (userCVs.length === 0) {
        return (
            <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8">
                <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-dashed border-slate-800 rounded-[40px] p-20 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-24 h-24 bg-slate-800/50 rounded-[32px] flex items-center justify-center mb-2 shadow-inner">
                        <FileText className="w-12 h-12 text-slate-600" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-white uppercase tracking-wider">No CVs Found</h3>
                        <p className="text-slate-400 max-w-md mx-auto font-medium">
                            Upload your documents on the dashboard to start managing your professional profiles.
                        </p>
                    </div>
                    <button
                        onClick={onGoToDashboard}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/20 active:scale-95 text-xs"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 no-print">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                            <ScrollText className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-white uppercase italic tracking-[0.05em]">CV Manager</h2>
                    </div>
                    <p className="text-slate-400 font-medium">Switch between multiple optimized resumes for different roles.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="bg-slate-900 p-1 rounded-2xl flex border border-slate-800">
                        {(["modern", "classic", "creative"] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTheme(t)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${theme === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white text-slate-950 hover:bg-slate-100 rounded-xl font-bold transition-all shadow-xl active:scale-95 text-sm"
                    >
                        <Download className="w-4 h-4" />
                        Print/PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                {/* Sidebar - CV List */}
                <div className="xl:col-span-3 space-y-4 no-print">
                    <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-6 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Stored Profiles ({userCVs.length})</h4>
                            <button onClick={onGoToDashboard} className="p-1.5 bg-blue-600/10 text-blue-500 rounded-lg hover:bg-blue-600/20 transition-all">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {userCVs.map((cv, index) => (
                                <div
                                    key={cv._id || index}
                                    onClick={() => !isRenaming && setSelectedCVId(cv._id || null)}
                                    className={`
                                        group relative p-4 rounded-2xl border transition-all cursor-pointer
                                        ${selectedCVId === cv._id
                                            ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-600/20'
                                            : 'bg-black/20 border-slate-800 hover:border-slate-700 hover:bg-black/40'}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${selectedCVId === cv._id ? 'bg-white/20' : 'bg-slate-800'}`}>
                                            <FileText className={`w-4 h-4 ${selectedCVId === cv._id ? 'text-white' : 'text-slate-400'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {isRenaming === cv._id ? (
                                                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                                    <input
                                                        autoFocus
                                                        value={newName}
                                                        onChange={(e) => setNewName(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(cv._id!)}
                                                        onBlur={() => handleRenameSubmit(cv._id!)}
                                                        className="bg-slate-900 text-white text-xs p-1 rounded border border-blue-500 outline-none w-full"
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <h5 className={`text-sm font-bold truncate ${selectedCVId === cv._id ? 'text-white' : 'text-slate-200'}`}>
                                                        {cv.isDefault && <Star className="inline w-3 h-3 mr-1 fill-current" />}
                                                        {cv.name}
                                                    </h5>
                                                    <p className={`text-[10px] uppercase font-bold tracking-tight ${selectedCVId === cv._id ? 'text-blue-100' : 'text-slate-500'}`}>
                                                        {new Date(cv.updatedAt || "").toLocaleDateString()}
                                                    </p>
                                                </>
                                            )}
                                        </div>

                                        {!isRenaming && (
                                            <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${selectedCVId === cv._id ? 'text-white' : 'text-slate-400'}`}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setIsRenaming(cv._id!); setNewName(cv.name); }}
                                                    className="p-1 hover:text-white" title="Rename"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                {!cv.isDefault && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setDefaultCV(cv._id!); }}
                                                        className="p-1 hover:text-white" title="Set as Default"
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeCV(cv._id!); }}
                                                    className="p-1 hover:text-red-400" title="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 border border-white/10 rounded-[32px] p-6 text-white space-y-4 shadow-xl">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest">Global Status</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="p-3 bg-white/10 rounded-2xl">
                                <p className="text-[10px] text-blue-100 font-bold uppercase mb-1">Score Avg</p>
                                <p className="text-xl font-black">94%</p>
                            </div>
                            <div className="p-3 bg-white/10 rounded-2xl">
                                <p className="text-[10px] text-blue-100 font-bold uppercase mb-1">Rank</p>
                                <p className="text-xl font-black">Top 1%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="xl:col-span-9 space-y-8">
                    {/* Feedback Messages */}
                    {(error || isImproving) && (
                        <div className={`
                            p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300
                            ${error ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}
                        `}>
                            {isImproving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <X className="w-5 h-5 cursor-pointer hover:bg-red-500/20 rounded-lg p-0.5" onClick={() => setError(null)} />
                            )}
                            <p className="text-sm font-bold tracking-tight uppercase">
                                {isImproving ? "AI is rewriting and formatting your CV... Please wait." : error}
                            </p>
                        </div>
                    )}

                    {/* CV Display */}
                    <div className="w-full space-y-6 print-content">
                        <div className={`bg-white rounded-[40px] shadow-2xl overflow-hidden print:shadow-none print:rounded-none min-h-[1100px] w-full text-black mx-auto relative ${isEditing ? 'ring-8 ring-blue-500/20' : ''}`}>
                            {/* Editor/View Toggle Header */}
                            <div className="bg-slate-50 border-b border-slate-100 p-4 px-10 flex justify-between items-center no-print">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <Layout className="w-3 h-3" />
                                        Layout: {theme}
                                    </div>
                                    <div className="h-4 w-px bg-slate-200" />
                                    <div className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        Mode: {isEditing ? 'Editing' : 'Viewing'}
                                    </div>
                                    <div className="h-4 w-px bg-slate-200" />
                                    <button
                                        onClick={handleAIImprove}
                                        disabled={isImproving}
                                        className={`
                                            flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all
                                            ${isImproving ? 'text-slate-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'}
                                        `}
                                    >
                                        <Sparkles className={`w-3 h-3 ${isImproving ? '' : 'animate-pulse'}`} />
                                        AI Improve & Format (50 Coins)
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="px-4 py-2 bg-slate-200 text-slate-600 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-slate-300 transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                                            >
                                                <Save className="w-3 h-3" />
                                                Apply Changes
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg transition-all flex items-center gap-2"
                                        >
                                            <Edit3 className="w-3 h-3" />
                                            Customize Text
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Actual Content */}
                            <div className="flex-1 overflow-hidden relative">
                                {isEditing ? (
                                    <div className="h-full min-h-[1000px] flex flex-col ck-editor-wrapper">
                                        <RichEditor
                                            data={editedContent}
                                            onChange={(data) => setEditedContent(data)}
                                        />
                                    </div>
                                ) : (
                                    <div className="p-10 sm:p-24 bg-white print:p-8">
                                        {/* Unified styles using ck-content from globals.css */}
                                        <div
                                            className="ck-content leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: editedContent || '<p className="text-slate-400 italic">No content available.</p>' }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Row (Optional - removed stats from here as they are in sidebar now) */}
                    <div className="bg-slate-950/50 backdrop-blur-xl border border-slate-900 rounded-[32px] p-8 text-center space-y-4 no-print">
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">Ready to boost your career?</h3>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={onGoToDashboard}
                                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all"
                            >
                                Start Application Feed
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
