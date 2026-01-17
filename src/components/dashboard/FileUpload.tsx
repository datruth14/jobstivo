import { Upload, FileText, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { parsePdfAction } from "@/app/actions/cv";

export const FileUpload = ({ onUpload }: { onUpload: (content: string) => void }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = async (file: File) => {
        if (!file) return;

        // Basic validation
        if (!file.type.includes("pdf") && !file.name.endsWith(".pdf")) {
            setError("At the moment, only PDF files are supported for full text extraction.");
            return;
        }

        setFileName(file.name);
        setIsParsing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const result = await parsePdfAction(formData);

            if (result.success && result.text) {
                onUpload(result.text);
            } else {
                setError(result.error || "Failed to extract text from PDF.");
                setFileName(null);
            }
        } catch (err) {
            console.error("Upload error:", err);
            setError("An error occurred while uploading. Please try again.");
            setFileName(null);
        } finally {
            setIsParsing(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="space-y-4">
            <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`
                    relative border-2 border-dashed rounded-[32px] p-10 flex flex-col items-center justify-center transition-all duration-300
                    ${isDragging ? "border-blue-500 bg-blue-500/10 scale-[1.02]" : "border-slate-800 hover:border-slate-700 bg-slate-900/40"}
                    ${isParsing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
            >
                <div className={`
                    p-5 rounded-3xl mb-4 shadow-xl transition-all duration-500
                    ${fileName ? "bg-green-500/10 shadow-green-500/5 rotate-[360deg]" : "bg-slate-800/50 shadow-black/20"}
                `}>
                    {isParsing ? (
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    ) : fileName ? (
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    ) : (
                        <Upload className="w-10 h-10 text-slate-400" />
                    )}
                </div>

                <div className="text-center space-y-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-wider">
                        {isParsing ? "Analyzing Document..." : fileName ? fileName : "Upload CV"}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium">
                        {isParsing ? "Extracting text using AI..." : fileName ? "High-fidelity content extracted!" : "Drop your PDF file here to begin"}
                    </p>
                </div>

                {!isParsing && (
                    <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept=".pdf"
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                handleFileUpload(e.target.files[0]);
                            }
                        }}
                    />
                )}
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="font-bold">{error}</span>
                </div>
            )}
        </div>
    );
};

