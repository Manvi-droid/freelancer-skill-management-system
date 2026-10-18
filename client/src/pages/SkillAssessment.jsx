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
  Info
} from 'lucide-react';

export default function SkillAssessment({ onFinishAssessment }) {
  const { token, user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
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
          particleCount: 100,
          spread: 70,
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 mb-1">
            SRS Requirement F5 & P4 (Section 3.2 & 4.1)
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-emerald-600" />
            Skill Evaluation & Assessment Engine
          </h1>
          <p className="text-xs text-slate-600">
            Take timed technical competency tests to earn official <span className="font-semibold text-emerald-600">Assessed</span> badges. Evaluated and scored within 5 seconds (P4).
          </p>
        </div>

        {/* Live Timer during active test */}
        {testActive && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono text-sm shadow-xs ${
            timeLeft < 30 ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse' : 'bg-slate-900 text-white'
          }`}>
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Time Remaining: <strong>{formatTime(timeLeft)}</strong></span>
            {timeLeft < 30 && <span className="text-xs text-rose-600 font-bold">(Auto-submitting soon!)</span>}
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
                className="bg-white rounded-2xl border-2 border-slate-900/80 hover:border-indigo-600 transition-all p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {asmt.category_name}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                      {asmt.questionCount} Questions
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-1.5">{asmt.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{asmt.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {Math.round(asmt.time_limit_seconds / 60)} Mins
                    </span>
                    <span>•</span>
                    <span className="text-emerald-700 font-medium">
                      Pass: {asmt.pass_percentage}%
                    </span>
                  </div>

                  <button
                    onClick={() => startAssessment(asmt.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs transition-colors shadow-2xs flex items-center gap-1"
                  >
                    Start Test <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Info Card on P4 Compliance */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-xs text-slate-600 flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">SRS Requirement P4 Architecture:</span>
              <p className="mt-0.5 leading-relaxed">
                Skill assessment tests auto-submit and score within 5 seconds of timer expiry. Passing the assessment (&gt;= 70%) immediately promotes the skill on your profile to "Assessed" status and notifies platform recruiters.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Active Test Interface */}
      {testActive && activeAssessment && (
        <div className="bg-white rounded-2xl border-2 border-slate-900/80 p-6 shadow-md space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{activeAssessment.title}</h2>
              <p className="text-xs text-slate-500">Select the best answer for each question. All answers are scored simultaneously.</p>
            </div>
            <div className="text-xs text-slate-500">
              Answered: <strong>{Object.keys(selectedAnswers).length}</strong> / {questions.length}
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-6">
            {questions.map((q, qIndex) => (
              <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="font-bold text-sm text-slate-900 flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center flex-shrink-0">
                    {qIndex + 1}
                  </span>
                  <span>{q.question}</span>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-1 pl-8">
                  {q.options.map((option, optIdx) => {
                    const isChecked = selectedAnswers[q.id] === optIdx;
                    return (
                      <label
                        key={optIdx}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center gap-3 ${
                          isChecked
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs ring-1 ring-indigo-500'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isChecked ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </div>
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Action Bar */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Test auto-submits when timer expires per SRS P4.
            </span>

            <button
              onClick={() => submitTest(false)}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              {submitting ? 'Evaluating & Scoring...' : 'Submit & Score Assessment'}
            </button>
          </div>
        </div>
      )}

      {/* 3. Test Result Review Screen */}
      {testResult && (
        <div className="bg-white rounded-2xl border-2 border-slate-900/80 p-6 shadow-md space-y-6 animate-in zoom-in-95 duration-200">
          {/* Top Score Banner */}
          <div className={`p-6 rounded-2xl text-center border ${
            testResult.passed
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 shadow-md bg-white">
              {testResult.passed ? (
                <ShieldCheck className="w-10 h-10 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-10 h-10 text-rose-600" />
              )}
            </div>

            <h2 className="text-2xl font-black mb-1">
              {testResult.passed ? 'Skill Assessment Passed! 🎉' : 'Assessment Completed'}
            </h2>
            <p className="text-xs font-medium max-w-md mx-auto">
              {testResult.passed
                ? `You demonstrated verified competency in ${activeAssessment?.skill_name}! Your profile badge is now updated to "Assessed".`
                : `You scored ${testResult.scorePercentage}%. Passing score is ${testResult.passPercentage}%. You can review explanations below and retake anytime.`}
            </p>

            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-black/10 text-xs">
              <div>
                <span className="text-slate-500 block">Final Score</span>
                <span className="text-2xl font-black">{testResult.scorePercentage}%</span>
              </div>
              <div className="w-px h-8 bg-black/10"></div>
              <div>
                <span className="text-slate-500 block">Correct Answers</span>
                <span className="text-2xl font-black">{testResult.correctCount} / {testResult.totalQuestions}</span>
              </div>
              <div className="w-px h-8 bg-black/10"></div>
              <div>
                <span className="text-slate-500 block">Evaluation Latency</span>
                <span className="text-2xl font-black text-emerald-700">{testResult.executionTimeMs}ms</span>
              </div>
            </div>
          </div>

          {/* Question-by-question Review */}
          <div>
            <h3 className="font-bold text-sm text-slate-900 mb-3">Detailed Question Review & Explanations</h3>
            <div className="space-y-3">
              {testResult.reviewDetails?.map((q, idx) => (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    q.isCorrect ? 'border-emerald-200 bg-emerald-50/30' : 'border-rose-200 bg-rose-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-800">
                      {idx + 1}. {q.question}
                    </span>
                    {q.isCorrect ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1 flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4" /> Correct
                      </span>
                    ) : (
                      <span className="text-rose-700 font-bold flex items-center gap-1 flex-shrink-0">
                        <XCircle className="w-4 h-4" /> Incorrect
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-400 block font-semibold">Your Selection:</span>
                      <span className={q.isCorrect ? 'text-emerald-700 font-medium' : 'text-rose-700 font-medium'}>
                        {q.selectedOption}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-400 block font-semibold">Correct Answer:</span>
                      <span className="text-slate-800 font-medium">{q.correctOption}</span>
                    </div>
                  </div>

                  {q.explanation && (
                    <div className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed">
                      <strong>Rationale:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => {
                setTestResult(null);
                setActiveAssessment(null);
              }}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Back to Assessment List
            </button>

            <button
              onClick={onFinishAssessment}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
            >
              View Updated Freelancer Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
