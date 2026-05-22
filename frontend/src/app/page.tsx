"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Search, 
  Bell, 
  ChevronDown, 
  SlidersHorizontal, 
  MoreVertical, 
  Plus, 
  FileCheck2, 
  Loader2,
  LayoutGrid // Added for the 6-box grid dashboard icon
} from "lucide-react";

interface Assessment {
  _id: string;
  title: string;
  topic: string;
  difficulty: string;
  timeLimit: number;
  status: string;
  createdAt: string;
}

export default function Dashboard() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch the real live assignments from your backend server
  useEffect(() => {
    async function fetchAssessments() {
      try {
        const response = await fetch("http://localhost:5000/api/assessments");
        if (response.ok) {
          const data = await response.json();
          setAssessments(data);
        }
      } catch (error) {
        console.error("Failed fetching assignments:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAssessments();
  }, []);

  // Filter list based on search bar input parameters
  const filteredAssessments = assessments.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col space-y-6">
      {/* 1. Header Navigation Deck Component Layout */}
      <header className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-6 py-3 shadow-sm">
        <div className="flex items-center gap-3 text-sm text-gray-400 font-medium">
          <span className="cursor-pointer hover:text-gray-900 transition-colors">←</span>
          {/* FIXED: Replaced raw text dots with the crisp Figma 6-box Layout Grid icon */}
          <LayoutGrid className="h-4 w-4 text-gray-400" strokeWidth={2.5} />
          <span className="text-gray-900 font-semibold">Assignment</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Bell className="h-5 w-5 text-gray-600 cursor-pointer hover:text-black" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-orange-500 rounded-full"></span>
          </div>
          
          <div className="flex items-center gap-2 border-l border-gray-200 pl-4 cursor-pointer group">
            <div className="h-8 w-8 rounded-full bg-orange-100 font-bold text-orange-700 text-xs flex items-center justify-center">
              JD
            </div>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-black">John Doe</span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </header>

      {/* 2. FIXED: Keeping only ONE crisp title/subtitle block here */}
      <div className="flex items-center justify-between mt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Assignments</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and create assignments for your classes.</p>
        </div>
      </div>

      {/* 3. Filter & Search Controls Strip */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 border border-gray-200 bg-white text-sm text-gray-500 px-4 py-2.5 rounded-xl font-medium shadow-sm hover:bg-gray-50 transition-colors">
          <SlidersHorizontal className="h-4 w-4 text-gray-400" />
          Filter By
        </button>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Assignment"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white shadow-sm focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>
      </div>

      {/* 4. Main Data Content Render Engine Case Context */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Reading secure cluster files...</p>
        </div>
      ) : filteredAssessments.length === 0 ? (
        /* Empty State Subpanel Graphic Layout */
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-center p-16 max-w-2xl mx-auto mt-6">
          <div className="h-28 w-28 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-sm relative mb-6">
            <FileCheck2 className="h-12 w-12 text-gray-300" />
            <span className="absolute bottom-6 right-6 h-6 w-6 bg-red-500 text-white font-bold rounded-full text-xs grid place-items-center shadow-sm">✕</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No assignments yet</h3>
          <p className="text-sm text-gray-500 max-w-md mb-8 leading-relaxed">
            Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
          </p>
          <Link href="/create">
            <button className="bg-[#1a1a1a] hover:bg-black text-white text-sm font-medium px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all">
              <Plus className="h-4 w-4" />
              Create Your First Assignment
            </button>
          </Link>
        </div>
      ) : (
        /* Populated Grid Card Layout Deck Section */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssessments.map((assessment) => (
            <div 
              key={assessment._id} 
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-44 group relative"
            >
              <div>
                <div className="flex items-start justify-between">
                  <Link href={`/assessment/${assessment._id}`} className="hover:underline cursor-pointer">
                    <h3 className="font-bold text-gray-900 text-base leading-snug pr-6 group-hover:text-orange-600 transition-colors">
                      {assessment.title}
                    </h3>
                  </Link>
                  <button className="text-gray-400 hover:text-gray-900 p-1 absolute top-4 right-4 rounded-lg hover:bg-gray-50 transition-colors">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1 font-medium truncate max-w-[90%]">
                  Topic: {assessment.topic}
                </p>
              </div>

              <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-[11px] font-semibold text-gray-500">
                <div>
                  Assigned on : <span className="text-gray-800">{new Date(assessment.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  Status: 
                  <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                    assessment.status === 'completed' ? 'bg-green-100 text-green-700' :
                    assessment.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {assessment.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}