import {
  ClassroomCourse,
  ClassroomStudent,
  ClassroomAssignment,
  StudentSubmission,
  DashboardStats,
  StudentProgressData,
  CourseData,
  AssignmentData,
  ActivityData,
} from "../types";

// Adaptador para estadísticas del dashboard
export function adaptDashboardStats(
  courses: ClassroomCourse[],
  students: ClassroomStudent[],
  assignments: ClassroomAssignment[],
  submissions: StudentSubmission[],
): DashboardStats {
  const activeCourses = courses.filter((course) => course.courseState === "ACTIVE");
  const totalStudents = students.length;
  const activeStudents = students.length; // Todos los estudiantes en cursos activos son considerados activos

  const totalAssignments = assignments.length;
  const completedSubmissions = submissions.filter(
    (sub) => sub.state === "TURNED_IN" || sub.state === "RETURNED",
  ).length;

  const gradedSubmissions = submissions.filter(
    (sub) => sub.assignedGrade !== undefined && sub.assignedGrade !== null,
  );

  const averageGrade =
    gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((sum, sub) => sum + (sub.assignedGrade || 0), 0) /
        gradedSubmissions.length
      : 0;

  const completionRate =
    totalAssignments > 0 && totalStudents > 0
      ? (completedSubmissions / (totalAssignments * totalStudents)) * 100
      : 0;

  return {
    totalStudents,
    activeStudents,
    totalCourses: courses.length,
    activeCourses: activeCourses.length,
    totalAssignments,
    pendingAssignments: totalAssignments - completedSubmissions,
    completionRate: Math.round(completionRate),
    averageGrade: Math.round(averageGrade),
  };
}

// Adaptador para datos de progreso de estudiantes
export function adaptStudentProgress(
  students: ClassroomStudent[],
  courses: ClassroomCourse[],
  assignments: ClassroomAssignment[],
  submissions: StudentSubmission[],
): StudentProgressData[] {
  return students.map((student) => {
    const course = courses.find((c) => c.id === student.courseId);
    const studentAssignments = assignments.filter((a) => a.courseId === student.courseId);
    const studentSubmissions = submissions.filter((s) => s.userId === student.userId);

    const completedSubmissions = studentSubmissions.filter(
      (sub) => sub.state === "TURNED_IN" || sub.state === "RETURNED",
    );

    const lateSubmissions = studentSubmissions.filter((sub) => sub.late);

    const gradedSubmissions = studentSubmissions.filter(
      (sub) => sub.assignedGrade !== undefined && sub.assignedGrade !== null,
    );

    const averageGrade =
      gradedSubmissions.length > 0
        ? gradedSubmissions.reduce((sum, sub) => sum + (sub.assignedGrade || 0), 0) /
          gradedSubmissions.length
        : 0;

    const progress =
      studentAssignments.length > 0
        ? (completedSubmissions.length / studentAssignments.length) * 100
        : 0;

    // Determinar estado del estudiante
    let status: "active" | "inactive" | "at-risk" = "active";

    if (progress < 50 || lateSubmissions.length > 2) {
      status = "at-risk";
    } else if (progress === 0) {
      status = "inactive";
    }

    // Calcular última actividad
    const lastSubmission = studentSubmissions.sort(
      (a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime(),
    )[0];

    const lastActivity = lastSubmission
      ? formatRelativeTime(new Date(lastSubmission.updateTime))
      : "Sin actividad reciente";

    return {
      id: student.userId,
      name: student.profile.name.fullName,
      email: student.profile.emailAddress,
      photoUrl: student.profile.photoUrl,
      courseId: student.courseId,
      courseName: course?.name || "Curso desconocido",
      progress: Math.round(progress),
      status,
      lastActivity,
      assignmentsCompleted: completedSubmissions.length,
      totalAssignments: studentAssignments.length,
      averageGrade: Math.round(averageGrade),
      lateSubmissions: lateSubmissions.length,
    };
  });
}

// Adaptador para datos de cursos
export function adaptCourseData(
  courses: ClassroomCourse[],
  students: ClassroomStudent[],
  assignments: ClassroomAssignment[],
): CourseData[] {
  return courses.map((course) => {
    const courseStudents = students.filter((s) => s.courseId === course.id);
    const courseAssignments = assignments.filter((a) => a.courseId === course.id);

    // Calcular tasa de finalización (esto requeriría datos de submissions)
    const completionRate = 75; // Placeholder - necesitaríamos submissions para calcular esto

    return {
      id: course.id,
      name: course.name,
      section: course.section,
      description: course.description,
      studentCount: courseStudents.length,
      assignmentCount: courseAssignments.length,
      completionRate,
      lastActivity: formatRelativeTime(new Date(course.updateTime)),
      status: course.courseState === "ACTIVE" ? "active" : "archived",
    };
  });
}

// Adaptador para datos de tareas
export function adaptAssignmentData(
  assignments: ClassroomAssignment[],
  courses: ClassroomCourse[],
  submissions: StudentSubmission[],
  students: ClassroomStudent[],
): AssignmentData[] {
  return assignments.map((assignment) => {
    const course = courses.find((c) => c.id === assignment.courseId);
    const assignmentSubmissions = submissions.filter((s) => s.courseWorkId === assignment.id);
    const courseStudents = students.filter((s) => s.courseId === assignment.courseId);

    const completionRate =
      courseStudents.length > 0 ? (assignmentSubmissions.length / courseStudents.length) * 100 : 0;

    const gradedSubmissions = assignmentSubmissions.filter(
      (sub) => sub.assignedGrade !== undefined && sub.assignedGrade !== null,
    );

    const averageGrade =
      gradedSubmissions.length > 0
        ? gradedSubmissions.reduce((sum, sub) => sum + (sub.assignedGrade || 0), 0) /
          gradedSubmissions.length
        : undefined;

    return {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      courseId: assignment.courseId,
      courseName: course?.name || "Curso desconocido",
      dueDate: assignment.dueDate
        ? new Date(assignment.dueDate.year, assignment.dueDate.month - 1, assignment.dueDate.day)
        : undefined,
      maxPoints: assignment.maxPoints,
      submissionCount: assignmentSubmissions.length,
      totalStudents: courseStudents.length,
      completionRate: Math.round(completionRate),
      averageGrade: averageGrade ? Math.round(averageGrade) : undefined,
      status: assignment.state === "PUBLISHED" ? "published" : "draft",
    };
  });
}

// Adaptador para actividad reciente
export function adaptRecentActivity(
  assignments: ClassroomAssignment[],
  submissions: StudentSubmission[],
  courses: ClassroomCourse[],
  students: ClassroomStudent[],
): ActivityData[] {
  const activities: ActivityData[] = [];

  // Actividades de tareas creadas
  assignments.forEach((assignment) => {
    const course = courses.find((c) => c.id === assignment.courseId);

    activities.push({
      id: `assignment_${assignment.id}`,
      type: "assignment_created",
      title: "Nueva tarea asignada",
      description: assignment.title,
      timestamp: new Date(assignment.creationTime),
      courseId: assignment.courseId,
      courseName: course?.name || "Curso desconocido",
    });
  });

  // Actividades de entregas
  submissions.forEach((submission) => {
    const course = courses.find((c) => c.id === submission.courseId);
    const student = students.find((s) => s.userId === submission.userId);

    if (submission.state === "TURNED_IN") {
      activities.push({
        id: `submission_${submission.id}`,
        type: "assignment_submitted",
        title: "Tarea entregada",
        description: `${student?.profile.name.fullName || "Estudiante"} entregó una tarea`,
        timestamp: new Date(submission.updateTime),
        courseId: submission.courseId,
        courseName: course?.name || "Curso desconocido",
        userId: submission.userId,
        userName: student?.profile.name.fullName,
      });
    }
  });

  // Ordenar por fecha más reciente
  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10); // Limitar a las 10 más recientes
}

// Función auxiliar para formatear tiempo relativo
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    return "Hace menos de 1 hora";
  } else if (diffHours < 24) {
    return `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  } else if (diffDays < 7) {
    return `Hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;
  } else {
    return date.toLocaleDateString("es-ES");
  }
}

// Función auxiliar para determinar el color del estado
export function getStatusColor(status: string): string {
  switch (status) {
    case "active":
    case "published":
      return "green";
    case "at-risk":
      return "yellow";
    case "inactive":
    case "draft":
      return "red";
    case "archived":
      return "gray";
    default:
      return "blue";
  }
}
