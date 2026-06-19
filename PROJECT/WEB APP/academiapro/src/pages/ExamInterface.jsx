import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  LogOut,
  AlertTriangle,
  AlertCircle,
  Flag
} from 'lucide-react';

export default function ExamInterface() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const examId = searchParams.get('examId');

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [violationCount, setViolationCount] = useState(0);
  const [warningMessage, setWarningMessage] = useState('');

  // ─── Anti-Cheat: Report Violation ────────────────────────────────────────────
  const reportViolation = useCallback(async (type) => {
    try {
      await apiFetch('/api/violations', {
        method: 'POST',
        body: JSON.stringify({ examId, violationType: type }),
      });
    } catch (err) {
      console.error('Failed to record violation', err);
    }
    setViolationCount((c) => c + 1);
  }, [examId]);

  // ─── Anti-Cheat: Event Listeners ─────────────────────────────────────────────
  useEffect(() => {
    // Request fullscreen on exam start
    const requestFs = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (e) {
        console.warn('Unable to enter fullscreen', e);
      }
    };
    requestFs();

    const handleVisibility = () => {
      if (document.hidden) reportViolation('tab-switch');
    };
    const handleBlur = () => reportViolation('focus-loss');
    const handleCopy = () => reportViolation('copy');
    const handlePaste = () => reportViolation('paste');
    const handleContext = (e) => {
      e.preventDefault();
      reportViolation('right-click');
    };
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) reportViolation('fullscreen-exit');
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContext);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContext);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [reportViolation]);

  // ─── Anti-Cheat: Auto-Submit After 3 Violations ───────────────────────────────
  useEffect(() => {
    if (violationCount === 0) return;
    if (violationCount < 3) {
      setWarningMessage(
        `⚠️ Warning ${violationCount}/3: Suspicious activity detected. The exam will be auto-submitted after ${3 - violationCount} more violation(s).`
      );
    } else if (violationCount >= 3 && !isSubmitted) {
      setWarningMessage('🚨 Maximum violations reached. Submitting exam automatically…');
      autoSubmit();
    }
  }, [violationCount]);

  const autoSubmit = async () => {
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, optionIdx]) => {
        const question = questions.find((q) => q._id === questionId);
        return {
          questionId,
          answer: question?.options?.[optionIdx] || String(optionIdx),
        };
      });
      await apiFetch(`/api/attempts/submit/${examId}`, {
        method: 'POST',
        body: JSON.stringify({ answers: formattedAnswers, suspicious: true }),
      });
    } catch (err) {
      console.error('Auto-submit failed', err);
    }
    setIsSubmitted(true);
  };

  // ─── Fetch Exam Data ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!examId) {
      setError('No exam ID provided. Please go back and select an exam.');
      setLoading(false);
      return;
    }
    async function fetchExamData() {
      try {
        const [examData, questionsData] = await Promise.all([
          apiFetch('/api/exams').then((exams) => {
            const found = (Array.isArray(exams) ? exams : []).find((e) => e._id === examId);
            if (!found) throw new Error('Exam not found');
            return found;
          }),
          apiFetch(`/api/questions/exam/${examId}`),
        ]);
        setExam(examData);
        setQuestions(Array.isArray(questionsData) ? questionsData : []);
        setTimeLeft((examData.duration || 60) * 60);
        await apiFetch(`/api/attempts/start/${examId}`, { method: 'POST' });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchExamData();
  }, [examId]);

  // ─── Timer ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0) setIsSubmitted(true);
      return;
    }
    if (isSubmitted) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds) => {
    if (seconds == null) return '--:--';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (qId, optionIdx) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(answers).length;
    const isComplete = answeredCount === questions.length;
    const message = isComplete
      ? 'Are you sure you want to submit your exam?'
      : `You have ${questions.length - answeredCount} unanswered questions. Are you sure you want to submit?`;

    if (window.confirm(message)) {
      try {
        const formattedAnswers = Object.entries(answers).map(([questionId, optionIdx]) => {
          const question = questions.find((q) => q._id === questionId);
          return {
            questionId,
            answer: question?.options?.[optionIdx] || String(optionIdx),
          };
        });
        await apiFetch(`/api/attempts/submit/${examId}`, {
          method: 'POST',
          body: JSON.stringify({ answers: formattedAnswers }),
        });
      } catch (err) {
        alert('Failed to submit exam. Please try again. Error: ' + err.message);
        throw err;
      }
      setIsSubmitted(true);
    }
  };

  // ─── States ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-body-sm text-on-surface-variant">Loading exam…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle size={40} />
        </div>
        <h1 className="text-headline-md font-semibold text-on-surface mb-3">Unable to Load Exam</h1>
        <p className="text-body-base text-on-surface-variant mb-10 max-w-md">{error}</p>
        <button onClick={() => navigate('/exams')} className="btn-primary py-3 px-8">Return to Exams</button>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center fade-in-up">
        <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6 mx-auto">
          <CheckCircle size={40} />
        </div>
        <h1 className="text-display-lg font-semibold text-on-surface mb-3 tracking-tight">Exam Submitted</h1>
        <p className="text-body-base text-on-surface-variant mb-10 max-w-md mx-auto leading-relaxed">
          Your answers for <strong className="text-on-surface">{exam?.title || 'the exam'}</strong> have been successfully recorded.
        </p>
        <button onClick={() => navigate('/student')} className="btn-primary py-3 px-8 text-body-base shadow-lg">
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-headline-md font-semibold text-on-surface mb-3">No Questions Found</h1>
        <p className="text-body-base text-on-surface-variant mb-10">This exam does not have any questions yet.</p>
        <button onClick={() => navigate('/exams')} className="btn-primary py-3 px-8">Return to Exams</button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans selection:bg-primary/30">

      {/* Anti-Cheat Warning Banner */}
      {warningMessage && (
        <div className={`px-4 py-2.5 flex items-center gap-2 text-sm font-medium ${
          violationCount >= 3
            ? 'bg-red-600 text-white'
            : 'bg-amber-100 border-b border-amber-300 text-amber-900'
        }`}>
          <AlertCircle size={16} className="shrink-0" />
          <span>{warningMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="h-16 bg-surface-container border-b border-outline-variant flex items-center justify-between px-4 sm:px-6 shrink-0 z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to exit? Your progress will be lost.')) navigate('/exams');
            }}
            className="w-10 h-10 flex items-center justify-center rounded-md bg-surface-container-high text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
            title="Exit Exam"
          >
            <LogOut size={18} />
          </button>
          <div className="hidden sm:block">
            <h1 className="text-body-base font-semibold text-on-surface leading-tight">{exam?.title || 'Exam'}</h1>
            <p className="text-[11px] text-on-surface-variant uppercase tracking-wider font-mono mt-0.5">{exam?.description?.substring(0, 30) || ''}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Violation badge */}
          {violationCount > 0 && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              violationCount >= 2 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              <Flag size={12} />
              {violationCount}/3 Violations
            </div>
          )}

          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-colors
            ${timeLeft < 300 ? 'border-error/50 bg-error/10 text-error animate-pulse' : 'border-outline-variant bg-surface text-on-surface'}`}
          >
            <Clock size={16} />
            <span className="font-mono font-bold tracking-wider">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* Left Sidebar */}
        <aside className="w-full md:w-72 bg-surface-container-low border-r border-outline-variant flex flex-col shrink-0 md:h-[calc(100vh-4rem)]">
          <div className="p-5 border-b border-outline-variant">
            <h2 className="text-body-sm font-semibold text-on-surface mb-2">Exam Progress</h2>
            <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden mb-3">
              <div
                className="bg-primary h-full transition-all duration-500 ease-out"
                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-on-surface-variant tracking-wide font-medium">
              {answeredCount} of {questions.length} Questions Answered
            </p>
          </div>
          <div className="p-5 flex-1 overflow-y-auto">
            <div className="flex flex-wrap gap-2.5">
              {questions.map((q, idx) => {
                const isAnswered = answers[q._id] !== undefined;
                const isCurrent = currentIndex === idx;
                return (
                  <button
                    key={q._id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-10 h-10 rounded-lg text-sm font-bold font-mono flex items-center justify-center transition-all border
                      ${isCurrent
                        ? 'border-primary ring-2 ring-primary/20 bg-primary/10 text-primary shadow-sm'
                        : isAnswered
                          ? 'border-transparent bg-surface-container-highest text-on-surface'
                          : 'border-outline-variant bg-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface hover:border-outline'
                      }
                    `}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Content */}
        <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-surface relative">
          <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-16 relative">
            <div className="max-w-3xl mx-auto fade-in-up" key={currentQuestion._id}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-label-caps bg-surface-container-high text-on-surface px-3 py-1.5 rounded-md tracking-widest uppercase font-bold shadow-sm">
                  Question {currentIndex + 1} <span className="text-on-surface-variant font-normal">of {questions.length}</span>
                </span>
                {answers[currentQuestion._id] === undefined && (
                  <span className="text-[11px] text-orange-400 font-medium flex items-center gap-1">
                    <AlertTriangle size={12} /> Unanswered
                  </span>
                )}
              </div>

              <h2 className="text-headline-md text-on-surface font-medium leading-relaxed mb-8">
                {currentQuestion.questionText}
              </h2>

              {currentQuestion.options && currentQuestion.options.length > 0 && (
                <div className="space-y-4">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = answers[currentQuestion._id] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(currentQuestion._id, idx)}
                        className={`w-full text-left p-5 rounded-xl border-2 flex items-start gap-4 transition-all group
                          ${isSelected
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-outline-variant bg-surface-container hover:border-outline hover:bg-surface-container-high'
                          }
                        `}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors
                          ${isSelected ? 'border-primary bg-primary' : 'border-outline group-hover:border-on-surface-variant'}`}>
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-surface" />}
                        </div>
                        <span className={`text-body-base leading-relaxed ${isSelected ? 'text-on-surface font-medium' : 'text-on-surface-variant'}`}>
                          {option}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQuestion.questionType === 'essay' && (
                <textarea
                  className="input-field w-full h-40 resize-none"
                  placeholder="Write your answer here..."
                  value={answers[currentQuestion._id] || ''}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [currentQuestion._id]: e.target.value }))}
                />
              )}
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="h-20 bg-surface-container border-t border-outline-variant px-6 flex items-center justify-between shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-10">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="btn-ghost py-2.5 px-4 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} /> Previous
            </button>

            <div className="flex items-center gap-4">
              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="btn-primary py-2.5 px-6 bg-green-600 hover:bg-green-500 text-white border-transparent"
                >
                  <CheckCircle size={18} /> Submit Exam
                </button>
              ) : (
                <button onClick={handleNext} className="btn-primary py-2.5 px-6">
                  Next <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
