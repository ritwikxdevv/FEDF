import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MapPin 
} from 'lucide-react';
import { apiFetch } from '../utils/api';

const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export default function SchedulePage() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [examsData, resultsData] = await Promise.all([
          apiFetch('/api/exams').catch(() => []),
          apiFetch('/api/results/my-results').catch(() => []),
        ]);
        setExams(Array.isArray(examsData) ? examsData : []);
        setResults(Array.isArray(resultsData) ? resultsData : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const paddingDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const emptyDays = Array.from({ length: paddingDays });
  
  const isCurrentMonthYear = currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
  const currentDay = today.getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const completedExamIds = new Set(results.map(r => {
    if (r.examId && typeof r.examId === 'object') {
      return r.examId._id;
    }
    return r.examId;
  }));

  const now = new Date();

  // Map exams to scheduleEvents (filtering out completed exams and only showing future ones)
  const scheduleEvents = exams
    .filter(exam => !completedExamIds.has(exam._id) && new Date(exam.startDate) > now)
    .map(exam => {
      const startDate = new Date(exam.startDate);
      const dateStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const timeStr = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      
      // Determine subject color code
      let color = 'bg-primary';
      const subj = (exam.subject || '').toLowerCase();
      if (subj.includes('science') || subj.includes('physics') || subj.includes('chem') || subj.includes('bio')) {
        color = 'bg-green-500';
      } else if (subj.includes('history') || subj.includes('english') || subj.includes('social') || subj.includes('art') || subj.includes('human')) {
        color = 'bg-orange-500';
      } else if (subj.includes('elect') || subj.includes('cs') || subj.includes('code') || subj.includes('comp')) {
        color = 'bg-purple-500';
      }

      return {
        id: exam._id,
        date: dateStr,
        color,
        course: exam.subject || 'General',
        type: 'Exam',
        title: exam.title,
        time: timeStr,
        location: 'Online Platform',
        startDate: startDate
      };
    })
    .sort((a, b) => a.startDate - b.startDate);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 bg-surface min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-body-sm text-on-surface-variant">Loading schedule…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-surface min-h-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 fade-in-up">
        <div>
          <h1 className="text-headline-md font-semibold text-on-surface">Schedule</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">Manage your upcoming exams and assessments.</p>
        </div>
        <button className="btn-primary shadow-sm" disabled>
          <Plus size={18} /> Schedule Exam
        </button>
      </div>

      {error && (
        <p className="text-body-sm text-orange-400 bg-orange-900/20 border border-orange-700/40 rounded-md px-sm py-xs">
          Some data could not be loaded. {error}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar Column */}
        <div className="lg:col-span-1 space-y-6 fade-in-up fade-in-up-1">
          
          {/* Calendar Widget */}
          <div className="bg-surface-container border border-outline-variant rounded-xl p-5 shadow-card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-body-base font-semibold text-on-surface">{currentMonth} {currentYear}</h2>
              <div className="flex gap-1.5">
                <button 
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-md hover:bg-surface-container-high text-on-surface-variant transition-colors border border-transparent hover:border-outline-variant/50"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-md hover:bg-surface-container-high text-on-surface-variant transition-colors border border-transparent hover:border-outline-variant/50"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-3">
              {weekDays.map(day => (
                <div key={day} className="text-[11px] font-mono font-bold text-outline uppercase tracking-widest">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1.5">
              {emptyDays.map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square p-1" />
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = isCurrentMonthYear && day === currentDay;

                // Check if there are any active future/pending exams on this day of currentMonth and currentYear
                const hasExam = exams.some(e => {
                  const examDate = new Date(e.startDate);
                  return !completedExamIds.has(e._id) &&
                         examDate > now &&
                         examDate.getDate() === day &&
                         examDate.getMonth() === currentDate.getMonth() &&
                         examDate.getFullYear() === currentDate.getFullYear();
                });

                return (
                  <div key={day} className="aspect-square flex justify-center items-center">
                    <button 
                      className={`w-full h-full rounded-full flex flex-col items-center justify-center relative text-sm font-medium transition-all
                        ${isToday ? 'bg-primary text-surface shadow-md' : 'text-on-surface hover:bg-surface-container-high border border-transparent hover:border-outline-variant/50'}
                      `}
                    >
                      <span>{day}</span>
                      {hasExam && (
                        <span className={`w-1 h-1 rounded-full absolute bottom-1.5 ${isToday ? 'bg-surface' : 'bg-primary animate-pulse'}`} />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-surface-container border border-outline-variant rounded-xl p-5 shadow-card">
            <h2 className="text-body-sm font-semibold text-on-surface mb-4 uppercase tracking-widest font-mono">Legend</h2>
            <div className="space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(192,193,255,0.4)]" />
                <span className="text-body-sm text-on-surface-variant font-medium">Core Subjects</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                <span className="text-body-sm text-on-surface-variant font-medium">Science & Labs</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                <span className="text-body-sm text-on-surface-variant font-medium">Humanities</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
                <span className="text-body-sm text-on-surface-variant font-medium">Electives</span>
              </div>
            </div>
          </div>
        </div>

        {/* Agenda / Upcoming Exams List */}
        <div className="lg:col-span-2 bg-surface-container border border-outline-variant rounded-xl p-6 fade-in-up fade-in-up-2 shadow-card flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-body-base font-semibold text-on-surface flex items-center gap-2">
              <CalendarIcon size={18} className="text-primary" /> Assigned Exams Agenda
            </h2>
          </div>

          <div className="space-y-4 flex-1">
            {scheduleEvents.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant py-8 text-center">No exams scheduled.</p>
            ) : (
              scheduleEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="p-5 rounded-xl border border-outline-variant/50 hover:border-outline hover:bg-surface-container-high bg-surface-container-low transition-all group flex gap-5 cursor-pointer"
                >
                  {/* Left Date Block */}
                  <div className="w-16 shrink-0 flex flex-col items-center justify-center border-r border-outline-variant/50 pr-5">
                    <span className="text-[11px] font-mono text-primary font-bold uppercase tracking-widest">{event.date.split(' ')[0]}</span>
                    <span className="text-3xl font-bold text-on-surface mt-0.5">{event.date.split(' ')[1]}</span>
                  </div>
                  
                  {/* Main Content */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className={`w-2 h-2 rounded-full ${event.color} shadow-sm`} />
                          <span className="text-[11px] font-mono font-bold text-on-surface-variant tracking-wider uppercase">{event.course}</span>
                          <span className="text-[10px] font-bold bg-surface-container-high text-on-surface px-2 py-0.5 rounded ml-2 shadow-sm border border-outline-variant/30">{event.type}</span>
                        </div>
                        <h3 className="text-body-base font-semibold text-on-surface group-hover:text-primary transition-colors">{event.title}</h3>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-5 mt-4">
                      <div className="flex items-center text-[12px] text-on-surface-variant font-medium">
                        <Clock size={14} className="mr-2 text-outline" /> {event.time}
                      </div>
                      <div className="flex items-center text-[12px] text-on-surface-variant font-medium">
                        <MapPin size={14} className="mr-2 text-outline" /> {event.location}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}