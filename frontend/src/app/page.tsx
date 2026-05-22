"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Bell, ChevronDown, SlidersHorizontal, MoreVertical, Plus, FileCheck2, Loader2, LayoutGrid, Calendar, ArrowUpRight } from "lucide-react";

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

  const filteredAssessments = assessments.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col space-y-6 relative min-h-[85vh]">
      {/* Header Row Bar */}
      <header className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-6 py-3 shadow-sm">
        <div className="flex items-center gap-3 text-sm text-gray-400 font-medium">
          <span className="cursor-pointer hover:text-gray-900 transition-colors">←</span>
          <LayoutGrid className="h-4 w-4 text-gray-400" strokeWidth={2.5} />
          <span className="text-gray-900 font-semibold">Assignment</span>
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

      {/* Main Row Section Titles */}
      <div className="flex items-center justify-between mt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Assignments</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and create assignments for your classes.</p>
        </div>
        
        {/* Dynamic Context Header Action Trigger (visible if assessments exist) */}
        {!loading && assessments.length > 0 && (
          <Link href="/create">
            <button className="bg-[#1a1a1a] hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all">
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} /> New Assignment
            </button>
          </Link>
        )}
      </div>

      {/* Filter and Search Layout Controls */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 border border-gray-200 bg-white text-sm text-gray-500 px-4 py-2.5 rounded-xl font-medium shadow-sm hover:bg-gray-50 transition-colors">
          <SlidersHorizontal className="h-4 w-4 text-gray-400" /> Filter By
        </button>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Assignment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white shadow-sm focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>
      </div>

      {/* Main Grid View Processing States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-3">
          <Loader2 className="h-7 w-7 text-gray-800 animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Reading secure cluster files...</p>
        </div>
      ) : filteredAssessments.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-center p-16 max-w-2xl mx-auto mt-6">
          <div className="h-24 w-24 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-sm relative mb-6">
            <FileCheck2 className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No assignments found</h3>
          <p className="text-xs text-gray-400 max-w-xs">Get started by generating your first AI-powered structural assessment paper.</p>
          <Link href="/create">
            <button className="bg-[#1a1a1a] hover:bg-black text-white text-sm font-bold px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all mt-5">
              <Plus className="h-4 w-4" strokeWidth={2.5} /> Create Your First Assignment
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssessments.map((assessment) => (
            <div 
              key={assessment._id} 
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-44 group relative hover:border-gray-300 hover:shadow-md transition-all duration-200"
            >
              {/* Entire clickable backdrop layer mapping directly into the detail route */}
              <Link href={`/assessment/${assessment._id}`} className="absolute inset-0 z-0 rounded-2xl" />
              
              <div className="relative z-10 pointer-events-none">
                <div className="flex items-start justify-between">
                  <div className="pr-6">
                    <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-orange-600 transition-colors duration-200">
                      {assessment.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1.5 font-medium line-clamp-1">
                      {assessment.topic}
                    </p>
                  </div>
                  
                  {/* Isolate buttons to hover on top layout grid surfaces */}
                  <button className="text-gray-400 hover:text-gray-900 p-1 rounded-lg absolute top-0 right-0 pointer-events-auto transition-colors z-20">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-[11px] font-semibold text-gray-500 relative z-10 pointer-events-none">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Assigned: <span className="text-gray-700 font-bold">{new Date(assessment.createdAt).toLocaleDateString("en-GB")}</span>
                  </span>
                </div>
                
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-extrabold tracking-wider border shadow-sm ${
                  assessment.status === 'completed' 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                    : assessment.status === 'failed' 
                      ? 'bg-red-50 border-red-100 text-red-700' 
                      : 'bg-amber-50 border-amber-100 text-amber-700 animate-pulse'
                }`}>
                  {assessment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}