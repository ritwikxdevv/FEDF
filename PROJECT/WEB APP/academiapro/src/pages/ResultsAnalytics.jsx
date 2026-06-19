import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Search, 
  Download, 
  Award,
  BookOpen,
  X
} from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function ResultsAnalytics() {
  const role = localStorage.getItem('role') || 'student';
  const [results, setResults] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        if (role === 'admin') {
          const [resultsData, analyticsData] = await Promise.all([
            apiFetch('/api/results/all').catch(() => []),
            apiFetch('/api/analytics').catch(() => null)
          ]);
          setResults(Array.isArray(resultsData) ? resultsData : []);
          setAnalytics(analyticsData);
        } else {
          const resultsData = await apiFetch('/api/results/my-results').catch(() => []);
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

  // Helper to get grade letter from percentage
  function getGrade(score, total) {
    const pct = (score / (total || 1)) * 100;
    if (pct >= 90) return 'A';
    if (pct >= 80) return 'B+';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    return 'D';
  }

  // Filtered results by search query
  const filteredResults = results.filter(r => {
    const title = (r.examId?.title || '').toLowerCase();
    const subject = (r.examId?.subject || r.examId?.courseCode || '').toLowerCase();
    const studentName = (r.studentId?.name || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    return title.includes(query) || subject.includes(query) || studentName.includes(query);
  });

  // Calculate dynamic stats cards
  let stats = [];
  if (role === 'admin' && analytics) {
    stats = [
      { label: 'Total Students', value: String(analytics.totalStudents ?? 0), icon: Users, trend: 'neutral' },
      { label: 'Total Exams', value: String(analytics.totalExams ?? 0), sub: 'All assessments', icon: BookOpen, trend: 'neutral' },
      { label: 'Average Score', value: `${analytics.averageScore ?? 0}%`, icon: CheckCircle, trend: 'up' },
      { label: 'Pass Percentage', value: `${analytics.passPercentage ?? 0}%`, icon: BarChart3, trend: 'up' },
    ];
  } else if (role === 'student') {
    const avgScore = results.length > 0
      ? Math.round(results.reduce((sum, r) => {
          const total = r.examId?.totalMarks || 100;
          return sum + (r.score / total) * 100;
        }, 0) / results.length)
      : 0;

    const highestScore = results.length > 0
      ? Math.max(...results.map(r => {
          const total = r.examId?.totalMarks || 100;
          return Math.round((r.score / total) * 100);
        }))
      : 0;

    const passRate = results.length > 0
      ? Math.round((results.filter(r => {
          const total = r.examId?.totalMarks || 100;
          return (r.score / total) * 100 >= 50;
        }).length / results.length) * 100)
      : 0;

    stats = [
      { label: 'Exams Completed', value: String(results.length), icon: CheckCircle, trend: 'neutral' },
      { label: 'Average Score', value: `${avgScore}%`, icon: TrendingUp, trend: 'up' },
      { label: 'Highest Score', value: `${highestScore}%`, icon: Award, trend: 'neutral' },
      { label: 'Passing Rate', value: `${passRate}%`, icon: BarChart3, trend: 'neutral' }
    ];
  }

  // Calculate dynamic Score Distribution for Admin
  const scoreDistribution = [
    { label: 'A', range: '90-100', count: 0 },
    { label: 'B', range: '80-89', count: 0 },
    { label: 'C', range: '70-79', count: 0 },
    { label: 'D', range: '60-69', count: 0 },
    { label: 'F', range: '0-59', count: 0 }
  ];
  if (role === 'admin') {
    results.forEach(r => {
      const pct = Math.round((r.score / (r.examId?.totalMarks || 100)) * 100);
      if (pct >= 90) scoreDistribution[0].count++;
      else if (pct >= 80) scoreDistribution[1].count++;
      else if (pct >= 70) scoreDistribution[2].count++;
      else if (pct >= 60) scoreDistribution[3].count++;
      else scoreDistribution[4].count++;
    });
  }
  const maxScoreCount = scoreDistribution.length > 0 ? Math.max(...scoreDistribution.map(d => d.count)) : 0;

  // Calculate dynamic Top Performers for Admin
  const topStudents = results
    .map(r => ({
      name: r.studentId?.name || 'Student',
      dept: r.examId?.title || 'Exam',
      avg: Math.round((r.score / (r.examId?.totalMarks || 100)) * 100)
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 bg-surface min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-body-sm text-on-surface-variant">Loading results…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-surface min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 fade-in-up">
        <div>
          <h1 className="text-headline-md font-semibold text-on-surface">Results & Analytics</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {role === 'admin' ? 'Comprehensive performance breakdown across all departments.' : 'Your grading history and assessment reports.'}
          </p>
        </div>
        <button className="btn-ghost" disabled>
          <Download size={18} /> Export Report
        </button>
      </div>

      {error && (
        <p className="text-body-sm text-orange-400 bg-orange-900/20 border border-orange-700/40 rounded-md px-sm py-xs">
          Some data could not be loaded. {error}
        </p>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Results List */}
        <div className={`${role === 'admin' ? 'lg:col-span-2' : 'col-span-full'} bg-surface-container border border-outline-variant rounded-xl overflow-hidden fade-in-up fade-in-up-3 flex flex-col`}>
          <div className="p-6 border-b border-outline-variant/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-body-base font-semibold text-on-surface">
              {role === 'admin' ? 'Student Submissions' : 'Completed Exams'}
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={14} />
              <input 
                type="text" 
                placeholder="Search assessments..." 
                className="bg-surface-container-low border border-outline-variant rounded-md py-1.5 pl-9 pr-3 text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary w-full sm:w-64"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-surface-container-low/50">
                  {role === 'admin' && <th className="px-6 py-4 text-label-caps font-mono uppercase tracking-widest text-on-surface-variant">Student</th>}
                  <th className="px-6 py-4 text-label-caps font-mono uppercase tracking-widest text-on-surface-variant">Exam Title</th>
                  <th className="px-6 py-4 text-label-caps font-mono uppercase tracking-widest text-on-surface-variant">Subject</th>
                  <th className="px-6 py-4 text-label-caps font-mono uppercase tracking-widest text-on-surface-variant">Score</th>
                  <th className="px-6 py-4 text-label-caps font-mono uppercase tracking-widest text-on-surface-variant">Percentage</th>
                  <th className="px-6 py-4 text-label-caps font-mono uppercase tracking-widest text-on-surface-variant">Date</th>
                  <th className="px-6 py-4 text-label-caps font-mono uppercase tracking-widest text-on-surface-variant">Status</th>
                  <th className="px-6 py-4 text-label-caps font-mono uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={role === 'admin' ? 8 : 7} className="px-6 py-8 text-center text-body-sm text-on-surface-variant">
                      No results found.
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((result, idx) => {
                    const total = result.examId?.totalMarks || 100;
                    const pct = Math.round((result.score / total) * 100);
                    const dateStr = result.submittedAt ? new Date(result.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

                    return (
                      <tr key={idx} className="hover:bg-surface-container-high/30 transition-colors">
                        {role === 'admin' && (
                          <td className="px-6 py-4">
                            <span className="font-semibold text-on-surface block">{result.studentId?.name || 'Unknown'}</span>
                            <span className="text-[10px] text-on-surface-variant font-mono">{result.studentId?.email || ''}</span>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <span className="font-semibold text-on-surface">{result.examId?.title || 'Exam'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[11px] font-mono font-bold text-primary tracking-wider uppercase bg-primary/10 px-2 py-0.5 rounded">
                            {result.examId?.subject || result.examId?.courseCode || 'General'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-on-surface font-medium">
                          {result.score} / {total}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-on-surface w-10">{pct}%</span>
                            <div className="w-20 h-1.5 bg-surface-container-highest rounded-full overflow-hidden hidden sm:block">
                              <div 
                                className={`h-full ${pct >= 50 ? 'bg-green-400' : 'bg-orange-400'}`} 
                                style={{ width: `${pct}%` }} 
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant font-mono text-[12px]">{dateStr}</td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                            {result.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => setSelectedResult(result)}
                            className="btn-primary py-1 px-3 text-body-sm shadow-sm"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {role === 'admin' && (
          <div className="space-y-6 lg:col-span-1">
            {/* Score Distribution Chart */}
            <div className="bg-surface-container border border-outline-variant rounded-xl p-6 fade-in-up fade-in-up-4">
              <h2 className="text-body-base font-semibold text-on-surface mb-6">Score Distribution</h2>
              <div className="space-y-4">
                {scoreDistribution.map((dist, idx) => {
                  const percentage = maxScoreCount > 0 ? (dist.count / maxScoreCount) * 100 : 0;
                  return (
                    <div key={idx} className="flex items-center gap-4 group">
                      <div className="w-8 shrink-0 text-center">
                        <span className="text-body-base font-bold text-on-surface">{dist.label}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-[11px] text-on-surface-variant mb-1.5 font-mono">
                          <span>{dist.range}%</span>
                          <span className="group-hover:text-primary transition-colors">{dist.count}</span>
                        </div>
                        <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${percentage}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-surface-container border border-outline-variant rounded-xl p-6 fade-in-up fade-in-up-5">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-body-base font-semibold text-on-surface">Top Performers</h2>
              </div>
              <div className="space-y-3">
                {topStudents.length === 0 ? (
                  <p className="text-body-sm text-on-surface-variant py-4 text-center">No performers yet.</p>
                ) : (
                  topStudents.map((student, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-2 rounded-lg hover:bg-surface-container-high transition-colors group cursor-pointer border border-transparent hover:border-outline-variant/50">
                      <div className={`w-8 h-8 flex items-center justify-center font-mono font-bold rounded-full shrink-0 shadow-sm
                        ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 
                          idx === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/30' : 
                          idx === 2 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/30' : 
                          'bg-surface-container-highest text-on-surface-variant border border-outline-variant'}`}
                      >
                        {idx < 3 ? <Award size={16} /> : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-semibold text-on-surface truncate group-hover:text-primary transition-colors">{student.name}</p>
                        <p className="text-[11px] text-on-surface-variant truncate">{student.dept}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-body-base font-bold text-green-400">{student.avg}%</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-surface-container border border-outline-variant rounded-2xl shadow-2xl w-full max-w-md p-6 relative fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-body-base font-bold text-on-surface">Result Details</h2>
              <button onClick={() => setSelectedResult(null)} className="p-1.5 rounded-md hover:bg-surface-container-high text-on-surface-variant transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4 text-body-sm text-on-surface-variant">
              <div>
                <label className="text-[10px] text-outline uppercase tracking-widest font-mono font-bold block mb-1">Exam Title</label>
                <p className="text-body-base font-semibold text-on-surface">{selectedResult.examId?.title || 'Exam'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-outline uppercase tracking-widest font-mono font-bold block mb-1">Subject</label>
                  <p className="text-on-surface font-medium">{selectedResult.examId?.subject || selectedResult.examId?.courseCode || 'General'}</p>
                </div>
                <div>
                  <label className="text-[10px] text-outline uppercase tracking-widest font-mono font-bold block mb-1">Status</label>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-500/10 px-2 py-0.5 rounded inline-block">
                    {selectedResult.status}
                  </span>
                </div>
              </div>

              {role === 'admin' && (
                <div>
                  <label className="text-[10px] text-outline uppercase tracking-widest font-mono font-bold block mb-1">Student</label>
                  <p className="text-on-surface font-medium">{selectedResult.studentId?.name || 'N/A'} ({selectedResult.studentId?.email || 'N/A'})</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-outline uppercase tracking-widest font-mono font-bold block mb-1">Score Obtained</label>
                  <p className="text-on-surface font-semibold text-body-base">{selectedResult.score} / {selectedResult.examId?.totalMarks || 100}</p>
                </div>
                <div>
                  <label className="text-[10px] text-outline uppercase tracking-widest font-mono font-bold block mb-1">Percentage</label>
                  <p className="text-green-400 font-bold text-body-base">
                    {Math.round((selectedResult.score / (selectedResult.examId?.totalMarks || 100)) * 100)}%
                  </p>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-outline uppercase tracking-widest font-mono font-bold block mb-1">Submission Date</label>
                <p className="text-on-surface font-mono">
                  {new Date(selectedResult.submittedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button onClick={() => setSelectedResult(null)} className="btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
