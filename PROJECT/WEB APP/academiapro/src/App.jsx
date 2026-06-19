import { Routes, Route } from 'react-router-dom';

// Layout component for dashboard pages
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Standalone Pages (No Sidebar)
import Home from './pages/home';
import Login from './pages/login';
import Signup from './pages/signup';
import ExamInterface from './pages/ExamInterface';

// Dashboard Pages (With Sidebar Layout)
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ResultsAnalytics from './pages/ResultsAnalytics';
import ExamPage from './pages/ExamPage';
import SchedulePage from './pages/SchedulePage';
import SettingsPage from './pages/SettingsPage';
import SuspiciousActivities from './pages/SuspiciousActivities';

export default function App() {
  return (
    <div className="dark min-h-screen bg-surface font-sans text-on-surface selection:bg-primary/30">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Student-only: Fullscreen Exam Interface */}
        <Route
          path="/exam"
          element={
            <ProtectedRoute allowedRoles="student">
              <ExamInterface />
            </ProtectedRoute>
          }
        />

        {/* Protected Dashboard Routes (Wrapped in Layout) */}
        <Route element={<Layout />}>
          {/* Admin-only routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/students" element={
            <ProtectedRoute allowedRoles="admin"><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="/results" element={
            <ProtectedRoute allowedRoles="admin"><ResultsAnalytics /></ProtectedRoute>
          } />
          <Route path="/exams" element={
            <ProtectedRoute allowedRoles="admin"><ExamPage /></ProtectedRoute>
          } />
          <Route path="/suspicious" element={
            <ProtectedRoute allowedRoles="admin"><SuspiciousActivities /></ProtectedRoute>
          } />

          {/* Student-only routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles="student"><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="/my-results" element={
            <ProtectedRoute allowedRoles="student"><ResultsAnalytics /></ProtectedRoute>
          } />
          <Route path="/schedule" element={
            <ProtectedRoute allowedRoles="student"><SchedulePage /></ProtectedRoute>
          } />

          {/* Shared routes (both roles) */}
          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['admin', 'student']}><SettingsPage /></ProtectedRoute>
          } />
        </Route>
      </Routes>
    </div>
  );
}
