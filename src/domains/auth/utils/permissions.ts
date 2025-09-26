import {UserRole} from "../types";

// Permisos por rol
export const ROLE_PERMISSIONS = {
  coordinator: [
    "view_all_courses",
    "manage_students",
    "manage_teachers",
    "view_reports",
    "export_data",
    "send_communications",
    "manage_settings",
  ],
  teacher: [
    "view_own_courses",
    "manage_own_students",
    "view_student_progress",
    "grade_assignments",
    "send_communications_to_students",
    "view_course_reports",
  ],
  student: [
    "view_own_courses",
    "view_own_progress",
    "submit_assignments",
    "view_grades",
    "receive_communications",
  ],
} as const;

// Determinar rol basado en el perfil de Google Classroom
export function determineUserRole(
  userEmail: string,
  courses: unknown[] = [],
  userProfile?: any,
): UserRole {
  // Lógica para determinar el rol basado en:
  // 1. Dominio del email (ej: admin@escuela.edu = coordinator)
  // 2. Rol en los cursos de Classroom
  // 3. Configuración manual (base de datos)

  // Por ahora, lógica simple basada en el email
  if (userEmail.includes("admin") || userEmail.includes("coordinator")) {
    return "coordinator";
  }

  let isTeacher = false;
  let isStudent = false;

  // Verificar indicadores de profesor en los cursos
  if (courses && courses.length > 0) {
    isTeacher = courses.some((course: any) => {
      // Verificar si es owner del curso
      if (course.ownerId === userProfile?.id || course.ownerId === userEmail) {
        return true;
      }

      // Verificar si tiene teacherFolder (indicador de profesor)
      if (course.teacherFolder) {
        return true;
      }

      // Verificar si está en teacherGroupEmail
      if (course.teacherGroupEmail && course.teacherGroupEmail.includes(userEmail)) {
        return true;
      }

      // Verificar si está en la lista de profesores del curso
      if (course.teachers && Array.isArray(course.teachers)) {
        return course.teachers.some(
          (teacher: any) =>
            teacher.profile?.emailAddress === userEmail || teacher.userId === userProfile?.id,
        );
      }

      // Verificar si el curso tiene userRole definido como teacher
      if (course.userRole === "teacher") {
        return true;
      }

      return false;
    });

    // Verificar si aparece como estudiante en algún curso
    isStudent = courses.some((course: any) => {
      // Si no es owner ni teacher, probablemente es estudiante
      const isNotOwner = course.ownerId !== userProfile?.id && course.ownerId !== userEmail;
      const hasNoTeacherFolder = !course.teacherFolder;
      const isNotInTeachersList = !course.teachers?.some(
        (teacher: any) =>
          teacher.profile?.emailAddress === userEmail || teacher.userId === userProfile?.id,
      );
      const userRoleIsStudent = course.userRole === "student";

      return (isNotOwner && hasNoTeacherFolder && isNotInTeachersList) || userRoleIsStudent;
    });
  }

  // Verificar permisos del usuario (si están disponibles)
  if (userProfile?.permissions) {
    const hasTeacherPermissions = userProfile.permissions.some(
      (permission: any) =>
        permission.permission === "CREATE_COURSE" || permission === "CREATE_COURSE",
    );

    if (hasTeacherPermissions) {
      isTeacher = true;
    }
  }

  // Priorizar rol de profesor sobre estudiante
  // Si es profesor en al menos un curso, el rol es teacher
  if (isTeacher) {
    return "teacher";
  }

  // Si solo es estudiante
  if (isStudent) {
    return "student";
  }

  // Por defecto, es estudiante si no se puede determinar
  return "student";
}
