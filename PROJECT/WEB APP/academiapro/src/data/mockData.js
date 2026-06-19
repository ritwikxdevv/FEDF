// ─── Stats ────────────────────────────────────────────────────────────────────
export const adminStats = [
  { label: 'Total Students', value: '14,282', change: '+4.2% increase', icon: 'group', trend: 'up' },
  { label: 'Total Exams',    value: '843',    sub: '12 scheduled for today', icon: 'quiz', trend: 'neutral' },
  { label: 'Submissions',    value: '1.2M',   change: '+18% YoY', icon: 'upload', trend: 'up' },
  { label: 'Active Sessions',value: '1,054',  sub: 'Live monitoring', icon: 'bolt', trend: 'live' },
]

export const studentStats = [
  { label: 'Exams Taken',   value: '12',   change: '+2 this month', icon: 'quiz',    trend: 'up' },
  { label: 'Avg Score',     value: '84%',  change: '+3% vs last term', icon: 'analytics', trend: 'up' },
  { label: 'Rank',          value: '#47',  sub: 'Out of 412 students', icon: 'leaderboard', trend: 'neutral' },
  { label: 'Upcoming',      value: '3',    sub: 'Next: Tomorrow 9am', icon: 'event', trend: 'warn' },
]

// ─── Violations Table ─────────────────────────────────────────────────────────
export const violations = [
  { id: 1, initials: 'AL', name: 'Alex Lindholm',  studentId: '88219', exam: 'Advanced Calculus II',  type: 'Window Switch',   status: 'flagged',   action: 'review' },
  { id: 2, initials: 'MS', name: 'Maya Sharma',    studentId: '99402', exam: 'Molecular Bio 101',     type: 'Audio Detection', status: 'review',    action: 'review' },
  { id: 3, initials: 'JT', name: 'James Taylor',   studentId: '10293', exam: 'Introduction to Law',  type: 'Identity Mismatch',status: 'resolved',  action: 'logs' },
  { id: 4, initials: 'KB', name: 'Kenji Brown',    studentId: '77123', exam: 'Macroeconomics',        type: 'Copy-Paste Block', status: 'flagged',   action: 'review' },
]

// ─── Recent Logs ──────────────────────────────────────────────────────────────
export const recentLogs = [
  { id: 1, dot: 'primary', actor: 'Prof. Miller', text: 'modified Introduction to Physics questions.', time: '2m ago' },
  { id: 2, dot: 'neutral',  actor: 'System',       text: 'automated database backup complete.',          time: '1h ago' },
  { id: 3, dot: 'error',   actor: 'Security',     text: 'High frequency login attempts from 192.168.x.x', time: '3h ago' },
]

// ─── Chart Data ───────────────────────────────────────────────────────────────
export const analyticsChart = [
  { month: 'Jan', participation: 60, success: 40 },
  { month: 'Feb', participation: 75, success: 55 },
  { month: 'Mar', participation: 50, success: 30 },
  { month: 'Apr', participation: 85, success: 65 },
  { month: 'May', participation: 90, success: 70 },
  { month: 'Jun', participation: 65, success: 45 },
  { month: 'Jul', participation: 55, success: 35 },
  { month: 'Aug', participation: 95, success: 80 },
]

// ─── Student Upcoming Exams ───────────────────────────────────────────────────
export const upcomingExams = [
  { id: 1, title: 'Advanced Calculus II',    course: 'MATH 301', date: 'Tomorrow', time: '09:00 AM', duration: '2h', status: 'upcoming' },
  { id: 2, title: 'Organic Chemistry Final', course: 'CHEM 401', date: 'Jun 18',   time: '02:00 PM', duration: '3h', status: 'upcoming' },
  { id: 3, title: 'Ethics in Technology',    course: 'PHIL 210', date: 'Jun 22',   time: '11:00 AM', duration: '1h', status: 'upcoming' },
]

// ─── Student Recent Results ───────────────────────────────────────────────────
export const recentResults = [
  { id: 1, title: 'Linear Algebra Mid-term', course: 'MATH 201', score: 91, grade: 'A',  date: 'Jun 5' },
  { id: 2, title: 'Molecular Biology Quiz',  course: 'BIO 301',  score: 78, grade: 'B+', date: 'Jun 2' },
  { id: 3, title: 'World History Essay',     course: 'HIST 102', score: 85, grade: 'A-', date: 'May 30' },
  { id: 4, title: 'Intro to Economics',      course: 'ECON 101', score: 72, grade: 'B',  date: 'May 25' },
]

// ─── Exam Questions ───────────────────────────────────────────────────────────
export const examQuestions = [
  {
    id: 1,
    type: 'mcq',
    text: 'Which of the following best describes the fundamental theorem of calculus?',
    options: [
      'It relates differentiation and integration as inverse operations.',
      'It provides a method for solving differential equations numerically.',
      'It states that every continuous function has an antiderivative.',
      'It establishes the existence of limits for all continuous functions.',
    ],
    correct: 0,
  },
  {
    id: 2,
    type: 'mcq',
    text: 'Given f(x) = 3x² + 2x − 5, what is f\'(x)?',
    options: ['6x + 2', '3x + 2', '6x² + 2', '6x − 5'],
    correct: 0,
  },
  {
    id: 3,
    type: 'mcq',
    text: 'What is the integral of cos(x) with respect to x?',
    options: ['sin(x) + C', '−sin(x) + C', 'tan(x) + C', '−cos(x) + C'],
    correct: 0,
  },
  {
    id: 4,
    type: 'mcq',
    text: 'Which test is used to determine the convergence of a series whose terms are positive and decreasing?',
    options: ['Integral Test', 'Ratio Test', 'Root Test', 'Comparison Test'],
    correct: 0,
  },
  {
    id: 5,
    type: 'short',
    text: 'Explain the Mean Value Theorem and describe one real-world application.',
    placeholder: 'Write your answer here...',
  },
  {
    id: 6,
    type: 'mcq',
    text: 'What is lim(x→0) sin(x)/x?',
    options: ['1', '0', '∞', 'Undefined'],
    correct: 0,
  },
  {
    id: 7,
    type: 'mcq',
    text: 'Which of the following is a correct statement of L\'Hôpital\'s rule?',
    options: [
      'If lim f(x)/g(x) is 0/0 or ∞/∞, then lim f(x)/g(x) = lim f\'(x)/g\'(x)',
      'The derivative of a quotient is the quotient of the derivatives.',
      'Integration by parts can always replace L\'Hôpital\'s rule.',
      'L\'Hôpital\'s rule applies only to polynomial functions.',
    ],
    correct: 0,
  },
  {
    id: 8,
    type: 'mcq',
    text: 'What is the second derivative of f(x) = e^(2x)?',
    options: ['4e^(2x)', '2e^(2x)', 'e^(2x)', '4xe^(2x)'],
    correct: 0,
  },
]

// ─── Results / Analytics ─────────────────────────────────────────────────────
export const departmentResults = [
  { dept: 'Mathematics',  avgScore: 82, passRate: 91, students: 412, exams: 8 },
  { dept: 'Biology',      avgScore: 77, passRate: 85, students: 328, exams: 6 },
  { dept: 'Chemistry',    avgScore: 74, passRate: 80, students: 295, exams: 7 },
  { dept: 'History',      avgScore: 88, passRate: 95, students: 501, exams: 5 },
  { dept: 'Economics',    avgScore: 79, passRate: 87, students: 380, exams: 6 },
  { dept: 'Physics',      avgScore: 71, passRate: 78, students: 262, exams: 9 },
  { dept: 'Law',          avgScore: 85, passRate: 92, students: 190, exams: 4 },
  { dept: 'Engineering',  avgScore: 76, passRate: 83, students: 445, exams: 10 },
]

export const scoreDistribution = [
  { range: '90-100', count: 320,  label: 'A' },
  { range: '80-89',  count: 580,  label: 'B' },
  { range: '70-79',  count: 410,  label: 'C' },
  { range: '60-69',  count: 230,  label: 'D' },
  { range: '0-59',   count: 110,  label: 'F' },
]

export const topStudents = [
  { rank: 1, name: 'Priya Nair',      dept: 'Mathematics', avg: 97.2, exams: 8 },
  { rank: 2, name: 'Leo Zhang',       dept: 'Engineering', avg: 95.8, exams: 10 },
  { rank: 3, name: 'Sara Al-Rashid',  dept: 'Biology',     avg: 94.1, exams: 6 },
  { rank: 4, name: 'Tom Kovács',      dept: 'Law',         avg: 93.7, exams: 4 },
  { rank: 5, name: 'Amara Diallo',    dept: 'History',     avg: 92.4, exams: 5 },
]
