import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface AdminGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Admin...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If role-specific restriction is applied
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Receptionist role is restricted to requests and QR
    if (role === 'receptionist') {
      return <Navigate to="/admin/requests" replace />;
    }
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning p-4 rounded-4 shadow-sm">
          <h4 className="fw-bold mb-2">عفواً، لا تملك صلاحية الوصول لهذه الصفحة</h4>
          <p className="mb-0 text-muted">
            دورك الحالي ({role}) لا يتيح لك تعديل هذا القسم. يرجى التواصل مع مالك العيادة.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
