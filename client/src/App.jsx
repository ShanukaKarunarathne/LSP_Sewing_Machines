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
import QuotationsPage from './pages/QuotationsPage'; // <-- Import QuotationsPage

// Protected Route Component (keep as is)
const ProtectedRoute = ({ children, requireL2 = false }) => {
  // ... (keep existing code)
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

  // Allow L1 for Sales, Credit, and Quotations (NEW)
  const allowedForL1 = ['/sales', '/credit', '/quotations']; // Add /quotations here
  if (requireL2 && isL1() && !allowedForL1.includes(location.pathname)) {
    return <Navigate to="/sales" replace />; // Or maybe redirect L1 from restricted pages?
  }


  return (
    <>
      <Navbar />
      <div className="pt-4 pb-8"> {/* Add some padding */}
         {children}
       </div>
    </>
  );
};


// App Routes Component
const AppRoutes = () => {
  const { isAuthenticated, isL1 } = useAuth(); // Removed unused 'user' variable

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            isL1() ? <Navigate to="/sales" replace /> : <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Sales Page - Accessible by both L1 and L2 */}
      <Route
        path="/sales"
        element={<ProtectedRoute><SalesPage /></ProtectedRoute>}
      />

       {/* Credit Page - Accessible by both L1 and L2 */}
       <Route
         path="/credit"
         element={<ProtectedRoute><CreditPage /></ProtectedRoute>}
       />

      {/* Quotations Page - Accessible by both L1 and L2 */}
      <Route
        path="/quotations"
        element={<ProtectedRoute><QuotationsPage /></ProtectedRoute>}
      />

      {/* L2 Only Routes */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute requireL2={true}><DashboardPage /></ProtectedRoute>}
      />
      <Route
        path="/inventory"
        element={<ProtectedRoute requireL2={true}><InventoryPage /></ProtectedRoute>}
      />
      <Route
        path="/expenses"
        element={<ProtectedRoute requireL2={true}><ExpensesPage /></ProtectedRoute>}
      />

      {/* Default Routes (keep as is) */}
      <Route
        path="/"
        element={ isAuthenticated ? (isL1() ? <Navigate to="/sales" replace /> : <Navigate to="/dashboard" replace />) : (<Navigate to="/login" replace />)}
      />
      <Route
        path="*"
        element={ isAuthenticated ? (isL1() ? <Navigate to="/sales" replace /> : <Navigate to="/dashboard" replace />) : (<Navigate to="/login" replace />)}
      />
    </Routes>
  );
};

// Main App Component (keep as is)
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