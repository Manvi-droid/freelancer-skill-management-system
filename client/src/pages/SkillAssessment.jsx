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

  // Timer countdown and auto-submission (SRS P4)
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
    console.log('⏰ Timer expired! Auto-submitting test (SRS P4)...');
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
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-500 font-medium ml-1">Assessment Arena — SRS F5 & P4</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-green-600" />
            Technical Competency & Evaluation Arena
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Timed skill assessments with automated scoring and instant Credly credential verification.
          </p>
        </div>

        {/* Live Timer during active test */}
        {testActive && (
          <div className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl border text-sm shadow-sm transition-all ${
            timeLeft < 30
              ? 'bg-red-50 border-red-300 text-red-700 animate-pulse'
              : 'bg-white border-gray-200 text-gray-700'
          }`}>
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Time Remaining: <strong className={timeLeft < 30 ? 'text-red-600' : 'text-green-600'}>{formatTime(timeLeft)}</strong></span>
            {timeLeft < 30 && <span className="text-xs text-red-500 font-semibold">(Auto-submitting!)</span>}
          </div>
        )}
      </div>

      {/* 1. Assessment Selection Grid */}
      {!testActive && !testResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assessments.map(asmt => (
              <div
                key={asmt.id}
                className="bg-white rounded-2xl border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all p-6 shadow-sm flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                      {asmt.category_name}
                    </span>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {asmt.questionCount} Questions
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                    {asmt.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-5">{asmt.description}</p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {Math.round(asmt.time_limit_seconds / 60)} Mins
                    </span>
                    <span>•</span>
                    <span className="text-green-600 font-medium">
                      Pass: {asmt.pass_percentage}%
                    </span>
                  </div>

                  <button
                    onClick={() => startAssessment(asmt.id)}
                    className="px-4 py-2 rounded-lg bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-700 font-medium transition-all border border-gray-200 hover:border-blue-600 flex items-center gap-1.5 shadow-sm"
                  >
                    Start Test <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5 text-sm text-gray-600 flex items-start gap-3.5">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-gray-900 block">Assessment Architecture (SRS Requirement P4):</span>
              <p className="mt-1 leading-relaxed text-gray-600">
                Tests feature auto-submission within 5 seconds of timer expiry. Scoring ≥ 70% instantly verifies the competency, unlocks the Credly digital badge, and alerts hiring recruiters on the platform.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Active Test Interface */}
      {testActive && activeAssessment && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6 text-gray-900">
          {/* Question Navigator Pills */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Questions:</span>
              <div className="flex items-center gap-1.5">
                {questions.map((q, idx) => {
                  const isAnswered = selectedAnswers[q.id] !== undefined;
                  const isCurrent = idx === currentQuestionIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-7 h-7 rounded-lg font-semibold text-xs flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-sm'
                          : isAnswered
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-gray-500 text-sm">
              Answered: <strong className="text-green-600">{Object.keys(selectedAnswers).length}</strong> / {questions.length}
            </div>
          </div>

          {/* Current Question Card */}
          {questions[currentQuestionIndex] && (
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold">
                  Q{currentQuestionIndex + 1}
                </span>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
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
                      className={`p-4 rounded-xl border text-sm cursor-pointer transition-all flex items-center gap-3.5 ${
                        isChecked
                          ? 'border-blue-400 bg-blue-50 text-gray-900 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        isChecked ? 'border-blue-500 bg-blue-600 text-white' : 'border-gray-300 bg-white'
                      }`}>
                        {isChecked && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                      <span className="leading-relaxed">{option}</span>
                    </label>
                  );
                })}
              </div>

              {/* Question Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
                <button
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed bg-white"
                >
                  Previous
                </button>

                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium"
                  >
                    Next Question →
                  </button>
                ) : (
                  <button
                    onClick={() => submitTest(false)}
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm transition-colors"
                  >
                    {submitting ? 'Scoring...' : 'Submit Assessment'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Test Result Review Screen */}
      {testResult && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6 animate-in zoom-in-95 duration-200 text-gray-900">
          {/* Top Score Banner */}
          <div className={`p-8 rounded-2xl text-center border relative overflow-hidden ${
            testResult.passed
              ? 'bg-green-50 border-green-200 text-green-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}>
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 bg-white border border-gray-200 shadow-md">
              {testResult.passed ? (
                <ShieldCheck className="w-12 h-12 text-green-500" />
              ) : (
                <AlertTriangle className="w-12 h-12 text-red-500" />
              )}
            </div>

            <h2 className="text-3xl font-bold tracking-tight mb-2">
              {testResult.passed ? 'Skill Assessment Passed! 🎉' : 'Assessment Completed'}
            </h2>
            <p className="text-sm max-w-md mx-auto leading-relaxed opacity-80">
              {testResult.passed
                ? `You demonstrated verified competency in ${activeAssessment?.skill_name}! Your profile badge is now updated to "Assessed".`
                : `You scored ${testResult.scorePercentage}%. Passing score is ${testResult.passPercentage}%. You can review rationales below and re-test anytime.`}
            </p>

            <div className="flex items-center justify-center gap-8 mt-6 pt-6 border-t border-gray-200/60 text-sm">
              <div>
                <span className="text-gray-500 block uppercase tracking-wider text-xs mb-1">Score</span>
                <span className="text-3xl font-bold text-gray-900">{testResult.scorePercentage}%</span>
              </div>
              <div className="w-px h-10 bg-gray-200"></div>
              <div>
                <span className="text-gray-500 block uppercase tracking-wider text-xs mb-1">Accuracy</span>
                <span className="text-3xl font-bold text-gray-900">{testResult.correctCount} / {testResult.totalQuestions}</span>
              </div>
              <div className="w-px h-10 bg-gray-200"></div>
              <div>
                <span className="text-gray-500 block uppercase tracking-wider text-xs mb-1">Scoring Time</span>
                <span className="text-3xl font-bold text-green-600">{testResult.executionTimeMs}ms</span>
              </div>
            </div>
          </div>

          {/* Question-by-question Review */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-500" />
              Comprehensive Technical Question Review
            </h3>

            <div className="space-y-3 text-sm">
              {testResult.reviewDetails?.map((q, idx) => (
                <div
                  key={q.id}
                  className={`p-5 rounded-xl border space-y-2.5 ${
                    q.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-medium text-gray-900 leading-relaxed">
                      {idx + 1}. {q.question}
                    </span>
                    {q.isCorrect ? (
                      <span className="text-green-600 font-medium flex items-center gap-1 flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4" /> Correct
                      </span>
                    ) : (
                      <span className="text-red-600 font-medium flex items-center gap-1 flex-shrink-0">
                        <XCircle className="w-4 h-4" /> Incorrect
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="p-3 rounded-lg bg-white border border-gray-200">
                      <span className="text-gray-500 block uppercase tracking-wider text-[10px] mb-1">Your Selection:</span>
                      <span className={q.isCorrect ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {q.selectedOption}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-white border border-gray-200">
                      <span className="text-gray-500 block uppercase tracking-wider text-[10px] mb-1">Correct Answer:</span>
                      <span className="text-gray-900 font-medium">{q.correctOption}</span>
                    </div>
                  </div>

                  {q.explanation && (
                    <div className="p-3 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 leading-relaxed">
                      <strong className="text-blue-600">Rationale:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-sm">
            <button
              onClick={() => {
                setTestResult(null);
                setActiveAssessment(null);
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Back to Assessments
            </button>

            <button
              onClick={onFinishAssessment}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all shadow-sm flex items-center gap-2"
            >
              Return to Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
