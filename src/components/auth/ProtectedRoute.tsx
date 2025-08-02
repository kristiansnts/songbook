import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from '@tanstack/react-router';
import { authManager, routeGuard, User } from '@/lib/auth-manager';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'pengurus' | 'peserta';
  requireAuth?: boolean;
  fallbackPath?: string;
}

// 🛡️ PROTECTED ROUTE COMPONENT - Following songbanks-v1.1 pattern
export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requireAuth = true,
  fallbackPath = '/sign-in' 
}: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Check authentication first
        if (requireAuth && !authManager.isLoggedIn()) {
          setHasAccess(false);
          setIsLoading(false);
          return;
        }

        // Check role-based access if required
        if (requiredRole) {
          const canAccess = await authManager.hasPermission(requiredRole);
          setHasAccess(canAccess);
        } else if (requireAuth) {
          // Just check if user exists on server
          const user = await authManager.getCurrentUser();
          setHasAccess(!!user);
        } else {
          setHasAccess(true);
        }
      } catch (error) {
        console.error('Access check failed:', error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [requiredRole, requireAuth]);

  // Show loading spinner while checking access
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Redirect if no access
  if (!hasAccess) {
    if (requireAuth && !authManager.isLoggedIn()) {
      return <Navigate to={fallbackPath} replace />;
    }
    
    if (requiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
    
    return <Navigate to={fallbackPath} replace />;
  }

  // Render protected content
  return <>{children}</>;
}

// 🔒 ADMIN ROUTE - Requires pengurus permission
export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRole="pengurus" fallbackPath="/unauthorized">
      {children}
    </ProtectedRoute>
  );
}

// 👤 USER ROUTE - Requires peserta permission
export function UserRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRole="peserta" fallbackPath="/unauthorized">
      {children}
    </ProtectedRoute>
  );
}

// 🔐 AUTH ROUTE - Just requires authentication
export function AuthRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requireAuth={true} fallbackPath="/sign-in">
      {children}
    </ProtectedRoute>
  );
}

// Higher-order component for route protection
export function withProtection(
  Component: React.ComponentType<any>,
  requiredRole?: 'pengurus' | 'peserta',
  requireAuth: boolean = true
) {
  return function ProtectedComponent(props: any) {
    return (
      <ProtectedRoute requiredRole={requiredRole} requireAuth={requireAuth}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// 🚨 Route Guard Hook for programmatic access control
export function useRouteGuard() {
  return {
    requireAdmin: routeGuard.requireAdmin.bind(routeGuard),
    requireUser: routeGuard.requireUser.bind(routeGuard),
    requireAuth: routeGuard.requireAuth.bind(routeGuard),
  };
}