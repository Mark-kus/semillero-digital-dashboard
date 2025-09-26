// Google Classroom API Integration
// Nota: Requiere instalar: npm install googleapis google-auth-library

import {google} from "googleapis";
import {OAuth2Client} from "google-auth-library";

// Configuración de la API de Google Classroom
const SCOPES = [
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.rosters.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.students.readonly",
  "https://www.googleapis.com/auth/classroom.student-submissions.students.readonly",
  "https://www.googleapis.com/auth/classroom.profile.emails",
];

// Configuración OAuth2
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

// Inicializar la API de Classroom
const classroom = google.classroom({version: "v1", auth: oauth2Client});

export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  description?: string;
  room?: string;
  ownerId: string;
  creationTime: string;
  updateTime: string;
  enrollmentCode?: string;
  courseState: "ACTIVE" | "ARCHIVED" | "PROVISIONED" | "DECLINED" | "SUSPENDED";
  alternateLink: string;
}

export interface ClassroomStudent {
  courseId?: string | null;
  userId?: string | null;
  profile?: {
    id?: string | null;
    name?: {
      givenName?: string | null;
      familyName?: string | null;
      fullName?: string | null;
    } | null;
    emailAddress?: string | null;
    photoUrl?: string | null;
  } | null;
}

export interface ClassroomTeacher {
  courseId?: string | null;
  userId?: string | null;
  profile?: {
    id?: string | null;
    name?: {
      givenName?: string | null;
      familyName?: string | null;
      fullName?: string | null;
    } | null;
    emailAddress?: string | null;
    photoUrl?: string | null;
  } | null;
}

export interface ClassroomAssignment {
  courseId?: string | null;
  id?: string | null;
  title?: string | null;
  description?: string | null;
  materials?: any[] | null;
  state?: string | null;
  alternateLink?: string | null;
  creationTime?: string | null;
  updateTime?: string | null;
  dueDate?: {
    year?: number | null;
    month?: number | null;
    day?: number | null;
  } | null;
  dueTime?: {
    hours?: number | null;
    minutes?: number | null;
  } | null;
  maxPoints?: number | null;
  workType?: string | null;
}

export interface StudentSubmission {
  courseId?: string | null;
  courseWorkId?: string | null;
  id?: string | null;
  userId?: string | null;
  creationTime?: string | null;
  updateTime?: string | null;
  state?: string | null;
  late?: boolean | null;
  draftGrade?: number | null;
  assignedGrade?: number | null;
  alternateLink?: string | null;
  courseWorkType?: string | null;
}

export class GoogleClassroomService {
  private auth: OAuth2Client;

  constructor(accessToken?: string) {
    this.auth = oauth2Client;
    if (accessToken) {
      this.auth.setCredentials({access_token: accessToken});
    }
  }

  // Generar URL de autorización
  getAuthUrl(): string {
    return this.auth.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent",
    });
  }

  // Obtener tokens de acceso
  async getTokens(code: string) {
    const {tokens} = await this.auth.getToken(code);

    this.auth.setCredentials(tokens);

    return tokens;
  }

  // Obtener todos los cursos con información detallada para determinar roles
  async getCourses(): Promise<any[]> {
    try {
      const response = await classroom.courses.list({
        courseStates: ["ACTIVE"],
        pageSize: 100,
      });

      const courses = response.data.courses || [];
      const detailedCourses = [];

      // Obtener información detallada de cada curso para determinar el rol del usuario
      for (const course of courses) {
        if (!course.id) continue;

        try {
          // Obtener información completa del curso
          const courseDetail = await classroom.courses.get({
            id: course.id,
          });

          // Intentar obtener información de profesores para verificar si el usuario es profesor
          let isTeacher = false;
          let teacherInfo: any[] = [];

          try {
            const teachersResponse = await classroom.courses.teachers.list({
              courseId: course.id,
            });

            teacherInfo = teachersResponse.data.teachers || [];
            // El usuario actual será incluido en la lista de profesores si es profesor
            isTeacher = teacherInfo.length > 0;
          } catch (_teacherError) {
            // Si no puede acceder a la lista de profesores, probablemente no es profesor
            console.error(`No teacher access for course ${course.id}`);
          }

          // Construir objeto de curso con información adicional
          const enhancedCourse = {
            ...courseDetail.data,
            // Agregar campos que indican si es profesor
            teacherFolder: isTeacher ? {id: `teacher_${course.id}`} : null,
            teacherGroupEmail: isTeacher ? `teachers_${course.id}@classroom.google.com` : null,
            teachers: teacherInfo,
            userRole: isTeacher ? "teacher" : "student",
          };

          detailedCourses.push(enhancedCourse);
        } catch (courseError) {
          console.error(`Error getting details for course ${course.id}:`, courseError);
          // Si hay error, incluir el curso básico
          detailedCourses.push(course);
        }
      }

      return detailedCourses;
    } catch (error) {
      console.error("Error obteniendo cursos:", error);
      throw new Error("No se pudieron obtener los cursos de Classroom");
    }
  }

  // Obtener estudiantes de un curso con información detallada
  async getStudents(courseId: string): Promise<ClassroomStudent[]> {
    try {
      const response = await classroom.courses.students.list({
        courseId,
        pageSize: 100,
      });

      return response.data.students || [];
    } catch (error) {
      console.error("Error obteniendo estudiantes:", error);
      throw new Error("No se pudieron obtener los estudiantes del curso");
    }
  }

  // Obtener información detallada de estudiantes con análisis adicional
  async getDetailedStudentInfo(courseId: string): Promise<any> {
    try {
      const students = await this.getStudents(courseId);

      // Analizar la información de cada estudiante
      const detailedStudents = students.map((student: any) => {
        return {
          // Información básica del estudiante
          courseId: student.courseId,
          userId: student.userId,

          // Información del perfil
          profile: {
            id: student.profile?.id,
            emailAddress: student.profile?.emailAddress,
            name: {
              givenName: student.profile?.name?.givenName,
              familyName: student.profile?.name?.familyName,
              fullName: student.profile?.name?.fullName,
            },
            photoUrl: student.profile?.photoUrl,
          },

          // Metadatos adicionales
          joinTime: student.joinTime,

          // Información adicional que puede venir del API
          permissions: student.permissions || [],

          // Análisis del estado del estudiante
          analysis: {
            hasProfilePhoto: !!student.profile?.photoUrl,
            hasCompleteName: !!(
              student.profile?.name?.givenName && student.profile?.name?.familyName
            ),
            emailDomain: student.profile?.emailAddress?.split("@")[1] || "unknown",
          },
        };
      });

      return {
        courseId,
        totalStudents: students.length,
        students: detailedStudents,
        summary: {
          studentsWithPhotos: detailedStudents.filter((s) => s.analysis.hasProfilePhoto).length,
          studentsWithCompleteNames: detailedStudents.filter((s) => s.analysis.hasCompleteName)
            .length,
          emailDomains: [...new Set(detailedStudents.map((s) => s.analysis.emailDomain))],
        },
      };
    } catch (error) {
      console.error("Error obteniendo información detallada de estudiantes:", error);
      throw new Error("No se pudo obtener la información detallada de los estudiantes");
    }
  }

  // Obtener profesores de un curso
  async getTeachers(courseId: string): Promise<ClassroomTeacher[]> {
    try {
      const response = await classroom.courses.teachers.list({
        courseId,
        pageSize: 100,
      });

      return response.data.teachers || [];
    } catch (error) {
      console.error("Error obteniendo profesores:", error);
      throw new Error("No se pudieron obtener los profesores del curso");
    }
  }

  // Obtener tareas de un curso
  async getAssignments(courseId: string): Promise<ClassroomAssignment[]> {
    try {
      const response = await classroom.courses.courseWork.list({
        courseId,
        courseWorkStates: ["PUBLISHED"],
        pageSize: 100,
      });

      return response.data.courseWork || [];
    } catch (error: any) {
      console.error("Error obteniendo tareas:", error);

      // Manejar errores específicos
      if (error.code === 403) {
        return []; // Retornar array vacío en lugar de lanzar error
      }

      if (error.code === 404) {
        return [];
      }

      throw new Error(`No se pudieron obtener las tareas del curso: ${error.message}`);
    }
  }

  // Obtener entregas de una tarea
  async getSubmissions(courseId: string, courseWorkId: string): Promise<StudentSubmission[]> {
    try {
      const response = await classroom.courses.courseWork.studentSubmissions.list({
        courseId,
        courseWorkId,
        pageSize: 100,
      });

      return response.data.studentSubmissions || [];
    } catch (error) {
      console.error("Error obteniendo entregas:", error);
      throw new Error("No se pudieron obtener las entregas de la tarea");
    }
  }

  // Obtener todas las entregas de un estudiante en un curso
  async getStudentSubmissions(courseId: string, userId: string): Promise<StudentSubmission[]> {
    try {
      const assignments = await this.getAssignments(courseId);
      const allSubmissions: StudentSubmission[] = [];

      for (const assignment of assignments) {
        if (!assignment.id) continue;

        const submissions = await classroom.courses.courseWork.studentSubmissions.list({
          courseId,
          courseWorkId: assignment.id,
          userId,
          pageSize: 100,
        });

        if (submissions.data.studentSubmissions) {
          allSubmissions.push(...submissions.data.studentSubmissions);
        }
      }

      return allSubmissions;
    } catch (error) {
      console.error("Error obteniendo entregas del estudiante:", error);
      throw new Error("No se pudieron obtener las entregas del estudiante");
    }
  }

  // Obtener estadísticas de un curso
  async getCourseStats(courseId: string) {
    try {
      const [students, assignments] = await Promise.all([
        this.getStudents(courseId),
        this.getAssignments(courseId),
      ]);

      const totalStudents = students.length;
      const totalAssignments = assignments.length;

      // Calcular estadísticas de entregas
      let totalSubmissions = 0;
      let lateSubmissions = 0;
      let gradedSubmissions = 0;

      for (const assignment of assignments) {
        if (!assignment.id) continue;

        const submissions = await this.getSubmissions(courseId, assignment.id);

        totalSubmissions += submissions.length;
        lateSubmissions += submissions.filter((s) => s.late).length;
        gradedSubmissions += submissions.filter((s) => s.assignedGrade !== undefined).length;
      }

      return {
        courseId,
        totalStudents,
        totalAssignments,
        totalSubmissions,
        lateSubmissions,
        gradedSubmissions,
        completionRate:
          totalAssignments > 0 ? (totalSubmissions / (totalStudents * totalAssignments)) * 100 : 0,
        gradingRate: totalSubmissions > 0 ? (gradedSubmissions / totalSubmissions) * 100 : 0,
      };
    } catch (error) {
      console.error("Error obteniendo estadísticas del curso:", error);
      throw new Error("No se pudieron obtener las estadísticas del curso");
    }
  }
}

// Instancia singleton del servicio
export const classroomService = new GoogleClassroomService();
