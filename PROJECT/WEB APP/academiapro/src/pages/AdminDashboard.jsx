import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { 
  Users, 
  Activity, 
  CheckCircle, 
  BarChart3, 
  Plus, 
  Upload, 
  Settings, 
  ChevronRight 
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [analyticsData, resultsData] = await Promise.all([
          apiFetch('/api/analytics').catch(() => null),
          apiFetch('/api/results/all').catch(() => []),
        ]);
        setAnalytics(analyticsData);
        setRecentResults(Array.isArray(resultsData) ? resultsData.slice(0, 4) : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Build stats from analytics API response
  const stats = analytics
    ? [
        { label: 'Total Students', value: String(analytics.totalStudents ?? 0), icon: Users, trend: 'neutral' },
        { label: 'Total Exams', value: String(analytics.totalExams ?? 0), sub: 'All assessments', icon: Activity, trend: 'neutral' },
        { label: 'Average Score', value: `${analytics.averageScore ?? 0}%`, icon: CheckCircle, trend: 'up' },
        { label: 'Pass Percentage', value: `${analytics.passPercentage ?? 0}%`, icon: BarChart3, trend: 'up' },
      ]
    : [];

  // Build activity feed from recent results
  const recentActivity = recentResults.map((r, idx) => ({
    id: r._id || idx,
    user: r.studentId?.name || 'Student',
    action: 'submitted',
    target: r.examId?.title || 'an exam',
    time: r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '',
    type: r.score != null ? 'success' : 'info',
  }));

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

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-surface min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 fade-in-up">
        <div>
          <h1 className="text-headline-md font-semibold text-on-surface">Admin Dashboard</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">Welcome back. Here's what's happening today.</p>
        </div>
      </div>

      {/* Stats Cards */}
      {error && (
        <p className="text-body-sm text-orange-400 bg-orange-900/20 border border-orange-700/40 rounded-md px-sm py-xs">
          Some data could not be loaded. {error}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.length === 0 && !loading ? (
          <div className="col-span-full text-center py-10">
            <p className="text-body-sm text-on-surface-variant">No analytics data available yet.</p>
          </div>
        ) : (
          stats.map((stat, idx) => {
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
                  {stat.trend === 'live' && (
                    <span className="flex items-center gap-1.5 text-label-caps px-2 py-1 rounded-md bg-blue-500/10 text-blue-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Live
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
          })
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-surface-container border border-outline-variant rounded-xl p-6 fade-in-up fade-in-up-3">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-body-base font-semibold text-on-surface">Recent Activity</h2>
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant py-8 text-center">No recent activity to display.</p>
          ) : (
            <div className="space-y-0">
              {recentActivity.map((activity, idx) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="relative mt-1 flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full z-10 relative
                      ${activity.type === 'success' ? 'bg-green-400' : 
                        activity.type === 'warning' ? 'bg-error' : 
                        activity.type === 'info' ? 'bg-primary' : 'bg-outline'}
                    `} />
                    {idx !== recentActivity.length - 1 && (
                      <div className="w-px h-12 bg-outline-variant/50 my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="text-body-sm text-on-surface">
                      <span className="font-semibold text-on-surface">{activity.user}</span>{' '}
                      <span className="text-on-surface-variant">{activity.action}</span>{' '}
                      <span className="font-medium text-on-surface">{activity.target}</span>
                    </p>
                    <p className="text-[11px] font-mono text-outline mt-1.5 tracking-wider uppercase">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-surface-container border border-outline-variant rounded-xl p-6 fade-in-up fade-in-up-4">
          <h2 className="text-body-base font-semibold text-on-surface mb-6">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { label: 'Create New Exam', icon: Plus, sub: 'Setup a new assessment', onClick: () => navigate('/exams') },
              { label: 'Bulk Import', icon: Upload, sub: 'Upload student roster CSV', onClick: () => alert('Bulk import coming soon.') },
              { label: 'System Settings', icon: Settings, sub: 'Manage platform config', onClick: () => navigate('/settings') },
            ].map((action, idx) => {
              const Icon = action.icon;
              return (
                <button key={idx} onClick={action.onClick} className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-surface-container-high border border-transparent hover:border-outline-variant transition-all text-left group">
                  <div className="w-10 h-10 rounded-md bg-surface-container-high group-hover:bg-surface flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                    <Icon size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-body-sm font-semibold text-on-surface">{action.label}</p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">{action.sub}</p>
                  </div>
                  <ChevronRight size={16} className="text-outline group-hover:text-primary transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
