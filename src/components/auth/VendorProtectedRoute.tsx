import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';

interface VendorProtectedRouteProps {
  children: React.ReactNode;
}

const VendorProtectedRoute: React.FC<VendorProtectedRouteProps> = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, redirect to vendor login
  if (!isAuthenticated) {
    return <Navigate to="/vendor/login" replace />;
  }

  // If authenticated but not a vendor (agent), redirect to vendor login with error
  if (user?.role !== 'agent') {
    // Clear auth data for wrong portal access
    authService.clearAuthData();

    return <Navigate to="/vendor/login" state={{ message: 'This is the Vendor Portal. Please use the correct login portal for your account.' }} replace />;
  }

  // If authenticated and is a vendor, render the protected content
  return <>{children}</>;
};

export default VendorProtectedRoute;