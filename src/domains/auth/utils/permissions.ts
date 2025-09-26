import { UserRole } from '../types';

// Permisos por rol
export const ROLE_PERMISSIONS = {
  coordinator: [
    'view_all_courses',
    'manage_students',
    'manage_teachers',
    'view_reports',
    'export_data',
    'send_communications',
    'manage_settings'
  ],
  teacher: [
    'view_own_courses',
    'manage_own_students',
    'view_student_progress',
    'grade_assignments',
    'send_communications_to_students',
    'view_course_reports'
  ],
  student: [
    'view_own_courses',
    'view_own_progress',
    'submit_assignments',
    'view_grades',
    'receive_communications'
  ]
} as const;

// Determinar rol basado en el perfil de Google Classroom
export function determineUserRole(userEmail: string, courses: unknown[] = []): UserRole {
  // Lógica para determinar el rol basado en:
  // 1. Dominio del email (ej: admin@escuela.edu = coordinator)
  // 2. Rol en los cursos de Classroom
  // 3. Configuración manual (base de datos)
  
  // Por ahora, lógica simple basada en el email
  if (userEmail.includes('admin') || userEmail.includes('coordinator')) {
    return 'coordinator';
  }
  
  // Si tiene cursos como owner/teacher, es teacher
  const isTeacher = courses.some((course: any) => course.ownerId === userEmail);
  if (isTeacher) {
    return 'teacher';
  }
  
  // Por defecto, es estudiante
  return 'student';
}
