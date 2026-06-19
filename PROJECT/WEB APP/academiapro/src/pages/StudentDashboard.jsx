import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { 
  FileText, 
  TrendingUp, 
  Award, 
  Calendar, 
  Clock, 
  BookOpen, 
  ChevronRight,
  PlayCircle
} from 'lucide-react';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userName = localStorage.getItem('userName') || 'Student';
  const role = localStorage.getItem('role') || 'student';

  useEffect(() => {
    async function fetchData() {
      try {
        if (role === 'admin') {
          const studentsData = await apiFetch('/api/students').catch(() => []);
          setStudents(Array.isArray(studentsData) ? studentsData : []);
        } else {
          const [examsData, resultsData] = await Promise.all([
            apiFetch('/api/exams').catch(() => []),
            apiFetch('/api/results/my-results').catch(() => []),
          ]);
          setExams(Array.isArray(examsData) ? examsData : []);
          setResults(Array.isArray(resultsData) ? resultsData : []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [role]);

  // Derive assigned exams (sorted by start date, and enrich them)
  const now = new Date();
  const enrichedExams = exams
    .map(exam => {
      const start = new Date(exam.startDate);
      const end = new Date(exam.endDate);
      let status = 'upcoming';
      if (now >= start && now <= end) status = 'available';
      else if (now > end) status = 'completed';
      const durationStr = exam.duration >= 60
        ? `${Math.floor(exam.duration / 60)}h${exam.duration % 60 > 0 ? ` ${exam.duration % 60}m` : ''}`
        : `${exam.duration}m`;
      return { ...exam, status, durationStr };
    })
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  // Derive completed exams
  const completedExamIds = new Set(results.map(r => {
    if (r.examId && typeof r.examId === 'object') {
      return r.examId._id;
    }
    return r.examId;
  }));

  const pendingExams = enrichedExams.filter(e => !completedExamIds.has(e._id));
  const completedExams = enrichedExams.filter(e => completedExamIds.has(e._id));

  // Find next active/upcoming exam for subtext
  const nextExam = pendingExams.find(e => e.status !== 'completed');

  // Compute stats from real data
  const examsTaken = results.length;
  const avgScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => {
        const total = r.examId?.totalMarks || 1;
        return sum + (r.score / total) * 100;
      }, 0) / results.length)
    : 0;

  const studentStats = [
    { label: 'Exams Taken', value: String(examsTaken), icon: FileText, trend: 'neutral' },
    { label: 'Average Score', value: `${avgScore}%`, icon: TrendingUp, trend: 'up' },
    { label: 'Results', value: String(results.length), sub: 'Graded submissions', icon: Award, trend: 'neutral' },
    { label: 'Upcoming Exams', value: String(pendingExams.length), sub: nextExam ? `Next: ${new Date(nextExam.startDate).toLocaleDateString()}` : 'None scheduled', icon: Calendar, trend: pendingExams.length > 0 ? 'warn' : 'neutral' },
  ];

  // Helper to get grade letter from percentage
  function getGrade(score, total) {
    const pct = (score / (total || 1)) * 100;
    if (pct >= 90) return 'A';
    if (pct >= 80) return 'B+';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    return 'D';
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 bg-surface min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-body-sm text-on-surface-variant">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (role === 'admin') {
    return (
      <div className="p-6 lg:p-8 space-y-6 bg-surface min-h-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-headline-md font-semibold text-on-surface">Student Management</h1>
            <p className="text-body-sm text-on-surface-variant mt-1">
              View and manage all registered students on the platform.
            </p>
          </div>
        </div>

        {error && (
          <p className="text-body-sm text-orange-400 bg-orange-900/20 border border-orange-700/40 rounded-md px-sm py-xs">
            {error}
          </p>
        )}

        <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50 border-b border-outline-variant/45">
                  <th className="px-6 py-4 text-label-caps font-mono uppercase tracking-widest text-on-surface-variant">Name</th>
                  <th className="px-6 py-4 text-label-caps font-mono uppercase tracking-widest text-on-surface-variant">Email</th>
                  <th className="px-6 py-4 text-label-caps font-mono uppercase tracking-widest text-on-surface-variant">Registered Date</th>
                  <th className="px-6 py-4 text-label-caps font-mono uppercase tracking-widest text-on-surface-variant">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-body-sm text-on-surface-variant">
                      No registered students found.
                    </td>
                  </tr>
                ) : (
                  students.map(s => (
                    <tr key={s._id} className="hover:bg-surface-container-high/30 transition-colors">
                      <td className="px-6 py-4 text-body-sm font-semibold text-on-surface">{s.name}</td>
                      <td className="px-6 py-4 text-body-sm text-on-surface-variant">{s.email}</td>
                      <td className="px-6 py-4 text-body-sm text-on-surface-variant font-mono">
                        {new Date(s.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </td>
                      <td className="px-6 py-4 text-body-sm">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {s.role}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-surface min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 fade-in-up">
        <div>
          <h1 className="text-headline-md font-semibold text-on-surface">Student Dashboard</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">Welcome back, {userName}. Ready for your next exam?</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/schedule')}>
          View Full Schedule
        </button>
      </div>

      {error && (
        <p className="text-body-sm text-orange-400 bg-orange-900/20 border border-orange-700/40 rounded-md px-sm py-xs">
          Some data could not be loaded. {error}
        </p>
      )}

      {/* Performance Summary (Stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {studentStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx} 
              className={`fade-in-up fade-in-up-${idx + 1} bg-surface-container border border-outline-variant rounded-xl p-5 hover:border-primary/30 transition-colors group`}
            >
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high group-hover:bg-primary/10 flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                  <Icon size={20} />
                </div>
                {stat.change && (
                  <span className={`text-label-caps px-2 py-1 rounded-md ${stat.trend === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    {stat.change}
                  </span>
                )}
                {stat.trend === 'warn' && (
                  <span className="text-label-caps px-2 py-1 rounded-md bg-orange-500/10 text-orange-400">
                    Action Needed
                  </span>
                )}
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-semibold text-on-surface tracking-tight">{stat.value}</h3>
                <p className="text-body-sm text-on-surface-variant mt-1 font-medium">{stat.label}</p>
                {stat.sub && <p className="text-[11px] text-outline mt-1 tracking-wide">{stat.sub}</p>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Exams */}
        <div className="bg-surface-container border border-outline-variant rounded-xl p-6 fade-in-up fade-in-up-3 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-body-base font-semibold text-on-surface">Pending Exams</h2>
          </div>
          <div className="space-y-4 flex-1">
            {pendingExams.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant py-8 text-center">No pending exams.</p>
            ) : (
              pendingExams.map((exam) => {
                const startDate = new Date(exam.startDate);
                const dateStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const timeStr = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={exam._id} className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/50 hover:border-primary/40 transition-colors flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="flex items-start gap-4">
                      {/* Date Block */}
                      <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center shrink-0 ${exam.status === 'available' ? 'bg-primary/20 text-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                        <span className="text-[10px] font-mono uppercase font-bold">{dateStr.substring(0, 3)}</span>
                        <span className="text-lg font-bold leading-none mt-0.5">{startDate.getDate()}</span>
                      </div>
                      
                      {/* Exam Info */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-primary tracking-wider uppercase bg-primary/10 px-2 py-0.5 rounded">
                            {exam.subject || 'General'}
                          </span>
                          {exam.status === 'available' && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Available
                            </span>
                          )}
                          {exam.status === 'upcoming' && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
                              Upcoming
                            </span>
                          )}
                          {exam.status === 'completed' && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
                              Completed
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-body-sm font-semibold text-on-surface mt-2">{exam.title}</h3>
                        {exam.description && <p className="text-[12px] text-on-surface-variant mt-1 line-clamp-2">{exam.description}</p>}
                        
                        <div className="flex items-center gap-3 mt-2 text-[12px] text-on-surface-variant">
                          <span className="flex items-center gap-1"><Clock size={12} /> {timeStr}</span>
                          <span className="flex items-center gap-1"><BookOpen size={12} /> {exam.durationStr}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Start Button or Status */}
                    {exam.status === 'available' ? (
                      <button
                        onClick={() => navigate(`/exam?examId=${exam._id}`)}
                        className="btn-primary w-full sm:w-auto mt-2 sm:mt-0"
                      >
                        <PlayCircle size={16} /> Start Exam
                      </button>
                    ) : (
                      <button className="btn-ghost w-full sm:w-auto mt-2 sm:mt-0 opacity-60 cursor-not-allowed" disabled>
                        Not Available
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Completed Exams */}
        <div className="bg-surface-container border border-outline-variant rounded-xl p-6 fade-in-up fade-in-up-4 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-body-base font-semibold text-on-surface">Completed Exams</h2>
          </div>
          <div className="space-y-4 flex-1">
            {completedExams.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant py-8 text-center">No completed exams yet.</p>
            ) : (
              completedExams.map((exam) => {
                const submission = results.find(r => {
                  const rId = r.examId && typeof r.examId === 'object' ? r.examId._id : r.examId;
                  return rId === exam._id;
                });
                const score = submission?.score;
                const total = exam.totalMarks || 100;
                const pct = score !== null && score !== undefined ? Math.round((score / total) * 100) : null;
                const grade = score !== null && score !== undefined ? getGrade(score, total) : 'N/A';
                const dateStr = submission?.submittedAt ? new Date(submission.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

                return (
                  <div key={exam._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-high transition-colors group cursor-pointer" onClick={() => navigate('/my-results')}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                        <span className="text-body-sm font-bold text-on-surface">{grade}</span>
                      </div>
                      <div>
                        <h3 className="text-body-sm font-semibold text-on-surface group-hover:text-primary transition-colors">{exam.title}</h3>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-on-surface-variant">
                          <span className="font-mono text-primary">{exam.subject || 'General'}</span>
                          {dateStr && <><span>•</span><span>{dateStr}</span></>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {pct !== null && (
                        <div className="text-right hidden sm:block">
                          <span className="text-body-base font-semibold text-on-surface">{pct}%</span>
                          <p className="text-[10px] text-outline uppercase tracking-wider">Score</p>
                        </div>
                      )}
                      <button className="btn-primary py-1.5 px-3 text-body-sm">
                        View Result
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
