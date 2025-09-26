'use client';

import { useClassroom } from '../../classroom/hooks/useClassroom';

export function ClassroomStatus() {
  const { isAuthenticated, isLoading, courses } = useClassroom();

  if (isLoading) {
    return (
      <div className="bg-blue-800 rounded-lg p-3">
        <p className="text-xs text-blue-200">
          Verificando conexión...
        </p>
        <div className="flex items-center mt-1">
          <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
          <span className="text-xs text-yellow-300">Conectando</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-blue-800 rounded-lg p-3">
        <p className="text-xs text-blue-200">
          Google Classroom
        </p>
        <div className="flex items-center mt-1">
          <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
          <span className="text-xs text-red-300">Desconectado</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-800 rounded-lg p-3">
      <p className="text-xs text-blue-200">
        Conectado con Google Classroom
      </p>
      <div className="flex items-center mt-1">
        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
        <span className="text-xs text-green-300">
          En línea {courses.length > 0 && `(${courses.length} cursos)`}
        </span>
      </div>
    </div>
  );
}
