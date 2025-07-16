/**
 * Protected Route Component for NINETWODASH
 * Handles route protection based on authentication and role requirements
 */

"use client";

import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  allowedRoles = [], 
  requireAuth = true,
  fallback = null 
}) => {
  const { isAuthenticated, isAuthorized, isLoading, role } = useAuth({
    requiredRole,
    requireAuth,
  });

  // Show loading while checking auth
  if (isLoading) {
    return fallback || <LoadingSpinner message="Verificando permissões..." />;
  }

  // Not authenticated and auth is required
  if (requireAuth && !isAuthenticated) {
    return fallback || <LoadingSpinner message="Redirecionando..." />;
  }

  // Check specific role requirement
  if (requiredRole && role !== requiredRole) {
    return fallback || <LoadingSpinner message="Redirecionando..." />;
  }

  // Check allowed roles list
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return fallback || <LoadingSpinner message="Redirecionando..." />;
  }

  // All checks passed, render children
  return children;
};

export default ProtectedRoute;