"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LayoutGrid, Bell, ChevronDown, UploadCloud, Calendar, Plus, X, Mic, Loader2 } from "lucide-react";

interface QuestionRow {
  id: string;
  type: string;
  count: number;
  marks: number;
}

export default function CreateAssignment() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [dueDate, setDueDate] = useState("");
  
  const [rows, setRows] = useState<QuestionRow[]>([
    { id: "1", type: "Multiple Choice Questions", count: 4, marks: 1 },
    { id: "2", type: "Short Questions", count: 3, marks: 2 },
    { id: "3", type: "Diagram/Graph-Based Questions", count: 5, marks: 5 },
    { id: "4", type: "Numerical Problems", count: 5, marks: 5 },
  ]);

  const questionTypes = [
    "Multiple Choice Questions", 
    "Short Questions", 
    "Diagram/Graph-Based Questions", 
    "Numerical Problems", 
    "Long Essay Questions"
  ];

  const updateRow = (id: string, field: "count" | "marks", val: number) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: Math.max(1, r[field] + val) } : r));
  };

  const addRow = () => {
    setRows([...rows, { id: Date.now().toString(), type: "Multiple Choice Questions", count: 1, marks: 1 }]);
  };

  const deleteRow = (id: string) => {
    if (rows.length > 1) setRows(rows.filter(r => r.id !== id));
  };

  const totalQuestions = rows.reduce((sum, r) => sum + r.count, 0);
  const totalMarks = rows.reduce((sum, r) => sum + (r.count * r.marks), 0);

  const handleSubmit = async () => {
    if (!topic) {
      alert("Please provide additional configuration details in the text area!");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/assessments/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic,
          title: topic,
          difficulty: "Medium",
          timeLimit: 45
        })
      });
      if (response.ok) {
        router.push("/");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Header Row */}
      <header className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-6 py-3 shadow-sm">
        <div className="flex items-center gap-3 text-sm text-gray-400 font-medium">
          <Link href="/" className="cursor-pointer hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <LayoutGrid className="h-4 w-4 text-gray-400" strokeWidth={2.5} />
          <span className="text-gray-400 font-semibold cursor-pointer hover:text-gray-900 transition-colors">Assignment</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Bell className="h-5 w-5 text-gray-600 cursor-pointer hover:text-black" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-orange-500 rounded-full"></span>
          </div>
          <div className="flex items-center gap-2 border-l border-gray-200 pl-4 cursor-pointer group">
            <div className="h-8 w-8 rounded-full bg-orange-100 font-bold text-orange-700 text-xs flex items-center justify-center">JD</div>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-black">John Doe</span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </header>

      {/* Page Heading Title Content */}
      <div className="space-y-4 mt-2">
        <div className="flex items-center gap-3.5">
          {/* Glowing Emerald Status Dot Core (increased sizing slightly) & Outer Ring Accent */}
          <div className="flex items-center justify-center h-5 w-5 bg-emerald-100 rounded-full shrink-0">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-none">Create Assignment</h1>
            <p className="text-xs text-gray-400 mt-1.5">Set up a new assignment for your students</p>
          </div>
        </div>
        
        {/* Step Progress Track Bar Line */}
        <div className="relative w-full h-[3px] bg-gray-100 rounded-full overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1/2 bg-gray-500 rounded-full"></div>
        </div>
      </div>

      {/* Main Workspace Sheet Configuration Form Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm space-y-6 mt-2">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Assignment Details</h3>
          <p className="text-xs text-gray-400 mt-0.5">Basic information about your assignment</p>
        </div>

        {/* Drag & Drop Asset Window Box */}
        <div className="border border-dashed border-gray-200 rounded-2xl p-8 bg-gray-50/40 flex flex-col items-center justify-center text-center">
          <UploadCloud className="h-5 w-5 text-gray-400 mb-2" />
          <p className="text-sm font-semibold text-gray-700">Choose a file or drag & drop it here</p>
          <p className="text-xs text-gray-400 mt-0.5">JPEG, PNG, PDF up to 10MB</p>
          <button className="text-xs font-bold text-gray-600 underline mt-4 hover:text-black transition-colors">Browse Files</button>
        </div>

        <p className="text-center text-[11px] font-medium text-gray-400 -mt-2">Upload images of your preferred document/image</p>

        {/* Calendar Due Date Input Box Field Row */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-800 block">Due Date</label>
          <div className="relative max-w-sm">
            <input 
              type="text" 
              placeholder="DD-MM-YYYY" 
              value={dueDate} 
              onChange={(e) => setDueDate(e.target.value)} 
              className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm bg-white font-medium text-gray-700 focus:outline-none placeholder-gray-300 shadow-sm" 
            />
            <Calendar className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Table Questions Iteration Track Workspace Rows */}
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-12 text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2">
            <div className="col-span-6">Question Type</div>
            <div className="col-span-3 text-center">No. of Questions</div>
            <div className="col-span-3 text-center">Marks</div>
          </div>

          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row.id} className="grid grid-cols-12 items-center gap-4">
                {/* Select Type Dropdown Area */}
                <div className="col-span-6 flex items-center gap-3">
                  <div className="relative flex-1">
                    <select 
                      value={row.type} 
                      onChange={(e) => setRows(rows.map(r => r.id === row.id ? { ...r, type: e.target.value } : r))} 
                      className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm bg-white appearance-none focus:outline-none font-medium text-gray-800 shadow-sm"
                    >
                      {questionTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  
                  {/* Inline Delete Cross Action Link Button */}
                  <button 
                    onClick={() => deleteRow(row.id)} 
                    disabled={rows.length === 1} 
                    className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-20 transition-colors"
                  >
                    <X className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                </div>

                {/* Counter Value Box Modifier No of Questions */}
                <div className="col-span-3 flex items-center justify-center">
                  <div className="flex items-center bg-gray-50/50 border border-gray-200 rounded-xl p-1.5 w-full max-w-[130px]">
                    <button onClick={() => updateRow(row.id, "count", -1)} className="h-7 w-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center font-bold text-gray-500 shadow-sm hover:bg-gray-50">-</button>
                    <span className="flex-1 text-center font-bold text-sm text-gray-800">{row.count}</span>
                    <button onClick={() => updateRow(row.id, "count", 1)} className="h-7 w-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center font-bold text-gray-500 shadow-sm hover:bg-gray-50">+</button>
                  </div>
                </div>

                {/* Counter Value Box Modifier Weightage Marks */}
                <div className="col-span-3 flex items-center justify-center">
                  <div className="flex items-center bg-gray-50/50 border border-gray-200 rounded-xl p-1.5 w-full max-w-[130px]">
                    <button onClick={() => updateRow(row.id, "marks", -1)} className="h-7 w-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center font-bold text-gray-500 shadow-sm hover:bg-gray-50">-</button>
                    <span className="flex-1 text-center font-bold text-sm text-gray-800">{row.marks}</span>
                    <button onClick={() => updateRow(row.id, "marks", 1)} className="h-7 w-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center font-bold text-gray-500 shadow-sm hover:bg-gray-50">+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Plus Add Custom Dynamic Row Button Trigger */}
          <button onClick={addRow} className="flex items-center gap-2 text-xs font-bold text-white bg-[#1a1a1a] hover:bg-black rounded-xl px-4 py-2.5 shadow-sm transition-colors mt-2">
            <Plus className="h-3.5 w-3.5" strokeWidth={3} /> Add Question Type
          </button>
        </div>

        {/* Workspace Totals Calculation Counter Box Summary */}
        <div className="flex flex-col items-end gap-1.5 text-xs font-bold text-gray-400 pr-4 pt-2 border-t border-gray-100">
          <div>Total Questions : <span className="text-gray-800 text-sm font-extrabold ml-1">{totalQuestions}</span></div>
          <div>Total Marks : <span className="text-gray-800 text-sm font-extrabold ml-1">{totalMarks}</span></div>
        </div>

        {/* Text Area Description Field Section box Input */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-gray-800 block">Additional Information (For better output)</label>
          <div className="relative">
            <textarea 
              rows={3} 
              placeholder="e.g. Generate a question paper for 3 hour exam duration..." 
              value={topic} 
              onChange={(e) => setTopic(e.target.value)} 
              className="w-full p-4 pr-12 border border-gray-200 rounded-2xl text-sm focus:outline-none resize-none text-gray-800 font-medium bg-gray-50/30 focus:bg-white placeholder-gray-300 transition-all shadow-sm" 
            />
            <button className="absolute right-4 bottom-4 h-8 w-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors">
              <Mic className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating System Bottom Navigation Actions Bar */}
      <div className="flex items-center justify-between px-2 pt-2">
        <Link href="/">
          <button className="border border-gray-200 bg-white px-6 py-2.5 rounded-xl text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
            ← Previous
          </button>
        </Link>
        <button 
          onClick={handleSubmit} 
          disabled={loading} 
          className="bg-[#1a1a1a] hover:bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <>Next →</>}
        </button>
      </div>
    </div>
  );
}