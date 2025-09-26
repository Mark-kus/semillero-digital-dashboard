import React from "react";

import {useAuth} from "../contexts/AuthContext";
import {UserRole} from "../types";

// HOC para proteger componentes por rol
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[],
) {
  return function ProtectedComponent(props: P) {
    const {state, canAccess} = useAuth();

    if (state.isLoading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      );
    }

    if (!state.isAuthenticated) {
      return (
        <div className="py-12 text-center">
          <p className="text-gray-600">Debes iniciar sesión para acceder a esta sección.</p>
        </div>
      );
    }

    if (!canAccess(allowedRoles)) {
      return (
        <div className="py-12 text-center">
          <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-6">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-red-800">Acceso Restringido</h3>
            <p className="text-red-600">
              No tienes permisos para acceder a esta sección. Contacta al administrador si crees que
              esto es un error.
            </p>
            <p className="mt-2 text-sm text-red-500">
              Rol actual: <span className="font-medium">{state.user?.role}</span>
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
