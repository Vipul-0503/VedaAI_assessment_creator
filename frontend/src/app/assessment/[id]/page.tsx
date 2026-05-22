"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, BarChart, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

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
  // Safely unwrap the dynamic route parameters using React.use()
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
        <p className="text-sm font-medium text-gray-400">Loading your generated assessment paper...</p>
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
    <div className="flex flex-col space-y-6 max-w-4xl mx-auto pb-16">
      {/* Dynamic Navigation Row Header */}
      <header className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 font-bold hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-xs font-bold text-emerald-700 capitalize">{assessment.status}</span>
        </div>
      </header>

      {/* Test Meta Configuration Summary Header Grid */}
      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm space-y-6">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md">VedaAI Paper</span>
          <h1 className="text-2xl font-black text-gray-900 mt-3 tracking-tight">{assessment.title}</h1>
          <p className="text-sm text-gray-500 font-medium mt-1.5">{assessment.topic}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-gray-400">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Duration</p>
              <p className="text-sm font-bold text-gray-800">{assessment.timeLimit} Mins</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-gray-400">
              <BarChart className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Difficulty</p>
              <p className="text-sm font-bold text-gray-800 capitalize">{assessment.difficulty}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-gray-400">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Marks</p>
              <p className="text-sm font-bold text-gray-800">{totalMarks} Marks</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-gray-400">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Generated On</p>
              <p className="text-sm font-bold text-gray-800">
                {new Date(assessment.createdAt).toLocaleDateString("en-GB")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rendered Questions Sheet Block Section */}
      <div className="space-y-4">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider pl-2">Questions Paper Sheet</h2>
        
        {assessment.questions && assessment.questions.length > 0 ? (
          <div className="space-y-4">
            {assessment.questions.map((question, index) => (
              <div key={question._id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                {/* Question Identification Index Row */}
                <div className="flex justify-between items-start gap-4">
                  <span className="text-xs font-extrabold text-gray-400 uppercase bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-md">
                    Question {index + 1}
                  </span>
                  <span className="text-xs font-bold text-gray-500 bg-gray-100/60 px-2 py-0.5 rounded-md">
                    {question.marks} {question.marks === 1 ? "Mark" : "Marks"}
                  </span>
                </div>

                {/* Main Prompt Text */}
                <p className="text-base font-semibold text-gray-900 leading-relaxed">
                  {question.questionText}
                </p>

                {/* Render Options if Multiple Choice Question */}
                {question.options && question.options.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {question.options.map((option, optIdx) => {
                      const prefix = String.fromCharCode(65 + optIdx); // Converts indices to A, B, C, D
                      const isCorrect = question.correctAnswer === option || question.correctAnswer === prefix;
                      
                      return (
                        <div 
                          key={optIdx} 
                          className={`flex items-center gap-3 p-3 border rounded-xl text-sm font-medium transition-all ${
                            isCorrect 
                              ? "border-emerald-200 bg-emerald-50/40 text-emerald-900" 
                              : "border-gray-100 bg-gray-50/20 text-gray-700"
                          }`}
                        >
                          <span className={`h-6 w-6 shrink-0 flex items-center justify-center rounded-md font-bold text-xs ${
                            isCorrect ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"
                          }`}>
                            {prefix}
                          </span>
                          <span>{option}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Show Explicit Answer Key for Non-MCQ types */}
                {(!question.options || question.options.length === 0) && question.correctAnswer && (
                  <div className="mt-3 p-3.5 bg-emerald-50/30 border border-emerald-100 rounded-xl">
                    <span className="text-[10px] font-extrabold text-emerald-700 uppercase block tracking-wider">Correct Answer Reference Key</span>
                    <p className="text-xs font-medium text-emerald-800 mt-1">{question.correctAnswer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-sm font-medium text-gray-400">
            No questions are populated inside this assessment profile.
          </div>
        )}
      </div>
    </div>
  );
}