"use client";

import {useState, useEffect, useCallback} from "react";

import {
  ClassroomCourse,
  ClassroomStudent,
  ClassroomAssignment,
  CourseStats,
  UseClassroomReturn,
} from "../types";

export function useClassroom(): UseClassroomReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [students, setStudents] = useState<ClassroomStudent[]>([]);
  const [assignments, setAssignments] = useState<ClassroomAssignment[]>([]);
  const [courseStats, setCourseStats] = useState<CourseStats | null>(null);

  const checkAuthStatus = useCallback(async () => {
    try {
      // Solo verificar si hay una cookie de token
      const hasToken = document.cookie.includes("google_access_token");

      if (!hasToken) {
        setIsAuthenticated(false);

        return;
      }

      const response = await fetch("/api/classroom/courses");

      if (response.ok) {
        setIsAuthenticated(true);
      } else if (response.status === 401) {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error verificando autenticación:", error);
      setIsAuthenticated(false);
    }
  }, []);

  // Verificar autenticación al cargar solo si es necesario
  useEffect(() => {
    // Solo verificar si no hemos inicializado aún
    const hasToken = document.cookie.includes("google_access_token");

    if (hasToken) {
      checkAuthStatus();
    } else {
      setIsAuthenticated(false);
    }
  }, [checkAuthStatus]);

  const authenticate = useCallback(() => {
    window.location.href = "/api/auth/google";
  }, []);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/classroom/courses");

      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          throw new Error("No autenticado. Por favor, inicia sesión con Google.");
        }
        throw new Error("Error al obtener los cursos");
      }

      const data = await response.json();

      setCourses(data.data || []);
      setIsAuthenticated(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";

      setError(errorMessage);
      console.error("Error obteniendo cursos:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStudents = useCallback(async (courseId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/classroom/students?courseId=${courseId}`);

      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          throw new Error("No autenticado. Por favor, inicia sesión con Google.");
        }
        throw new Error("Error al obtener los estudiantes");
      }

      const data = await response.json();

      setStudents(data.data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";

      setError(errorMessage);
      console.error("Error obteniendo estudiantes:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAssignments = useCallback(async (courseId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/classroom/assignments?courseId=${courseId}`);

      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          throw new Error("No autenticado. Por favor, inicia sesión con Google.");
        }
        throw new Error("Error al obtener las tareas");
      }

      const data = await response.json();

      setAssignments(data.data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";

      setError(errorMessage);
      console.error("Error obteniendo tareas:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCourseStats = useCallback(async (courseId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/classroom/stats?courseId=${courseId}`);

      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          throw new Error("No autenticado. Por favor, inicia sesión con Google.");
        }
        throw new Error("Error al obtener las estadísticas");
      }

      const data = await response.json();

      setCourseStats(data.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";

      setError(errorMessage);
      console.error("Error obteniendo estadísticas:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    error,
    courses,
    students,
    assignments,
    courseStats,
    authenticate,
    fetchCourses,
    fetchStudents,
    fetchAssignments,
    fetchCourseStats,
    clearError,
  };
}
