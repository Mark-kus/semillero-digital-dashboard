"use client";

import {useClassroom} from "../../classroom/hooks/useClassroom";

export function ClassroomStatus() {
  const {isAuthenticated, isLoading, courses} = useClassroom();

  if (isLoading) {
    return (
      <div className="rounded-lg bg-blue-800 p-3">
        <p className="text-xs text-blue-200">Verificando conexión...</p>
        <div className="mt-1 flex items-center">
          <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
          <span className="text-xs text-yellow-300">Conectando</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg bg-blue-800 p-3">
        <p className="text-xs text-blue-200">Google Classroom</p>
        <div className="mt-1 flex items-center">
          <div className="mr-2 h-2 w-2 rounded-full bg-red-400" />
          <span className="text-xs text-red-300">Desconectado</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-blue-800 p-3">
      <p className="text-xs text-blue-200">Conectado con Google Classroom</p>
      <div className="mt-1 flex items-center">
        <div className="mr-2 h-2 w-2 rounded-full bg-green-400" />
        <span className="text-xs text-green-300">
          En línea {courses.length > 0 && `(${courses.length} cursos)`}
        </span>
      </div>
    </div>
  );
}
