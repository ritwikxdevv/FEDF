import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute — wraps a route element with role-based access control.
 *
 * @param {React.ReactNode} children   — The component to render if access is granted.
 * @param {'admin'|'student'|string[]} allowedRoles — Role(s) permitted to access this route.
 * @param {string} [redirectTo]        — Where to redirect on access denial (default: '/login').
 */
export default function ProtectedRoute({ children, allowedRoles, redirectTo = '/login' }) {
  const token = localStorage.getItem('token');
  const role  = localStorage.getItem('role');

  // Not logged in — send to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role — redirect to their own dashboard
  const allowed = Array.isArray(allowedRoles)
    ? allowedRoles.includes(role)
    : role === allowedRoles;

  if (!allowed) {
    const fallback = role === 'admin' ? '/admin' : '/student';
    return <Navigate to={fallback} replace />;
  }

  return children;
}
