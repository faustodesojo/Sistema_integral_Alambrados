import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAppContext();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;