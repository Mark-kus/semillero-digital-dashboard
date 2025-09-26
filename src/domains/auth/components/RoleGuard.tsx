'use client';

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
  showRoleInfo?: boolean;
}

export default function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback,
  showRoleInfo = true 
}: RoleGuardProps) {
  const { state, canAccess } = useAuth();

  // Mostrar loading
  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Verificando permisos...</span>
      </div>
    );
  }

  // Usuario no autenticado
  if (!state.isAuthenticated) {
    return fallback || (
      <div className="text-center py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-center justify-center w-10 h-10 mx-auto bg-yellow-100 rounded-full mb-3">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-yellow-800 mb-1">Autenticación Requerida</h3>
          <p className="text-xs text-yellow-600">
            Debes iniciar sesión para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  // Usuario sin permisos
  if (!canAccess(allowedRoles)) {
    return fallback || (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-center justify-center w-10 h-10 mx-auto bg-red-100 rounded-full mb-3">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-red-800 mb-1">Acceso Restringido</h3>
          <p className="text-xs text-red-600 mb-2">
            No tienes permisos para ver esta sección.
          </p>
          {showRoleInfo && (
            <div className="text-xs text-red-500">
              <p>Tu rol: <span className="font-medium">{state.user?.role}</span></p>
              <p>Roles permitidos: <span className="font-medium">{allowedRoles.join(', ')}</span></p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Usuario autorizado
  return <>{children}</>;
}

// Componentes específicos para roles comunes
export function CoordinatorOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['coordinator']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function TeacherOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['teacher']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function StudentOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['student']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function TeacherAndCoordinator({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['teacher', 'coordinator']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}
