"use client";

import React from "react";

import {useAuth} from "../contexts/AuthContext";
import {UserRole} from "../types";

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
  showRoleInfo = true,
}: RoleGuardProps): React.ReactNode {
  const {state, canAccess} = useAuth();

  // Mostrar loading
  if (state.isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
        <span className="ml-2 text-gray-600">Verificando permisos...</span>
      </div>
    );
  }

  // Usuario no autenticado
  if (!state.isAuthenticated) {
    return (
      fallback || (
        <div className="py-8 text-center">
          <div className="mx-auto max-w-md rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
              <svg
                className="h-5 w-5 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
            <h3 className="mb-1 text-sm font-medium text-yellow-800">Autenticación Requerida</h3>
            <p className="text-xs text-yellow-600">
              Debes iniciar sesión para acceder a esta sección.
            </p>
          </div>
        </div>
      )
    );
  }

  // Usuario sin permisos
  if (!canAccess(allowedRoles)) {
    return (
      fallback || (
        <div className="py-8 text-center">
          <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-5 w-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
            <h3 className="mb-1 text-sm font-medium text-red-800">Acceso Restringido</h3>
            <p className="mb-2 text-xs text-red-600">No tienes permisos para ver esta sección.</p>
            {showRoleInfo && (
              <div className="text-xs text-red-500">
                <p>
                  Tu rol: <span className="font-medium">{state.user?.role}</span>
                </p>
                <p>
                  Roles permitidos: <span className="font-medium">{allowedRoles.join(", ")}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )
    );
  }

  // Usuario autorizado
  return children;
}

// Componentes específicos para roles comunes
export function CoordinatorOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["coordinator"]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function TeacherOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["teacher"]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function StudentOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["student"]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function TeacherAndCoordinator({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["teacher", "coordinator"]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}
