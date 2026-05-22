"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle, Printer, Bell, ChevronDown } from "lucide-react";

interface Question {
  _id: string;
  type: string;
  questionText: string;
  options?: string[];
  correctAnswer?: string;
  marks: number;
}

interface AssessmentData {
  _id: string;
  title: string;
  topic: string;
  difficulty: string;
  timeLimit: number;
  status: string;
  createdAt: string;
  questions: Question[];
}

export default function AssessmentViewer({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const assessmentId = resolvedParams.id;

  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/assessments/${assessmentId}`);
        if (!response.ok) {
          throw new Error("Could not find the requested assessment profile.");
        }
        const data = await response.json();
        setAssessment(data);
      } catch (err: any) {
        setError(err.message || "An unexpected network error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentData();
  }, [assessmentId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-8 w-8 text-gray-800 animate-spin" />
        <p className="text-sm font-medium text-gray-400">Reading secure assignment files...</p>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-red-50/50 border border-red-200 rounded-2xl p-6 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
        <div>
          <h3 className="text-sm font-bold text-gray-900">Unable to load paper</h3>
          <p className="text-xs text-red-600 mt-1">{error || "Something went wrong."}</p>
        </div>
        <Link href="/" className="inline-block bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-xl text-xs font-bold text-gray-700 shadow-sm transition-colors">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const totalMarks = assessment.questions?.reduce((sum, q) => sum + q.marks, 0) || 0;

  return (
    <div className="flex flex-col space-y-6">
      
      {/* 1. SCREEN UTILITY FOR PRISTINE PRINT OVERRIDES */}
      <style jsx global>{`
        @media print {
          header, .no-print, button, .app-top-header, .dark-action-banner {
            display: none !important;
          }
          body, html, main, .flex-1 {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .figma-paper-sheet {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            background: white !important;
          }
          .printable-question-block {
            page-break-inside: avoid !important;
            margin-bottom: 1.5rem !important;
          }
        }
      `}</style>

      {/* 2. MAIN WEB APP TOP HEADER NAVBAR */}
      <header className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-6 py-3 shadow-sm app-top-header no-print">
        <div className="flex items-center gap-3 text-sm text-gray-400 font-medium">
          <Link href="/" className="cursor-pointer hover:text-gray-900 transition-colors">←</Link>
          <span className="text-gray-900 font-semibold flex items-center gap-1.5">
            <span className="text-gray-400 font-normal">Create New</span>
          </span>
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

      {/* 3. FIGMA DARK CONTROLS BANNER LAYOUT */}
      <div className="bg-[#2c2c2c] rounded-2xl p-6 shadow-sm no-print dark-action-banner flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-medium text-gray-200 leading-relaxed">
            Certainly, Lakshya! Here are customized Question Paper for your CBSE Grade 12 Chemistry classes on the NCERT chapters:
          </p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          {/* Link out to the clean dedicated student portal interface */}
          <Link href={`/assessment/${assessment._id}/attempt`}>
            <button className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition-all cursor-pointer">
              Simulate Student Attempt Mode
            </button>
          </Link>

          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white text-gray-900 font-bold px-4 py-2 rounded-xl text-xs shadow-sm hover:bg-gray-100 transition-all cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Download as PDF</span>
          </button>
        </div>
      </div>

      {/* 4. ASSIGNMENT DOCUMENT GREY FRAME BACKDROP */}
      <div className="bg-gray-400/20 border border-gray-200/60 rounded-3xl p-4 sm:p-8 flex justify-center">
        
        {/* THE MOCK PAPERS CARD */}
        <div className="figma-paper-sheet bg-white w-full max-w-3xl rounded-xl shadow-md border border-gray-200/80 p-8 sm:p-12 space-y-6">
          
          {/* INSTITUTION TEXT BLOCKS */}
          <div className="text-center space-y-1.5 border-b border-gray-100 pb-6">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Delhi Public School, Sector-4, Bokaro</h2>
            <p className="text-sm font-bold text-gray-600">Subject: Chemistry</p>
            <p className="text-xs font-bold text-gray-500">Class: 12th</p>
          </div>

          {/* PARAMETER INFORMATION ROWS */}
          <div className="flex justify-between items-center text-xs font-bold text-gray-700 pt-1">
            <div>Time Allowed: {assessment.timeLimit} minutes</div>
            <div>Maximum Marks: {totalMarks}</div>
          </div>

          <p className="text-[11px] font-bold text-gray-400 italic">All questions are compulsory unless stated otherwise.</p>

          {/* STUDENT ASSIGNMENT INPUT FILL FIELDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md text-xs font-bold text-gray-700 pt-2 pb-4">
            <div className="flex items-center gap-2">
              <span className="shrink-0">Name:</span>
              <div className="flex-1 border-b border-gray-400 h-4"></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="shrink-0">Roll Number:</span>
              <div className="flex-1 border-b border-gray-400 h-4"></div>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <span className="shrink-0">Class & Section:</span>
              <div className="flex-1 border-b border-gray-400 h-4"></div>
            </div>
          </div>

          <div className="text-center py-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 border-b-2 border-gray-900 inline-block px-4">Section A</h3>
          </div>

          {/* EXAMINATION TEST LIST */}
          <div className="space-y-6 pt-2">
            {assessment.questions.map((question, index) => (
              <div key={question._id} className="printable-question-block space-y-3">
                
                {/* Question line items prompting text wrapper layout */}
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-medium text-gray-800 leading-relaxed">
                    <span className="mr-1">{index + 1}.</span>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mr-1.5">[{assessment.difficulty}]</span>
                    {question.questionText}
                  </p>
                  <span className="text-xs font-bold text-gray-500 shrink-0">
                    [{question.marks} {question.marks === 1 ? "Mark" : "Marks"}]
                  </span>
                </div>

                {/* Option matrix parsing system */}
                {question.options && question.options.length > 0 && (
                  <div className="grid grid-cols-1 gap-2.5 pl-6">
                    {question.options.map((option, optIdx) => {
                      const prefix = String.fromCharCode(65 + optIdx);
                      return (
                        <div key={optIdx} className="flex items-start gap-2.5 text-xs font-medium text-gray-700">
                          <span className="h-5 w-5 shrink-0 bg-gray-100 rounded flex items-center justify-center font-bold text-[10px] text-gray-500">{prefix}</span>
                          <span className="pt-0.5">{option}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* LIVE WORKSPACE ANSWER KEY - VISIBLE IN APP, AUTO HIDDEN ON PRINTER PAGES */}
          <div className="mt-12 pt-8 border-t border-dashed border-gray-200 no-print space-y-4">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">Answer Key Reference:</h3>
            <div className="space-y-3">
              {assessment.questions.map((question, index) => (
                <div key={question._id} className="text-xs text-gray-600 font-medium">
                  <span className="font-bold text-gray-900">{index + 1}.</span> {question.correctAnswer || "Subjective grading evaluation required."}
                </div>
              ))}
            </div>
          </div>

          {/* FINAL BOTTOM LINE SHEET NOTATION */}
          <div className="text-center pt-8 text-[11px] font-bold text-gray-400 tracking-wide uppercase">
            End of Question Paper
          </div>

        </div>
      </div>
    </div>
  );
}