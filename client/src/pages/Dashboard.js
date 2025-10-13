// src/pages/Dashboard.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout, isL2User } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>LSP Sewing Machines POS</h1>
        <div className="user-info">
          <div className="user-details">
            <span className="user-name">{user?.full_name}</span>
            <span className={`user-level ${user?.level}`}>
              {user?.level === 'L2' ? 'Manager' : 'Cashier'}
            </span>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome, {user?.full_name}!</h2>
          <p>
            {isL2User 
              ? 'You have full access to all features including inventory management, sales, expenses, and user management.'
              : 'You can create sales, record credit payments, and view reports.'}
          </p>
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-grid">
            <div className="action-card">
              <div className="action-icon">📦</div>
              <h4>Inventory</h4>
              <p>View and manage inventory items</p>
              <button className="action-button">Go to Inventory</button>
            </div>

            <div className="action-card">
              <div className="action-icon">💰</div>
              <h4>New Sale</h4>
              <p>Record a new sale transaction</p>
              <button className="action-button">Create Sale</button>
            </div>

            <div className="action-card">
              <div className="action-icon">💳</div>
              <h4>Credit Payments</h4>
              <p>Record customer credit payments</p>
              <button className="action-button">Record Payment</button>
            </div>

            <div className="action-card">
              <div className="action-icon">📊</div>
              <h4>Expenses</h4>
              <p>Track business expenses</p>
              <button className="action-button">View Expenses</button>
            </div>

            {isL2User && (
              <div className="action-card">
                <div className="action-icon">👥</div>
                <h4>User Management</h4>
                <p>Manage system users</p>
                <button className="action-button">Manage Users</button>
              </div>
            )}

            <div className="action-card">
              <div className="action-icon">📈</div>
              <h4>Reports</h4>
              <p>View sales and financial reports</p>
              <button className="action-button">View Reports</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;