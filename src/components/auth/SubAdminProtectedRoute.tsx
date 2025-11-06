import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui/loader/PageLoader';

interface SubAdminProtectedRouteProps {
  children: React.ReactNode;
}

const SubAdminProtectedRoute: React.FC<SubAdminProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isSubAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isSubAdmin) {
    return <Navigate to="/customer/dashboard" replace />;
  }

  return <>{children}</>;
};

export default SubAdminProtectedRoute;
