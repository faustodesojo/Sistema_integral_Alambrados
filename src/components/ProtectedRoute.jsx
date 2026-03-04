import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';

const ROLE_HOMES = {
  admin: '/admin',
  sales: '/ventas-home',
  warehouse: '/warehouse-orders',
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAppContext();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles specified, check if user's role is permitted
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const home = ROLE_HOMES[user.role] || '/';
    return <Navigate to={home} replace />;
  }

  return children;
};

export default ProtectedRoute;