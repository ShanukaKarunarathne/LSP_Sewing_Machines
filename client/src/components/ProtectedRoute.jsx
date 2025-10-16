// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireL2 = false }) => {
  const { isAuthenticated, loading, isL1, isL2 } = useAuth();

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

  // If route requires L2 access and user is L1, redirect to sales
  if (requireL2 && isL1()) {
    return <Navigate to="/sales" replace />;
  }

  return children;
};

export default ProtectedRoute;