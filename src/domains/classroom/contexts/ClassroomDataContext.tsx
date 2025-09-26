'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import { 
  ClassroomDataState,
  ClassroomDataAction,
  ClassroomDataContextType,
  ClassroomCourse,
  ClassroomStudent,
  ClassroomAssignment,
  StudentSubmission
} from '../types';
import { 
  adaptDashboardStats,
  adaptStudentProgress,
  adaptCourseData,
  adaptAssignmentData,
  adaptRecentActivity
} from '../adapters/classroomAdapters';

// Estado inicial
const initialState: ClassroomDataState = {
  courses: [],
  students: [],
  assignments: [],
  submissions: [],
  dashboardStats: null,
  studentProgress: [],
  courseData: [],
  assignmentData: [],
  recentActivity: [],
  isLoading: false,
  isLoadingCourses: false,
  isLoadingStudents: false,
  isLoadingAssignments: false,
  isLoadingSubmissions: false,
  error: null,
  selectedCourseId: null,
  dateRange: 'month'
};

// Reducer
function classroomDataReducer(state: ClassroomDataState, action: ClassroomDataAction): ClassroomDataState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, [action.payload.key]: action.payload.value };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_COURSES':
      return { ...state, courses: action.payload };
    case 'SET_STUDENTS':
      return { ...state, students: action.payload };
    case 'SET_ASSIGNMENTS':
      return { ...state, assignments: action.payload };
    case 'SET_SUBMISSIONS':
      return { ...state, submissions: action.payload };
    case 'SET_SELECTED_COURSE':
      return { ...state, selectedCourseId: action.payload };
    case 'SET_DATE_RANGE':
      return { ...state, dateRange: action.payload };
    case 'UPDATE_ADAPTED_DATA':
      return {
        ...state,
        dashboardStats: adaptDashboardStats(state.courses, state.students, state.assignments, state.submissions),
        studentProgress: adaptStudentProgress(state.students, state.courses, state.assignments, state.submissions),
        courseData: adaptCourseData(state.courses, state.students, state.assignments),
        assignmentData: adaptAssignmentData(state.assignments, state.courses, state.submissions, state.students),
        recentActivity: adaptRecentActivity(state.assignments, state.submissions, state.courses, state.students)
      };
    case 'CLEAR_DATA':
      return { ...initialState };
    default:
      return state;
  }
}

const ClassroomDataContext = createContext<ClassroomDataContextType | undefined>(undefined);

// Provider
export function ClassroomDataProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(classroomDataReducer, initialState);
  const { state: authState } = useAuth();

  // Cargar cursos
  const loadCourses = useCallback(async () => {
    if (!authState.isAuthenticated) return;
    
    dispatch({ type: 'SET_LOADING', payload: { key: 'isLoadingCourses', value: true } });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const response = await fetch('/api/classroom/courses');
      
      if (!response.ok) {
        throw new Error('Error al cargar los cursos');
      }
      
      const data = await response.json();
      dispatch({ type: 'SET_COURSES', payload: data.data || [] });
      
    } catch (error) {
      console.error('Error loading courses:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al cargar los cursos' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'isLoadingCourses', value: false } });
    }
  }, [authState.isAuthenticated]);

  // Cargar estudiantes
  const loadStudents = useCallback(async (courseId?: string) => {
    if (!authState.isAuthenticated) return;
    
    dispatch({ type: 'SET_LOADING', payload: { key: 'isLoadingStudents', value: true } });
    
    try {
      const courses = courseId ? [courseId] : state.courses.map(c => c.id);
      const allStudents: ClassroomStudent[] = [];
      
      for (const cId of courses) {
        const response = await fetch(`/api/classroom/students?courseId=${cId}`);
        
        if (response.ok) {
          const data = await response.json();
          allStudents.push(...(data.data || []));
        }
      }
      
      dispatch({ type: 'SET_STUDENTS', payload: allStudents });
      
    } catch (error) {
      console.error('Error loading students:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al cargar los estudiantes' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'isLoadingStudents', value: false } });
    }
  }, [authState.isAuthenticated, state.courses]);

  // Cargar tareas
  const loadAssignments = useCallback(async (courseId?: string) => {
    if (!authState.isAuthenticated) return;
    
    dispatch({ type: 'SET_LOADING', payload: { key: 'isLoadingAssignments', value: true } });
    
    try {
      const courses = courseId ? [courseId] : state.courses.map(c => c.id);
      const allAssignments: ClassroomAssignment[] = [];
      
      for (const cId of courses) {
        const response = await fetch(`/api/classroom/assignments?courseId=${cId}`);
        
        if (response.ok) {
          const data = await response.json();
          allAssignments.push(...(data.data || []));
        }
      }
      
      dispatch({ type: 'SET_ASSIGNMENTS', payload: allAssignments });
      
    } catch (error) {
      console.error('Error loading assignments:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al cargar las tareas' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'isLoadingAssignments', value: false } });
    }
  }, [authState.isAuthenticated, state.courses]);

  // Cargar entregas
  const loadSubmissions = useCallback(async (courseId?: string, assignmentId?: string) => {
    if (!authState.isAuthenticated) return;
    
    dispatch({ type: 'SET_LOADING', payload: { key: 'isLoadingSubmissions', value: true } });
    
    try {
      const allSubmissions: StudentSubmission[] = [];
      
      if (assignmentId && courseId) {
        // Cargar entregas de una tarea específica
        const response = await fetch(`/api/classroom/submissions?courseId=${courseId}&assignmentId=${assignmentId}`);
        
        if (response.ok) {
          const data = await response.json();
          allSubmissions.push(...(data.data || []));
        }
      } else {
        // Cargar entregas de todas las tareas
        const assignments = state.assignments.filter(a => !courseId || a.courseId === courseId);
        
        for (const assignment of assignments) {
          const response = await fetch(`/api/classroom/submissions?courseId=${assignment.courseId}&assignmentId=${assignment.id}`);
          
          if (response.ok) {
            const data = await response.json();
            allSubmissions.push(...(data.data || []));
          }
        }
      }
      
      dispatch({ type: 'SET_SUBMISSIONS', payload: allSubmissions });
      
    } catch (error) {
      console.error('Error loading submissions:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al cargar las entregas' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'isLoadingSubmissions', value: false } });
    }
  }, [authState.isAuthenticated, state.assignments]);

  // Cargar todos los datos de forma secuencial
  const loadAllData = useCallback(async () => {
    if (!authState.isAuthenticated) return;
    
    dispatch({ type: 'SET_LOADING', payload: { key: 'isLoading', value: true } });
    
    try {
      // 1. Cargar cursos primero
      const coursesResponse = await fetch('/api/classroom/courses');
      if (!coursesResponse.ok) {
        throw new Error('Error al cargar los cursos');
      }
      
      const coursesData = await coursesResponse.json();
      const courses = coursesData.data || [];
      dispatch({ type: 'SET_COURSES', payload: courses });
      
      if (courses.length > 0) {
        // 2. Cargar estudiantes y tareas en paralelo
        const courseIds = courses.map((c: ClassroomCourse) => c.id);
        
        const [studentsResults, assignmentsResults] = await Promise.allSettled([
          Promise.all(courseIds.map(async (courseId: string) => {
            try {
              const response = await fetch(`/api/classroom/students?courseId=${courseId}`);
              if (response.ok) {
                const data = await response.json();
                return data.data || [];
              }
              return [];
            } catch {
              return [];
            }
          })),
          Promise.all(courseIds.map(async (courseId: string) => {
            try {
              const response = await fetch(`/api/classroom/assignments?courseId=${courseId}`);
              if (response.ok) {
                const data = await response.json();
                return data.data || [];
              }
              return [];
            } catch {
              return [];
            }
          }))
        ]);
        
        // Procesar resultados
        if (studentsResults.status === 'fulfilled') {
          const allStudents = studentsResults.value.flat();
          dispatch({ type: 'SET_STUDENTS', payload: allStudents });
        }
        
        if (assignmentsResults.status === 'fulfilled') {
          const allAssignments = assignmentsResults.value.flat();
          dispatch({ type: 'SET_ASSIGNMENTS', payload: allAssignments });
        }
      }
    } catch (error) {
      console.error('Error loading all data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al cargar los datos' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'isLoading', value: false } });
    }
  }, [authState.isAuthenticated]);

  // Actualizar datos adaptados cuando cambien los datos raw
  useEffect(() => {
    if (state.courses.length > 0) {
      dispatch({ type: 'UPDATE_ADAPTED_DATA' });
    }
  }, [state.courses, state.students, state.assignments, state.submissions]);

  // Cargar datos cuando el usuario se autentique
  useEffect(() => {
    if (authState.isAuthenticated && !state.courses.length && !state.isLoadingCourses) {
      loadAllData();
    }
  }, [authState.isAuthenticated, state.courses.length, state.isLoadingCourses, loadAllData]);

  // Limpiar datos cuando el usuario se desautentique
  useEffect(() => {
    if (!authState.isAuthenticated) {
      dispatch({ type: 'CLEAR_DATA' });
    }
  }, [authState.isAuthenticated]);

  // Acciones
  const setSelectedCourse = useCallback((courseId: string | null) => {
    dispatch({ type: 'SET_SELECTED_COURSE', payload: courseId });
  }, []);

  const setDateRange = useCallback((range: string) => {
    dispatch({ type: 'SET_DATE_RANGE', payload: range });
  }, []);

  const refreshData = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const value: ClassroomDataContextType = {
    state,
    loadCourses,
    loadStudents,
    loadAssignments,
    loadSubmissions,
    loadAllData,
    setSelectedCourse,
    setDateRange,
    refreshData,
    clearError
  };

  return (
    <ClassroomDataContext.Provider value={value}>
      {children}
    </ClassroomDataContext.Provider>
  );
}

// Hook para usar el contexto
export function useClassroomData() {
  const context = useContext(ClassroomDataContext);
  if (context === undefined) {
    throw new Error('useClassroomData must be used within a ClassroomDataProvider');
  }
  return context;
}
