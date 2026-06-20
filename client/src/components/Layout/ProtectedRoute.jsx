import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          <span className="mt-4 text-dark-300 font-medium">Loading Finora...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, saving the state of the attempted access route
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user && !user.isAdmin) {
    // Non-admin trying to access admin route
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
