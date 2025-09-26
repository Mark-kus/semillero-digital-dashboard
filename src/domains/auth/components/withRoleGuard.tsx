import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

// HOC para proteger componentes por rol
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[]
) {
  return function ProtectedComponent(props: P) {
    const { state, canAccess } = useAuth();

    if (state.isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!state.isAuthenticated) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600">Debes iniciar sesión para acceder a esta sección.</p>
        </div>
      );
    }

    if (!canAccess(allowedRoles)) {
      return (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">Acceso Restringido</h3>
            <p className="text-red-600">
              No tienes permisos para acceder a esta sección. 
              Contacta al administrador si crees que esto es un error.
            </p>
            <p className="text-sm text-red-500 mt-2">
              Rol actual: <span className="font-medium">{state.user?.role}</span>
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
