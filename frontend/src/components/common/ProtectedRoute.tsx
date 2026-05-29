import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface RouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: RouteProps) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function GuestRoute({ children }: RouteProps) {
  const token = useAuthStore((s) => s.token);
  if (token) return <Navigate to="/todos" replace />;
  return <>{children}</>;
}
