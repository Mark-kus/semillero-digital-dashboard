"use client";

import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {
  AcademicCapIcon,
  UserGroupIcon,
  ChartBarIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

import {useAuth} from "../contexts/AuthContext";

export default function LoginPage() {
  const {state, login} = useAuth();
  const router = useRouter();

  // Redirigir al dashboard si ya está autenticado
  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      router.push("/dashboard");
    }
  }, [state.isAuthenticated, state.user, router]);

  // Mostrar loading si está verificando autenticación
  if (state.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-white" />
          <p className="text-lg text-white">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si ya está autenticado, no mostrar nada (se redirigirá)
  if (state.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo y título */}
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white">
              <AcademicCapIcon className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="mb-2 text-4xl font-bold text-white">Semillero Digital</h1>
            <p className="mb-8 text-xl text-blue-100">Dashboard de Gestión Educativa</p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white px-4 py-8 shadow-2xl sm:rounded-lg sm:px-10">
            {/* Descripción */}
            <div className="mb-8 text-center">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Bienvenido</h2>
              <p className="mb-6 text-gray-600">
                Accede con tu cuenta de Google para gestionar cursos, estudiantes y seguimiento
                académico.
              </p>
            </div>

            {/* Características */}
            <div className="mb-8 space-y-4">
              <div className="flex items-center space-x-3">
                <UserGroupIcon className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-700">Gestión de estudiantes y profesores</span>
              </div>
              <div className="flex items-center space-x-3">
                <ChartBarIcon className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-700">Seguimiento de progreso académico</span>
              </div>
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="h-5 w-5 text-purple-500" />
                <span className="text-sm text-gray-700">
                  Integración segura con Google Classroom
                </span>
              </div>
            </div>

            {/* Botón de login */}
            <div>
              <button
                className="flex w-full cursor-pointer items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                disabled={state.isLoading}
                onClick={login}
              >
                {state.isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="currentColor"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="currentColor"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="currentColor"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="currentColor"
                      />
                    </svg>
                    Continuar con Google
                  </>
                )}
              </button>
            </div>

            {/* Error message */}
            {state.error && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600">{state.error}</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                Al continuar, aceptas conectar tu cuenta de Google Classroom
              </p>
            </div>
          </div>
        </div>

        {/* Footer de la página */}
        <div className="mt-12 text-center">
          <p className="text-sm text-blue-100">
            © 2024 Semillero Digital. Dashboard de gestión educativa.
          </p>
        </div>
      </div>
    </div>
  );
}
