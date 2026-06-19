import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import {
  Search, Clock, Calendar, BookOpen, PlayCircle,
  Plus, Edit2, Trash2, UserCheck, X, ChevronDown, Trash
} from 'lucide-react';



// ─── Reusable Modal Shell ─────────────────────────────────────────────────────
function Modal({ title, onClose, children, size = 'max-w-lg' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 overflow-y-auto py-8">
      <div className={`bg-surface-container border border-outline-variant rounded-2xl shadow-2xl w-full ${size} p-6 relative fade-in-up my-auto`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-body-base font-bold text-on-surface">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-surface-container-high text-on-surface-variant transition-colors">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Exam Form (Create / Edit Wizard) ────────────────────────────────────────
function ExamForm({ initial, onSave, onClose, students = [] }) {
  const [activeSubTab, setActiveSubTab] = useState('details'); // 'details' | 'questions' | 'assignment'
  const [form, setForm] = useState(initial || {
    title: '', subject: '', description: '', duration: 30, totalMarks: 100,
    startDate: '', endDate: '', isAssignedToAll: false, assignedTo: []
  });
  
  const [questions, setQuestions] = useState(initial?.questions || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAssignMode = (all) => {
    setForm(f => ({ ...f, isAssignedToAll: all, assignedTo: all ? [] : f.assignedTo }));
  };

  const toggleStudent = (studentId) => {
    setForm(f => {
      const isSelected = f.assignedTo.includes(studentId);
      const assignedTo = isSelected
        ? f.assignedTo.filter(id => id !== studentId)
        : [...f.assignedTo, studentId];
      return { ...f, assignedTo };
    });
  };

  const addQuestion = (type) => {
    let newQ = {
      questionText: '',
      questionType: type,
      marks: 5,
      options: [],
      correctAnswer: ''
    };

    if (type === 'mcq') {
      newQ.options = ['', '', '', ''];
      newQ.correctAnswer = '';
    } else if (type === 'true-false') {
      newQ.options = ['True', 'False'];
      newQ.correctAnswer = 'True';
    } else if (type === 'short-answer') {
      newQ.options = [];
      newQ.correctAnswer = '';
    }

    setQuestions(prev => [...prev, newQ]);
  };

  const deleteQuestion = (index) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q));
  };

  const updateQuestionOption = (qIndex, oIndex, value) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i === qIndex) {
        const newOptions = [...q.options];
        newOptions[oIndex] = value;
        
        // Reset correct answer if it is no longer in options
        let correctAnswer = q.correctAnswer;
        return { ...q, options: newOptions, correctAnswer };
      }
      return q;
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Basic validation
    if (!form.title.trim() || !form.subject.trim() || !form.description.trim()) {
      setError('Title, Subject, and Description are required.');
      setSaving(false);
      return;
    }

    if (questions.length === 0) {
      setError('Please add at least one question.');
      setSaving(false);
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setError(`Question #${i + 1} text cannot be empty.`);
        setSaving(false);
        return;
      }
      if (q.questionType === 'mcq' && q.options.some(opt => !opt.trim())) {
        setError(`All options for MCQ Question #${i + 1} must be filled.`);
        setSaving(false);
        return;
      }
      if (!q.correctAnswer.toString().trim()) {
        setError(`Provide a correct answer for Question #${i + 1}.`);
        setSaving(false);
        return;
      }
    }

    try {
      await onSave({
        ...form,
        questions
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save exam.');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-[75vh] max-h-[650px]">
      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-outline-variant/40 pb-4 mb-4 shrink-0">
        <button
          type="button"
          onClick={() => setActiveSubTab('details')}
          className={`px-4 py-2 text-body-sm font-semibold rounded-lg border transition-all ${activeSubTab === 'details' ? 'bg-primary/10 border-primary/30 text-primary' : 'border-transparent text-on-surface-variant hover:bg-surface-container-high'}`}
        >
          1. Basic Info
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('questions')}
          className={`px-4 py-2 text-body-sm font-semibold rounded-lg border transition-all ${activeSubTab === 'questions' ? 'bg-primary/10 border-primary/30 text-primary' : 'border-transparent text-on-surface-variant hover:bg-surface-container-high'}`}
        >
          2. Question Builder ({questions.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('assignment')}
          className={`px-4 py-2 text-body-sm font-semibold rounded-lg border transition-all ${activeSubTab === 'assignment' ? 'bg-primary/10 border-primary/30 text-primary' : 'border-transparent text-on-surface-variant hover:bg-surface-container-high'}`}
        >
          3. Student Assignment
        </button>
      </div>

      {error && <p className="text-body-sm text-red-400 bg-red-900/20 border border-red-700/40 rounded-md px-3 py-2 mb-4 shrink-0">{error}</p>}

      {/* Tab Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto pr-2 min-h-0 space-y-4">
        
        {/* Tab 1: Details */}
        {activeSubTab === 'details' && (
          <div className="space-y-4 fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-label-caps text-on-surface-variant uppercase tracking-widest text-[11px] font-bold">Exam Title</label>
                <input name="title" value={form.title} onChange={handleChange} required className="input-field w-full" placeholder="e.g. CS101 Final Exam" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-caps text-on-surface-variant uppercase tracking-widest text-[11px] font-bold">Subject</label>
                <input name="subject" value={form.subject} onChange={handleChange} required className="input-field w-full" placeholder="e.g. Computer Science" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-label-caps text-on-surface-variant uppercase tracking-widest text-[11px] font-bold">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={3} className="input-field w-full resize-none" placeholder="Provide instructions or description" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-label-caps text-on-surface-variant uppercase tracking-widest text-[11px] font-bold">Duration (Minutes)</label>
                <input name="duration" type="number" min={1} value={form.duration} onChange={handleChange} required className="input-field w-full" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-caps text-on-surface-variant uppercase tracking-widest text-[11px] font-bold">Total Marks</label>
                <input name="totalMarks" type="number" min={1} value={form.totalMarks} onChange={handleChange} required className="input-field w-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-label-caps text-on-surface-variant uppercase tracking-widest text-[11px] font-bold">Start Date & Time</label>
                <input name="startDate" type="datetime-local" value={form.startDate ? form.startDate.slice(0, 16) : ''} onChange={handleChange} required className="input-field w-full" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-caps text-on-surface-variant uppercase tracking-widest text-[11px] font-bold">End Date & Time</label>
                <input name="endDate" type="datetime-local" value={form.endDate ? form.endDate.slice(0, 16) : ''} onChange={handleChange} required className="input-field w-full" />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Question Builder */}
        {activeSubTab === 'questions' && (
          <div className="space-y-6 fade-in-up">
            {/* Add Question Controls */}
            <div className="flex flex-wrap gap-2 items-center bg-surface-container-high/40 p-3.5 border border-outline-variant/60 rounded-xl">
              <span className="text-body-sm font-semibold text-on-surface mr-2">Add Question:</span>
              <button type="button" onClick={() => addQuestion('mcq')} className="flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-lg text-body-sm hover:bg-primary/20 transition-all">
                <Plus size={14} /> MCQ
              </button>
              <button type="button" onClick={() => addQuestion('true-false')} className="flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-lg text-body-sm hover:bg-primary/20 transition-all">
                <Plus size={14} /> True / False
              </button>
              <button type="button" onClick={() => addQuestion('short-answer')} className="flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-lg text-body-sm hover:bg-primary/20 transition-all">
                <Plus size={14} /> Short Answer
              </button>
            </div>

            {/* Questions List */}
            {questions.length === 0 ? (
              <div className="py-12 border border-dashed border-outline-variant/60 rounded-xl text-center">
                <p className="text-body-sm text-on-surface-variant">No questions added yet. Use the buttons above to add questions.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((q, idx) => (
                  <div key={idx} className="bg-surface-container border border-outline-variant rounded-xl p-5 space-y-4 relative">
                    <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
                      <h4 className="text-body-sm font-bold text-primary">Question #{idx + 1} <span className="text-on-surface-variant font-medium text-[11px] uppercase tracking-widest ml-2 bg-surface-container-high px-2 py-0.5 rounded-md">{q.questionType === 'true-false' ? 'True/False' : q.questionType === 'short-answer' ? 'Short Answer' : 'MCQ'}</span></h4>
                      <button type="button" onClick={() => deleteQuestion(idx)} className="text-on-surface-variant hover:text-red-400 p-1.5 rounded-md hover:bg-red-500/10 transition-colors" title="Delete Question">
                        <Trash size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-3 flex flex-col gap-1">
                        <label className="text-[10px] text-on-surface-variant font-mono uppercase tracking-widest font-bold">Question Text</label>
                        <input
                          type="text"
                          value={q.questionText}
                          onChange={(e) => updateQuestion(idx, 'questionText', e.target.value)}
                          placeholder="e.g. What is the capital of France?"
                          className="input-field w-full"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-on-surface-variant font-mono uppercase tracking-widest font-bold">Marks</label>
                        <input
                          type="number"
                          min={1}
                          value={q.marks}
                          onChange={(e) => updateQuestion(idx, 'marks', parseInt(e.target.value) || 1)}
                          className="input-field w-full"
                          required
                        />
                      </div>
                    </div>

                    {/* MCQ Options */}
                    {q.questionType === 'mcq' && (
                      <div className="space-y-3 pl-2 border-l-2 border-primary/20">
                        <label className="text-[10px] text-on-surface-variant font-mono uppercase tracking-widest font-bold">Options & Correct Answer</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex gap-2 items-center">
                              <span className="font-mono text-body-sm text-outline-variant">{String.fromCharCode(65 + oIdx)}.</span>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => updateQuestionOption(idx, oIdx, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                className="input-field w-full py-1.5"
                                required
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-body-sm text-on-surface font-medium">Select Correct Option:</span>
                          <select
                            value={q.correctAnswer}
                            onChange={(e) => updateQuestion(idx, 'correctAnswer', e.target.value)}
                            className="bg-surface-container border border-outline-variant rounded-md py-1 px-3 text-body-sm text-on-surface focus:outline-none focus:border-primary"
                          >
                            <option value="">-- Select Answer --</option>
                            {q.options.map((opt, oIdx) => opt.trim() && (
                              <option key={oIdx} value={opt}>
                                {String.fromCharCode(65 + oIdx)}: {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* True/False Options */}
                    {q.questionType === 'true-false' && (
                      <div className="flex items-center gap-3 pl-2 border-l-2 border-primary/20">
                        <span className="text-body-sm text-on-surface font-medium">Correct Answer:</span>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-1.5 text-body-sm text-on-surface cursor-pointer">
                            <input
                              type="radio"
                              name={`tf-${idx}`}
                              checked={q.correctAnswer === 'True'}
                              onChange={() => updateQuestion(idx, 'correctAnswer', 'True')}
                              className="accent-primary"
                            />
                            True
                          </label>
                          <label className="flex items-center gap-1.5 text-body-sm text-on-surface cursor-pointer">
                            <input
                              type="radio"
                              name={`tf-${idx}`}
                              checked={q.correctAnswer === 'False'}
                              onChange={() => updateQuestion(idx, 'correctAnswer', 'False')}
                              className="accent-primary"
                            />
                            False
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Short Answer (Essay) */}
                    {q.questionType === 'short-answer' && (
                      <div className="flex flex-col gap-1 pl-2 border-l-2 border-primary/20">
                        <label className="text-[10px] text-on-surface-variant font-mono uppercase tracking-widest font-bold">Suggested/Correct Answer Guide</label>
                        <textarea
                          rows={2}
                          value={q.correctAnswer}
                          onChange={(e) => updateQuestion(idx, 'correctAnswer', e.target.value)}
                          placeholder="Provide the key points or correct response for grading reference."
                          className="input-field w-full resize-none py-1.5"
                          required
                        />
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Assignment */}
        {activeSubTab === 'assignment' && (
          <div className="space-y-4 fade-in-up">
            <h3 className="text-body-sm font-semibold text-on-surface">Choose who can access this exam:</h3>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleAssignMode(true)}
                className={`flex-1 py-3 border rounded-xl font-semibold text-body-sm text-center transition-all ${form.isAssignedToAll ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'border-outline-variant text-on-surface-variant hover:border-primary/40'}`}
              >
                Assign to All Students
              </button>
              <button
                type="button"
                onClick={() => handleAssignMode(false)}
                className={`flex-1 py-3 border rounded-xl font-semibold text-body-sm text-center transition-all ${!form.isAssignedToAll ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'border-outline-variant text-on-surface-variant hover:border-primary/40'}`}
              >
                Select Specific Students
              </button>
            </div>

            {!form.isAssignedToAll && (
              <div className="border border-outline-variant/60 rounded-xl overflow-hidden mt-4">
                <div className="bg-surface-container-high/40 p-3 border-b border-outline-variant text-[11px] font-mono uppercase tracking-wider text-on-surface-variant">
                  Select Registered Students
                </div>
                <div className="p-3 max-h-60 overflow-y-auto space-y-2">
                  {students.length === 0 ? (
                    <p className="text-body-sm text-on-surface-variant text-center py-6">No registered students found.</p>
                  ) : (
                    students.map(s => (
                      <label key={s._id} className="flex items-center gap-3 p-2.5 rounded-lg border border-outline-variant/40 hover:border-primary/40 cursor-pointer transition-all">
                        <input
                          type="checkbox"
                          checked={form.assignedTo.includes(s._id)}
                          onChange={() => toggleStudent(s._id)}
                          className="w-4 h-4 accent-primary"
                        />
                        <div>
                          <p className="text-body-sm font-semibold text-on-surface">{s.name}</p>
                          <p className="text-[10px] text-on-surface-variant">{s.email}</p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}

            {form.isAssignedToAll && (
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-body-sm text-on-surface-variant">
                ✓ This exam will be available to <span className="font-bold text-primary">every registered student</span> on the platform.
              </div>
            )}
          </div>
        )}

      </div>

      {/* Form Footer */}
      <div className="border-t border-outline-variant/40 pt-4 mt-4 flex justify-between items-center shrink-0">
        <div className="text-body-sm text-outline-variant font-medium">
          {activeSubTab === 'details' && 'Proceed to Step 2 to add questions'}
          {activeSubTab === 'questions' && 'Proceed to Step 3 to assign students'}
          {activeSubTab === 'assignment' && 'Review details and click Save'}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          
          {activeSubTab !== 'assignment' ? (
            <button
              type="button"
              onClick={() => setActiveSubTab(activeSubTab === 'details' ? 'questions' : 'assignment')}
              className="btn-primary"
            >
              Next Step
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-60"
            >
              {saving ? 'Saving…' : (initial?._id ? 'Update Exam' : 'Save & Publish')}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

// ─── Assign Exam Modal ────────────────────────────────────────────────────────
function AssignModal({ exam, students, onClose, onAssigned }) {
  const [mode, setMode] = useState('select'); // 'select' | 'all'
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleStudent = (id) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  async function handleAssign() {
    setSaving(true);
    setError('');
    try {
      const body = mode === 'all'
        ? { assignToAll: true }
        : { studentIds: selected };
      await apiFetch(`/api/exams/${exam._id}/assign`, { method: 'POST', body: JSON.stringify(body) });
      onAssigned();
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal title={`Assign: ${exam.title}`} onClose={onClose}>
      {error && <p className="text-body-sm text-red-400 bg-red-900/20 border border-red-700/40 rounded-md px-3 py-2 mb-4">{error}</p>}

      {/* Mode Selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('select')}
          className={`flex-1 py-2 rounded-lg text-body-sm font-semibold border transition-all ${mode === 'select' ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant text-on-surface-variant hover:border-primary/40'}`}
        >
          Select Students
        </button>
        <button
          onClick={() => { setMode('all'); setSelected([]); }}
          className={`flex-1 py-2 rounded-lg text-body-sm font-semibold border transition-all ${mode === 'all' ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant text-on-surface-variant hover:border-primary/40'}`}
        >
          All Students
        </button>
      </div>

      {mode === 'select' && (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {students.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant text-center py-6">No registered students yet.</p>
          ) : (
            students.map(s => (
              <label key={s._id} className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant/50 hover:border-primary/40 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={selected.includes(s._id)}
                  onChange={() => toggleStudent(s._id)}
                  className="w-4 h-4 accent-primary"
                />
                <div>
                  <p className="text-body-sm font-semibold text-on-surface">{s.name}</p>
                  <p className="text-[11px] text-on-surface-variant">{s.email}</p>
                </div>
              </label>
            ))
          )}
        </div>
      )}

      {mode === 'all' && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-body-sm text-on-surface">
          This exam will be assigned to <span className="font-bold text-primary">all {students.length} registered students</span>.
        </div>
      )}

      <div className="flex justify-end gap-3 mt-6">
        <button onClick={onClose} className="btn-ghost">Cancel</button>
        <button
          onClick={handleAssign}
          disabled={saving || (mode === 'select' && selected.length === 0)}
          className="btn-primary disabled:opacity-60"
        >
          <UserCheck size={16} />
          {saving ? 'Assigning…' : `Assign${mode === 'select' && selected.length > 0 ? ` (${selected.length})` : ''}`}
        </button>
      </div>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ExamPage() {
  const role = localStorage.getItem('role') || 'student';
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);

  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const promises = [apiFetch('/api/exams').catch(() => [])];
      if (role === 'admin') promises.push(apiFetch('/api/students').catch(() => []));
      const [examsData, studentsData] = await Promise.all(promises);
      setExams(Array.isArray(examsData) ? examsData : []);
      if (role === 'admin') setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Enrich exams with status
  const now = new Date();
  const enrichedExams = exams.map(exam => {
    const start = new Date(exam.startDate);
    const end = new Date(exam.endDate);
    let status = 'upcoming';
    if (now >= start && now <= end) status = 'available';
    else if (now > end) status = 'completed';
    const durationStr = exam.duration >= 60
      ? `${Math.floor(exam.duration / 60)}h${exam.duration % 60 > 0 ? ` ${exam.duration % 60}m` : ''}`
      : `${exam.duration} Mins`;
    return { ...exam, id: exam._id, status, durationStr };
  });

  const filtered = enrichedExams.filter(e =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Admin CRUD handlers
  async function handleCreate(form) {
    setError('');
    setSuccessMsg('');
    try {
      await apiFetch('/api/exams', { method: 'POST', body: JSON.stringify(form) });
      setSuccessMsg('Exam created and published successfully!');
      fetchData();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to create exam.');
      throw err;
    }
  }

  async function handleEdit(form) {
    setError('');
    setSuccessMsg('');
    try {
      await apiFetch(`/api/exams/${editTarget._id}`, { method: 'PUT', body: JSON.stringify(form) });
      setSuccessMsg('Exam updated successfully!');
      fetchData();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to update exam.');
      throw err;
    }
  }

  async function handleDelete(exam) {
    if (!window.confirm(`Delete "${exam.title}"? This cannot be undone.`)) return;
    await apiFetch(`/api/exams/${exam._id}`, { method: 'DELETE' });
    setSuccessMsg('Exam deleted successfully!');
    fetchData();
    setTimeout(() => setSuccessMsg(''), 5000);
  }

  const handleEditClick = async (exam) => {
    try {
      // Fetch dynamic questions for this exam to pre-populate the form
      const questionsData = await apiFetch(`/api/questions/exam/${exam._id}`).catch(() => []);
      setEditTarget({
        ...exam,
        questions: questionsData
      });
    } catch (err) {
      setError('Could not retrieve questions for this exam.');
    }
  };

  if (loading) return (
    <div className="p-6 lg:p-8 bg-surface min-h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-body-sm text-on-surface-variant">Loading exams…</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-surface min-h-full">

      {/* Modals */}
      {showCreate && (
        <Modal title="Create New Exam" onClose={() => setShowCreate(false)} size="max-w-4xl">
          <ExamForm onSave={handleCreate} onClose={() => setShowCreate(false)} students={students} />
        </Modal>
      )}
      {editTarget && (
        <Modal title="Edit Exam" onClose={() => setEditTarget(null)} size="max-w-4xl">
          <ExamForm initial={editTarget} onSave={handleEdit} onClose={() => setEditTarget(null)} students={students} />
        </Modal>
      )}
      {assignTarget && (
        <AssignModal
          exam={assignTarget}
          students={students}
          onClose={() => setAssignTarget(null)}
          onAssigned={fetchData}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 fade-in-up">
        <div>
          <h1 className="text-headline-md font-semibold text-on-surface">
            {role === 'admin' ? 'Exam Management' : 'Examinations'}
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {role === 'admin' ? 'Create, manage and assign exams to students.' : 'Browse and access your assigned assessments.'}
          </p>
        </div>
        {role === 'admin' && (
          <button onClick={() => setShowCreate(true)} className="btn-primary shadow-sm whitespace-nowrap">
            <Plus size={18} /> Create Exam
          </button>
        )}
      </div>

      {error && (
        <p className="text-body-sm text-orange-400 bg-orange-900/20 border border-orange-700/40 rounded-md px-sm py-xs">
          {error}
        </p>
      )}

      {successMsg && (
        <p className="text-body-sm text-green-400 bg-green-900/20 border border-green-700/40 rounded-md px-sm py-xs">
          {successMsg}
        </p>
      )}

      {/* Search */}
      <div className="flex gap-4 fade-in-up fade-in-up-1">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
          <input
            type="text"
            placeholder="Search by exam title or description..."
            className="input-field w-full pl-10 bg-surface-container-low border-outline-variant py-2.5"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Exam Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 fade-in-up fade-in-up-2">
        {filtered.map(exam => (
          <div
            key={exam.id}
            className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden hover:border-primary/40 transition-all flex flex-col group shadow-card"
          >
            <div className={`h-1 w-full ${exam.status === 'available' ? 'bg-primary' : exam.status === 'upcoming' ? 'bg-outline-variant' : 'bg-green-500'}`} />

            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[11px] font-mono font-bold text-primary tracking-wider bg-primary/10 px-2 py-1 rounded-md">
                  {exam.subject || 'GENERAL'}
                </span>
                {exam.status === 'available' && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-500/10 px-2 py-1 rounded flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Available
                  </span>
                )}
                {exam.status === 'completed' && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">Completed</span>
                )}
                {exam.status === 'upcoming' && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-1 rounded">Upcoming</span>
                )}
              </div>

              <h3 className="text-body-base font-semibold text-on-surface leading-snug mb-2 group-hover:text-primary transition-colors">
                {exam.title}
              </h3>
              {exam.description && (
                <p className="text-[12px] text-on-surface-variant mb-4 line-clamp-2">{exam.description}</p>
              )}

              {/* Assignment info for admin */}
              {role === 'admin' && (
                <p className="text-[11px] text-outline mb-3">
                  {exam.isAssignedToAll
                    ? '✓ Assigned to all students'
                    : exam.assignedTo?.length > 0
                      ? `✓ Assigned to ${exam.assignedTo.length} student(s)`
                      : '⚠ Not yet assigned'}
                </p>
              )}

              <div className="space-y-2 mt-auto">
                <div className="flex items-center text-[12px] text-on-surface-variant font-medium">
                  <Calendar size={14} className="mr-2 text-outline" />
                  {new Date(exam.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="flex items-center text-[12px] text-on-surface-variant font-medium">
                  <Clock size={14} className="mr-2 text-outline" /> {exam.durationStr}
                </div>
                <div className="flex items-center text-[12px] text-on-surface-variant font-medium">
                  <BookOpen size={14} className="mr-2 text-outline" /> {exam.questions?.length || 0} Questions
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-outline-variant/50 bg-surface-container-low space-y-2">
              {/* Student actions */}
              {role === 'student' && (
                exam.status === 'available' ? (
                  <button
                    onClick={() => navigate(`/exam?examId=${exam.id}`)}
                    className="btn-primary w-full justify-center py-2 text-body-sm shadow-sm"
                  >
                    <PlayCircle size={18} /> Start Exam
                  </button>
                ) : exam.status === 'completed' ? (
                  <div className="flex justify-between items-center w-full px-2 py-1">
                    <span className="text-body-sm text-on-surface-variant font-medium">Ended</span>
                    <span className="text-body-sm font-bold text-green-400">
                      {new Date(exam.endDate).toLocaleDateString()}
                    </span>
                  </div>
                ) : (
                  <button className="btn-ghost w-full justify-center py-2 opacity-50 cursor-not-allowed" disabled>
                    Not Yet Available
                  </button>
                )
              )}

              {/* Admin actions */}
              {role === 'admin' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setAssignTarget(exam)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-body-sm font-semibold rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-all"
                  >
                    <UserCheck size={15} /> Assign
                  </button>
                  <button
                    onClick={() => handleEditClick(exam)}
                    className="p-2 rounded-lg border border-outline-variant text-on-surface-variant hover:border-primary/40 hover:text-primary transition-all"
                    title="Edit"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(exam)}
                    className="p-2 rounded-lg border border-outline-variant text-on-surface-variant hover:border-red-500/40 hover:text-red-400 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center bg-surface-container-low border border-outline-variant rounded-xl border-dashed">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-4 text-outline-variant">
              <Search size={24} />
            </div>
            <h3 className="text-body-base font-semibold text-on-surface">No exams found</h3>
            <p className="text-body-sm text-on-surface-variant mt-1 max-w-sm mx-auto">
              {role === 'admin'
                ? 'Create your first exam using the button above.'
                : searchTerm
                  ? `No exams match "${searchTerm}".`
                  : 'No exams have been assigned to you yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}