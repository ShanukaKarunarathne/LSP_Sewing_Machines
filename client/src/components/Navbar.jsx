// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isL1 } = useAuth(); // Import isL1
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

   // ... (keep useEffect for online/offline status)
   useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

     // Optional: Periodic ping check
     // ...

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      // clearInterval(intervalId);
    };
  }, []);


  // Filter nav items based on user level
   const navItems = [
     // L2 only links
     ...(user?.level === 'L2' ? [
       { path: '/dashboard', label: 'Dashboard' },
       { path: '/inventory', label: 'Inventory' },
     ] : []),
     // Links accessible by both L1 and L2
     { path: '/sales', label: 'Sales' },
     { path: '/quotations', label: 'Quotations' }, // <-- Add Quotations Link
     { path: '/credit', label: 'Credit' },
     // L2 only link
     ...(user?.level === 'L2' ? [
       { path: '/expenses', label: 'Expenses' },
     ] : [])
   ];


  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* --- Keep Internet Status Bar --- */}
       {!isOnline && (
        <div className="bg-red-500 text-white text-center py-1 text-xs font-medium no-print">
           {/* ... icon and text ... */}
           No Internet Connection
         </div>
      )}

      {/* Main Navbar */}
      <nav className="bg-white shadow-md no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
             <div className="flex items-center">
               <Link to={isL1() ? "/sales" : "/dashboard"} className="text-2xl font-bold text-primary"> {/* Adjust default link */}
                 LSP Inc.
               </Link>
             </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* User Info & Logout */}
             <div className="flex items-center space-x-4">
               {/* ... (user info) ... */}
                <div className="text-sm">
                 <p className="font-semibold text-gray-800">{user?.full_name}</p>
                 <p className="text-xs text-gray-500">
                   {user?.level === 'L2' ? 'Administrator' : 'User'}
                 </p>
               </div>
               <button
                 onClick={logout}
                 className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
               >
                 Logout
               </button>
             </div>
          </div>

          {/* Mobile Navigation */}
           <div className="md:hidden pb-3 space-y-1">
             {navItems.map((item) => (
               <Link
                 key={item.path}
                 to={item.path}
                 className={`block px-3 py-2 rounded-md text-base font-medium ${
                   isActive(item.path)
                     ? 'bg-primary text-white'
                     : 'text-gray-700 hover:bg-gray-100'
                 }`}
               >
                 {item.label}
               </Link>
             ))}
           </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;