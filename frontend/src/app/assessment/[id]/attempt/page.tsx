"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, AlertCircle, Loader2, CheckCircle, ArrowLeft, Send } from "lucide-react";

interface Question {
  _id: string;
  type: string;
  questionText: string;
  options?: string[];
  marks: number;
}

interface AssessmentData {
  _id: string;
  title: string;
  topic: string;
  timeLimit: number;
  questions: Question[];
}

export default function StudentAttemptPortal({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const assessmentId = resolvedParams.id;
  const router = useRouter();

  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Student Test Taking State Management
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/assessments/${assessmentId}`);
        if (!response.ok) {
          throw new Error("Could not download the requested examination sheet.");
        }
        const data = await response.json();
        setAssessment(data);
        // Initialize countdown timer based on incoming document specifications
        setTimeLeft(data.timeLimit * 60);
      } catch (err: any) {
        setError(err.message || "An error occurred while loading the test.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentData();
  }, [assessmentId]);

  // Countdown Ticking Loop Interval Engine
  useEffect(() => {
    if (loading || !assessment || isSubmitted) return;

    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, assessment, isSubmitted]);

  const handleOptionSelect = (questionId: string, optionValue: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionValue,
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAutoSubmit = () => {
    setIsSubmitted(true);
    // Here you would connect your backend endpoint to save student score sheets
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to finalize and submit your test paper?")) {
      handleAutoSubmit();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] space-y-4">
        <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
        <p className="text-sm font-medium text-gray-400">Setting up your secure exam session...</p>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-red-50/50 border border-red-200 rounded-2xl p-6 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
        <h3 className="text-sm font-bold text-gray-900">Test Portal Error</h3>
        <p className="text-xs text-red-600 mt-1">{error}</p>
        <Link href="/" className="inline-block bg-white border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold text-gray-700 shadow-sm">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 -mx-8 -my-6 pb-24">
      
      {/* PERSISTENT RUNTIME TEST CONTROL BANNER BAR */}
      <header className="sticky top-0 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm z-50">
        <div>
          <h1 className="text-base font-black text-gray-900 tracking-tight truncate max-w-[240px] sm:max-w-md uppercase">
            {assessment.title}
          </h1>
          <p className="text-xs text-gray-400 font-medium mt-0.5">{assessment.topic}</p>
        </div>

        {/* Live Timer Countdown Ticker */}
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold shadow-sm transition-colors ${
            timeLeft < 300 
              ? "bg-red-50 border-red-100 text-red-600 animate-pulse" 
              : "bg-gray-50 border-gray-100 text-gray-700"
          }`}>
            <Clock className="h-4 w-4 shrink-0" />
            <span className="font-mono tracking-wider">{formatTime(timeLeft)}</span>
          </div>

          {!isSubmitted && (
            <button
              onClick={handleSubmit}
              className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Submit Test</span>
            </button>
          )}
        </div>
      </header>

      {/* CORE ASSESSMENT VIEW SHEET PLATFORM */}
      <div className="max-w-3xl mx-auto px-4 mt-8">
        
        {isSubmitted ? (
          /* SUCCESS SUBMISSION LANDING SCREEN */
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm space-y-6 max-w-xl mx-auto mt-12">
            <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 mx-auto shadow-sm">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Assessment Submitted!</h2>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Thank you! Your answers have been securely submitted to the VedaAI Evaluation engine. Your teacher will release your performance score metrics soon.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/">
                <button className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-5 py-3 rounded-xl shadow-sm transition-all">
                  Back to Dashboard
                </button>
              </Link>
            </div>
          </div>
        ) : (
          /* ACTIVE EXAMINATION FORM SHEET */
          <form onSubmit={handleSubmit} className="space-y-6">
            {assessment.questions.map((question, index) => (
              <div key={question._id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                
                {/* Meta Question Identification Header */}
                <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">
                    Question {index + 1}
                  </span>
                  <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2.5 py-0.5 rounded border border-gray-100/60">
                    {question.marks} {question.marks === 1 ? "Mark" : "Marks"}
                  </span>
                </div>

                {/* Core Text Prompt */}
                <p className="text-base font-semibold text-gray-900 leading-relaxed">
                  {question.questionText}
                </p>

                {/* Interactive Dynamic Option Selectors */}
                {question.options && question.options.length > 0 && (
                  <div className="grid grid-cols-1 gap-3 pt-2">
                    {question.options.map((option, optIdx) => {
                      const prefix = String.fromCharCode(65 + optIdx);
                      const isSelected = selectedAnswers[question._id] === option;

                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleOptionSelect(question._id, option)}
                          className={`flex items-center gap-4 p-4 border rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                            isSelected
                              ? "border-orange-500 bg-orange-50/30 text-orange-900 shadow-sm ring-1 ring-orange-500"
                              : "border-gray-200 bg-white hover:bg-gray-50/50 text-gray-700"
                          }`}
                        >
                          <span className={`h-6 w-6 shrink-0 flex items-center justify-center rounded-md font-bold text-xs transition-colors ${
                            isSelected 
                              ? "bg-orange-500 text-white" 
                              : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                          }`}>
                            {prefix}
                          </span>
                          <span className="leading-tight">{option}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </form>
        )}
      </div>
    </div>
  );
}