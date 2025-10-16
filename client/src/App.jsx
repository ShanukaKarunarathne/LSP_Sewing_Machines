// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import GlobalStyles from './components/GlobalStyles';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import SalesPage from './pages/SalesPage';
import ExpensesPage from './pages/ExpensesPage';
import CreditPage from './pages/CreditPage';

// Protected Route Component
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100">
        {children}
      </div>
    </>
  );
};

// App Routes Component
const AppRoutes = () => {
  const { isAuthenticated, isL1, user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            // Redirect based on user level after login
            isL1() ? <Navigate to="/sales" replace /> : <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage />
          )
        }
      />
      
      {/* Sales Page - Accessible by both L1 and L2 */}
      <Route
        path="/sales"
        element={
          <ProtectedRoute>
            <SalesPage />
          </ProtectedRoute>
        }
      />
      
      {/* L2 Only Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireL2={true}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute requireL2={true}>
            <InventoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute requireL2={true}>
            <ExpensesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/credit"
        element={
          <ProtectedRoute requireL2={true}>
            <CreditPage />
          </ProtectedRoute>
        }
      />
      
      {/* Default Routes */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            isL1() ? <Navigate to="/sales" replace /> : <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="*" 
        element={
          isAuthenticated ? (
            isL1() ? <Navigate to="/sales" replace /> : <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
    </Routes>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <GlobalStyles />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;