'use client';

import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';

export default function LoginPage() {
  const { state, login } = useAuth();
  const router = useRouter();

  // Redirigir al dashboard si ya está autenticado
  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      router.push('/dashboard');
    }
  }, [state.isAuthenticated, state.user, router]);

  // Mostrar loading si está verificando autenticación
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Verificando autenticación...</p>
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
            <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center mb-6">
              <AcademicCapIcon className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Semillero Digital
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Dashboard de Gestión Educativa
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10">
            {/* Descripción */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Bienvenido
              </h2>
              <p className="text-gray-600 mb-6">
                Accede con tu cuenta de Google para gestionar cursos, estudiantes y seguimiento académico.
              </p>
            </div>

            {/* Características */}
            <div className="space-y-4 mb-8">
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
                <span className="text-sm text-gray-700">Integración segura con Google Classroom</span>
              </div>
            </div>

            {/* Botón de login */}
            <div>
              <button
                onClick={login}
                disabled={state.isLoading}
                className="w-full flex cursor-pointer justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {state.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Conectando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continuar con Google
                  </>
                )}
              </button>
            </div>

            {/* Error message */}
            {state.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
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
          <p className="text-blue-100 text-sm">
            © 2024 Semillero Digital. Dashboard de gestión educativa.
          </p>
        </div>
      </div>
    </div>
  );
}
