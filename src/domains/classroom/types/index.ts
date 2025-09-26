// Classroom Domain Types
import { 
  ClassroomCourse, 
  ClassroomStudent, 
  ClassroomAssignment, 
  StudentSubmission 
} from '@/lib/google-classroom';

// Re-export Google Classroom types
export type { ClassroomCourse, ClassroomStudent, ClassroomAssignment, StudentSubmission };

// UI Data Types
export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalCourses: number;
  activeCourses: number;
  totalAssignments: number;
  pendingAssignments: number;
  completionRate: number;
  averageGrade: number;
}

export interface StudentProgressData {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  courseId: string;
  courseName: string;
  progress: number;
  status: 'active' | 'inactive' | 'at-risk';
  lastActivity: string;
  assignmentsCompleted: number;
  totalAssignments: number;
  averageGrade: number;
  lateSubmissions: number;
}

export interface CourseData {
  id: string;
  name: string;
  section?: string;
  description?: string;
  studentCount: number;
  assignmentCount: number;
  completionRate: number;
  lastActivity: string;
  status: 'active' | 'archived';
}

export interface AssignmentData {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  courseName: string;
  dueDate?: Date;
  maxPoints?: number;
  submissionCount: number;
  totalStudents: number;
  completionRate: number;
  averageGrade?: number;
  status: 'published' | 'draft';
}

export interface ActivityData {
  id: string;
  type: 'assignment_created' | 'assignment_submitted' | 'grade_posted' | 'student_joined';
  title: string;
  description: string;
  timestamp: Date;
  courseId: string;
  courseName: string;
  userId?: string;
  userName?: string;
}

// Context State Types
export interface ClassroomDataState {
  // Datos raw de la API
  courses: ClassroomCourse[];
  students: ClassroomStudent[];
  assignments: ClassroomAssignment[];
  submissions: StudentSubmission[];
  
  // Datos adaptados para la UI
  dashboardStats: DashboardStats | null;
  studentProgress: StudentProgressData[];
  courseData: CourseData[];
  assignmentData: AssignmentData[];
  recentActivity: ActivityData[];
  
  // Estado de carga
  isLoading: boolean;
  isLoadingCourses: boolean;
  isLoadingStudents: boolean;
  isLoadingAssignments: boolean;
  isLoadingSubmissions: boolean;
  
  // Errores
  error: string | null;
  
  // Filtros
  selectedCourseId: string | null;
  dateRange: string;
}

export type ClassroomDataAction =
  | { type: 'SET_LOADING'; payload: { key: keyof ClassroomDataState; value: boolean } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_COURSES'; payload: ClassroomCourse[] }
  | { type: 'SET_STUDENTS'; payload: ClassroomStudent[] }
  | { type: 'SET_ASSIGNMENTS'; payload: ClassroomAssignment[] }
  | { type: 'SET_SUBMISSIONS'; payload: StudentSubmission[] }
  | { type: 'SET_SELECTED_COURSE'; payload: string | null }
  | { type: 'SET_DATE_RANGE'; payload: string }
  | { type: 'UPDATE_ADAPTED_DATA' }
  | { type: 'CLEAR_DATA' };

export interface ClassroomDataContextType {
  state: ClassroomDataState;
  
  // Acciones de carga de datos
  loadCourses: () => Promise<void>;
  loadStudents: (courseId?: string) => Promise<void>;
  loadAssignments: (courseId?: string) => Promise<void>;
  loadSubmissions: (courseId?: string, assignmentId?: string) => Promise<void>;
  loadAllData: () => Promise<void>;
  
  // Acciones de filtros
  setSelectedCourse: (courseId: string | null) => void;
  setDateRange: (range: string) => void;
  
  // Utilidades
  refreshData: () => Promise<void>;
  clearError: () => void;
}

// Hook Types
export interface CourseStats {
  courseId: string;
  totalStudents: number;
  totalAssignments: number;
  totalSubmissions: number;
  lateSubmissions: number;
  gradedSubmissions: number;
  completionRate: number;
  gradingRate: number;
}

export interface UseClassroomReturn {
  // Estado de autenticación
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Datos
  courses: ClassroomCourse[];
  students: ClassroomStudent[];
  assignments: ClassroomAssignment[];
  courseStats: CourseStats | null;
  
  // Funciones
  authenticate: () => void;
  fetchCourses: () => Promise<void>;
  fetchStudents: (courseId: string) => Promise<void>;
  fetchAssignments: (courseId: string) => Promise<void>;
  fetchCourseStats: (courseId: string) => Promise<void>;
  clearError: () => void;
}
