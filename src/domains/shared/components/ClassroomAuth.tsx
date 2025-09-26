'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import DashboardSkeleton from '../../dashboard/components/DashboardSkeleton';

interface ClassroomAuthProps {
  children: React.ReactNode;
}

export function ClassroomAuth({ children }: ClassroomAuthProps) {
  const { state, login, clearError } = useAuth();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    // Verificar si hay parámetros de autenticación en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    
    if (authStatus === 'success') {
      // Limpiar URL y mostrar mensaje de éxito
      window.history.replaceState({}, document.title, window.location.pathname);
      setShowAuthPrompt(false);
    } else if (authStatus === 'error') {
      // Limpiar URL y mostrar error
      window.history.replaceState({}, document.title, window.location.pathname);
      setShowAuthPrompt(true);
    }
  }, []);

  useEffect(() => {
    if (!state.isAuthenticated && !state.isLoading) {
      setShowAuthPrompt(true);
    } else {
      setShowAuthPrompt(false);
    }
  }, [state.isAuthenticated, state.isLoading]);

  // Mostrar skeleton mientras se carga la autenticación
  if (state.isLoading) {
    return <DashboardSkeleton />;
  }

  if (showAuthPrompt || !state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Conectar con Google Classroom
            </h2>
            
            <p className="mt-2 text-gray-600">
              Para acceder al dashboard de Semillero Digital, necesitas conectar tu cuenta de Google Classroom.
            </p>

            {state.error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error de autenticación</h3>
                    <p className="mt-1 text-sm text-red-700">{state.error}</p>
                    <button
                      onClick={clearError}
                      className="mt-2 text-sm text-red-600 hover:text-red-500 underline cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={login}
                className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Conectar con Google Classroom
              </button>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              <p>
                Al conectar tu cuenta, autorizas a Semillero Digital a acceder a:
              </p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Ver tus cursos de Google Classroom</li>
                <li>Ver estudiantes y profesores</li>
                <li>Ver tareas y entregas</li>
                <li>Ver tu información de perfil</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
