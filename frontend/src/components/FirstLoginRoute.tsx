
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface FirstLoginRouteProps {
  children: React.ReactNode;
}

const FirstLoginRoute = ({ children }: FirstLoginRouteProps) => {
  const { isAuthenticated, isFirstLogin } = useAuth();

  console.log("FirstLoginRoute: isAuthenticated =", isAuthenticated, "isFirstLogin =", isFirstLogin);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but not first login, redirect to challenges
  if (!isFirstLogin) {
    return <Navigate to="/challenges" replace />;
  }

  // If authenticated and first login, show the children (Guidelines page)
  return <>{children}</>;
};

export default FirstLoginRoute;
