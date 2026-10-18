import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import { 
  Award, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  Info,
  Terminal,
  Zap,
  Check
} from 'lucide-react';

export default function SkillAssessment({ onFinishAssessment }) {
  const { token, user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [testActive, setTestActive] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  // Fetch list of assessments
  useEffect(() => {
    fetch('/api/assessments')
      .then(res => res.json())
      .then(data => {
        setAssessments(data.assessments || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching assessments:', err);
        setLoading(false);
      });
  }, []);

  // Timer countdown and auto-submission (SRS P4: auto-submit and score within 5s of timer expiry)
  useEffect(() => {
    if (testActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmitOnExpiry();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [testActive, timeLeft]);

  // Start assessment test
  const startAssessment = async (asmtId) => {
    try {
      const res = await fetch(`/api/assessments/${asmtId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setActiveAssessment(data.assessment);
      setQuestions(data.assessment.questions);
      setSelectedAnswers({});
      setCurrentQuestionIndex(0);
      setTimeLeft(data.assessment.time_limit_seconds || 180);
      setTestResult(null);
      setTestActive(true);
    } catch (err) {
      console.error('Error starting assessment:', err);
    }
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  // Submit test (SRS F5, P4)
  const submitTest = async (isAutoSubmit = false) => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);

    const timeTaken = (activeAssessment.time_limit_seconds || 180) - timeLeft;

    try {
      const res = await fetch(`/api/assessments/${activeAssessment.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers: selectedAnswers,
          timeTakenSeconds: Math.max(1, timeTaken),
        }),
      });

      const data = await res.json();
      setTestResult({
        ...data.result,
        isAutoSubmit,
      });
      setTestActive(false);
      setSubmitting(false);

      // Confetti burst on passing
      if (data.result.passed) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error('Error submitting test:', err);
      setSubmitting(false);
    }
  };

  const handleAutoSubmitOnExpiry = () => {
    console.log('⏰ Timer expired! Auto-submitting test within 5 seconds (SRS P4)...');
    submitTest(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-2">
            HackerRank & Codility Assessment Arena (SRS F5 & P4)
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-emerald-400" />
            Technical Competency & Evaluation Arena
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Timed skill assessments with automated scoring and instant Credly credential verification.
          </p>
        </div>

        {/* Live Timer during active test */}
        {testActive && (
          <div className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border font-mono text-sm shadow-xl transition-all ${
            timeLeft < 30 ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse glow-purple' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Time Remaining: <strong className="text-emerald-400 font-bold">{formatTime(timeLeft)}</strong></span>
            {timeLeft < 30 && <span className="text-xs text-rose-400 font-bold">(Auto-submitting!)</span>}
          </div>
        )}
      </div>

      {/* 1. Assessment Selection Grid (HackerRank Style Challenge Cards) */}
      {!testActive && !testResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assessments.map(asmt => (
              <div
                key={asmt.id}
                className="bg-slate-900/90 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all p-6 shadow-xl flex flex-col justify-between group hover:glow-emerald"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                      {asmt.category_name}
                    </span>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">
                      {asmt.questionCount} Questions
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-lg mb-2 group-hover:text-emerald-300 transition-colors">
                    {asmt.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-5">{asmt.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-3 text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {Math.round(asmt.time_limit_seconds / 60)} Mins
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">
                      Pass: {asmt.pass_percentage}%
                    </span>
                  </div>

                  <button
                    onClick={() => startAssessment(asmt.id)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-white font-bold transition-all shadow-md flex items-center gap-1.5"
                  >
                    Enter Arena <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Info Card on P4 Compliance */}
          <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-5 text-xs text-slate-400 font-mono flex items-start gap-3.5">
            <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">HackerRank Architecture (SRS Requirement P4):</span>
              <p className="mt-1 leading-relaxed text-slate-400">
                Tests feature auto-submission within 5 seconds of timer expiry. Scoring $\ge$ 70% instantly verifies the competency, unlocks the Credly digital badge, and alerts hiring recruiters on the platform.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Active Test Interface (HackerRank / Codility Console) */}
      {testActive && activeAssessment && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 text-slate-100">
          {/* Question Navigator Pills */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Questions:</span>
              <div className="flex items-center gap-1.5">
                {questions.map((q, idx) => {
                  const isAnswered = selectedAnswers[q.id] !== undefined;
                  const isCurrent = idx === currentQuestionIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-violet-600 text-white shadow-md glow-purple border border-violet-400'
                          : isAnswered
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-slate-400">
              Answered: <strong className="text-emerald-400">{Object.keys(selectedAnswers).length}</strong> / {questions.length}
            </div>
          </div>

          {/* Current Question Card */}
          {questions[currentQuestionIndex] && (
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-mono text-cyan-400 text-xs font-bold">
                  Q{currentQuestionIndex + 1}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {questions[currentQuestionIndex].question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                {questions[currentQuestionIndex].options.map((option, optIdx) => {
                  const isChecked = selectedAnswers[questions[currentQuestionIndex].id] === optIdx;
                  return (
                    <label
                      key={optIdx}
                      onClick={() => handleSelectOption(questions[currentQuestionIndex].id, optIdx)}
                      className={`p-4 rounded-2xl border text-xs font-mono cursor-pointer transition-all flex items-center gap-3.5 ${
                        isChecked
                          ? 'border-violet-500 bg-violet-500/15 text-white glow-purple shadow-sm'
                          : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        isChecked ? 'border-violet-400 bg-violet-600 text-white' : 'border-slate-700 bg-slate-900'
                      }`}>
                        {isChecked && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                      <span className="leading-relaxed">{option}</span>
                    </label>
                  );
                })}
              </div>

              {/* Question Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800 font-mono text-xs">
                <button
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold"
                  >
                    Next Question →
                  </button>
                ) : (
                  <button
                    onClick={() => submitTest(false)}
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black shadow-lg glow-emerald"
                  >
                    {submitting ? 'Scoring...' : 'Submit Assessment'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Test Result Review Screen (HackerRank Score Certificate) */}
      {testResult && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 text-slate-100">
          {/* Top Score Banner */}
          <div className={`p-8 rounded-3xl text-center border relative overflow-hidden ${
            testResult.passed
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100 glow-emerald'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-100'
          }`}>
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 bg-slate-950 border border-slate-800 shadow-xl">
              {testResult.passed ? (
                <ShieldCheck className="w-12 h-12 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-12 h-12 text-rose-400" />
              )}
            </div>

            <h2 className="text-3xl font-black tracking-tight mb-2">
              {testResult.passed ? 'Skill Assessment Passed! 🎉' : 'Assessment Completed'}
            </h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              {testResult.passed
                ? `You demonstrated verified competency in ${activeAssessment?.skill_name}! Your profile badge is now updated to "Assessed".`
                : `You scored ${testResult.scorePercentage}%. Passing score is ${testResult.passPercentage}%. You can review rationales below and re-test anytime.`}
            </p>

            <div className="flex items-center justify-center gap-8 mt-6 pt-6 border-t border-slate-800 font-mono text-xs">
              <div>
                <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Percentile Score</span>
                <span className="text-3xl font-black text-white">{testResult.scorePercentage}%</span>
              </div>
              <div className="w-px h-10 bg-slate-800"></div>
              <div>
                <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Accuracy</span>
                <span className="text-3xl font-black text-white">{testResult.correctCount} / {testResult.totalQuestions}</span>
              </div>
              <div className="w-px h-10 bg-slate-800"></div>
              <div>
                <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Scoring Latency</span>
                <span className="text-3xl font-black text-emerald-400">{testResult.executionTimeMs}ms</span>
              </div>
            </div>
          </div>

          {/* Question-by-question Review */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-white font-mono flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Comprehensive Technical Question Review
            </h3>

            <div className="space-y-3 font-mono text-xs">
              {testResult.reviewDetails?.map((q, idx) => (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border space-y-2.5 ${
                    q.isCorrect ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-bold text-white leading-relaxed">
                      {idx + 1}. {q.question}
                    </span>
                    {q.isCorrect ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1 flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4" /> Correct
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center gap-1 flex-shrink-0">
                        <XCircle className="w-4 h-4" /> Incorrect
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block uppercase tracking-wider text-[10px] mb-1">Your Selection:</span>
                      <span className={q.isCorrect ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                        {q.selectedOption}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block uppercase tracking-wider text-[10px] mb-1">Correct Answer:</span>
                      <span className="text-white font-medium">{q.correctOption}</span>
                    </div>
                  </div>

                  {q.explanation && (
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 font-sans leading-relaxed">
                      <strong className="text-cyan-400 font-mono">Rationale:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
            <button
              onClick={() => {
                setTestResult(null);
                setActiveAssessment(null);
              }}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Assessment Arena List
            </button>

            <button
              onClick={onFinishAssessment}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all shadow-md flex items-center gap-2 glow-purple"
            >
              Return to Character Sheet <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
