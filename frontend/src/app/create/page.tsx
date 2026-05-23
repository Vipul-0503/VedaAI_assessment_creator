"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, PlusCircle, UploadCloud, CheckCircle } from "lucide-react";

export default function CreateAssessmentPage() {
  const router = useRouter();

  // Form Fields State
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium"); // Default to lowercase
  const [timeLimit, setTimeLimit] = useState(60);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Status State Engines
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("topic", topic);
      formData.append("difficulty", difficulty);
      formData.append("timeLimit", String(timeLimit));

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const response = await fetch("http://localhost:5000/api/assessments", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to initialize assessment generation.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 2000);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-6">
        <button 
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase">AI Assessment Creator</h1>
          <p className="text-xs text-gray-400 font-medium mt-1">Configure parameters or feed textbook source materials to let VedaAI build test frameworks</p>
        </div>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center space-y-3 py-12">
            <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-sm font-bold text-emerald-900">Generation Initialized!</h3>
            <p className="text-xs text-emerald-600">Background workers are compiling questions. Redirecting to home dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-xs font-semibold text-red-600">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">Assessment Title</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Organic Chemistry Midterm" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">Target Focus Topic</label>
                <input type="text" required value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Nucleophilic Substitution" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">Difficulty Level</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all cursor-pointer">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">Time Limit (Minutes)</label>
                <input type="number" min="5" max="300" required value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">Reference Materials (Optional)</label>
              <div className="border-2 border-dashed border-gray-200 hover:border-orange-400 bg-gray-50/50 rounded-2xl p-6 text-center relative transition-colors group">
                <input type="file" accept=".pdf,.txt,.doc,.docx" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <UploadCloud className="h-8 w-8 text-gray-300 group-hover:text-orange-500 mx-auto transition-colors" />
                <p className="text-xs font-bold text-gray-700 mt-2">{selectedFile ? selectedFile.name : "Drag & Drop reference syllabus documents or click here"}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button type="submit" disabled={submitting} className="bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white text-xs font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer">
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /><span>Engaging VedaAI Models...</span></> : <><PlusCircle className="h-4 w-4" /><span>Generate Test Layout</span></>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}