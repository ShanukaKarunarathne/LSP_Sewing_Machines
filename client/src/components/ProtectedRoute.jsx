import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireL2 = false }) => {
  const { isAuthenticated, loading, isL1, isL2 } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Allow L1 users to access /credit even if requireL2=true
  const allowedForL1 = ['/sales', '/credit'];
  if (requireL2 && isL1() && !allowedForL1.includes(location.pathname)) {
    return <Navigate to="/sales" replace />;
  }

  return children;
};

export default ProtectedRoute;
