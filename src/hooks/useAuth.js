/**
 * Authentication Hook for NINETWODASH
 * Provides authentication state and role-based access control
 */

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const useAuth = (options = {}) => {
  const { requiredRole, redirectTo = '/login', requireAuth = true } = options;
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }

    // Not authenticated
    if (!session && requireAuth) {
      router.push(redirectTo);
      setIsAuthorized(false);
      setIsLoading(false);
      return;
    }

    // Authenticated but no role requirement
    if (!requiredRole) {
      setIsAuthorized(true);
      setIsLoading(false);
      return;
    }

    // Check role authorization
    if (session?.user?.role === requiredRole) {
      setIsAuthorized(true);
    } else {
      // Redirect based on user role
      if (session?.user?.role === 'admin') {
        router.push('/dashboards');
      } else if (session?.user?.role === 'client') {
        router.push(`/portal/${session.user.clientSlug}`);
      } else {
        router.push('/login');
      }
      setIsAuthorized(false);
    }

    setIsLoading(false);
  }, [session, status, requiredRole, redirectTo, requireAuth, router]);

  return {
    session,
    isAuthenticated: !!session,
    isAuthorized,
    isLoading,
    user: session?.user,
    role: session?.user?.role,
    clientSlug: session?.user?.clientSlug,
    clientId: session?.user?.clientId,
  };
};

/**
 * Check if user can access specific client data
 */
export const useClientAccess = (targetClientSlug) => {
  const { user, role, clientSlug } = useAuth();

  const canAccess = () => {
    // Debug temporário
    console.log('useClientAccess Debug:', {
      user: !!user,
      role,
      clientSlug,
      targetClientSlug
    });

    if (!user) return false;
    
    if (role === 'admin') {
      return true; // Admins can access all clients
    }
    
    if (role === 'client') {
      return clientSlug === targetClientSlug; // Clients can only access their own data
    }
    
    return false;
  };

  return {
    canAccess: canAccess(),
    isAdmin: role === 'admin',
    isClient: role === 'client',
    ownClient: clientSlug === targetClientSlug,
  };
};

/**
 * Role-based access control
 */
export const useRoleAccess = () => {
  const { role } = useAuth();

  return {
    isAdmin: role === 'admin',
    isClient: role === 'client',
    canAccessAdmin: role === 'admin',
    canAccessClient: role === 'client' || role === 'admin',
    canManageUsers: role === 'admin',
    canManageClients: role === 'admin',
    canViewAllClients: role === 'admin',
    canEditClientData: role === 'admin',
  };
};