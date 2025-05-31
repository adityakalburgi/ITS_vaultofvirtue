
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isFirstLogin, isSessionExpired } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in but hasn't seen guidelines yet
  if (isFirstLogin) {
    return <Navigate to="/guidelines" replace />;
  }

  // If the session is expired, they can't access challenges
  if (isSessionExpired) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
