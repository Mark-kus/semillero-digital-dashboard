// Google Classroom API Integration
// Nota: Requiere instalar: npm install googleapis google-auth-library

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Configuración de la API de Google Classroom
const SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',
  'https://www.googleapis.com/auth/classroom.profile.emails',
];

// Configuración OAuth2
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Inicializar la API de Classroom
const classroom = google.classroom({ version: 'v1', auth: oauth2Client });

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
  courseState: 'ACTIVE' | 'ARCHIVED' | 'PROVISIONED' | 'DECLINED' | 'SUSPENDED';
  alternateLink: string;
}

export interface ClassroomStudent {
  courseId: string;
  userId: string;
  profile: {
    id: string;
    name: {
      givenName: string;
      familyName: string;
      fullName: string;
    };
    emailAddress: string;
    photoUrl?: string;
  };
}

export interface ClassroomTeacher {
  courseId: string;
  userId: string;
  profile: {
    id: string;
    name: {
      givenName: string;
      familyName: string;
      fullName: string;
    };
    emailAddress: string;
    photoUrl?: string;
  };
}

export interface ClassroomAssignment {
  courseId: string;
  id: string;
  title: string;
  description?: string;
  materials?: any[];
  state: 'PUBLISHED' | 'DRAFT' | 'DELETED';
  alternateLink: string;
  creationTime: string;
  updateTime: string;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  dueTime?: {
    hours: number;
    minutes: number;
  };
  maxPoints?: number;
  workType: 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION' | 'MULTIPLE_CHOICE_QUESTION';
}

export interface StudentSubmission {
  courseId: string;
  courseWorkId: string;
  id: string;
  userId: string;
  creationTime: string;
  updateTime: string;
  state: 'NEW' | 'CREATED' | 'TURNED_IN' | 'RETURNED' | 'RECLAIMED_BY_STUDENT';
  late: boolean;
  draftGrade?: number;
  assignedGrade?: number;
  alternateLink: string;
  courseWorkType: 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION' | 'MULTIPLE_CHOICE_QUESTION';
}

export class GoogleClassroomService {
  private auth: OAuth2Client;

  constructor(accessToken?: string) {
    this.auth = oauth2Client;
    if (accessToken) {
      this.auth.setCredentials({ access_token: accessToken });
    }
  }

  // Generar URL de autorización
  getAuthUrl(): string {
    return this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent'
    });
  }

  // Obtener tokens de acceso
  async getTokens(code: string) {
    const { tokens } = await this.auth.getToken(code);
    this.auth.setCredentials(tokens);
    return tokens;
  }

  // Obtener todos los cursos
  async getCourses(): Promise<ClassroomCourse[]> {
    try {
      const response = await classroom.courses.list({
        courseStates: ['ACTIVE'],
        pageSize: 100
      });

      return response.data.courses || [];
    } catch (error) {
      console.error('Error obteniendo cursos:', error);
      throw new Error('No se pudieron obtener los cursos de Classroom');
    }
  }

  // Obtener estudiantes de un curso
  async getStudents(courseId: string): Promise<ClassroomStudent[]> {
    try {
      const response = await classroom.courses.students.list({
        courseId,
        pageSize: 100
      });

      return response.data.students || [];
    } catch (error) {
      console.error('Error obteniendo estudiantes:', error);
      throw new Error('No se pudieron obtener los estudiantes del curso');
    }
  }

  // Obtener profesores de un curso
  async getTeachers(courseId: string): Promise<ClassroomTeacher[]> {
    try {
      const response = await classroom.courses.teachers.list({
        courseId,
        pageSize: 100
      });

      return response.data.teachers || [];
    } catch (error) {
      console.error('Error obteniendo profesores:', error);
      throw new Error('No se pudieron obtener los profesores del curso');
    }
  }

  // Obtener tareas de un curso
  async getAssignments(courseId: string): Promise<ClassroomAssignment[]> {
    try {
      const response = await classroom.courses.courseWork.list({
        courseId,
        courseWorkStates: ['PUBLISHED'],
        pageSize: 100
      });

      return response.data.courseWork || [];
    } catch (error: any) {
      console.error('Error obteniendo tareas:', error);
      
      // Manejar errores específicos
      if (error.code === 403) {
        console.warn(`Sin permisos para ver tareas del curso ${courseId}. Esto es normal para estudiantes.`);
        return []; // Retornar array vacío en lugar de lanzar error
      }
      
      if (error.code === 404) {
        console.warn(`Curso ${courseId} no encontrado`);
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
        pageSize: 100
      });

      return response.data.studentSubmissions || [];
    } catch (error) {
      console.error('Error obteniendo entregas:', error);
      throw new Error('No se pudieron obtener las entregas de la tarea');
    }
  }

  // Obtener todas las entregas de un estudiante en un curso
  async getStudentSubmissions(courseId: string, userId: string): Promise<StudentSubmission[]> {
    try {
      const assignments = await this.getAssignments(courseId);
      const allSubmissions: StudentSubmission[] = [];

      for (const assignment of assignments) {
        const submissions = await classroom.courses.courseWork.studentSubmissions.list({
          courseId,
          courseWorkId: assignment.id,
          userId,
          pageSize: 100
        });

        if (submissions.data.studentSubmissions) {
          allSubmissions.push(...submissions.data.studentSubmissions);
        }
      }

      return allSubmissions;
    } catch (error) {
      console.error('Error obteniendo entregas del estudiante:', error);
      throw new Error('No se pudieron obtener las entregas del estudiante');
    }
  }

  // Obtener estadísticas de un curso
  async getCourseStats(courseId: string) {
    try {
      const [students, assignments] = await Promise.all([
        this.getStudents(courseId),
        this.getAssignments(courseId)
      ]);

      const totalStudents = students.length;
      const totalAssignments = assignments.length;

      // Calcular estadísticas de entregas
      let totalSubmissions = 0;
      let lateSubmissions = 0;
      let gradedSubmissions = 0;

      for (const assignment of assignments) {
        const submissions = await this.getSubmissions(courseId, assignment.id);
        totalSubmissions += submissions.length;
        lateSubmissions += submissions.filter(s => s.late).length;
        gradedSubmissions += submissions.filter(s => s.assignedGrade !== undefined).length;
      }

      return {
        courseId,
        totalStudents,
        totalAssignments,
        totalSubmissions,
        lateSubmissions,
        gradedSubmissions,
        completionRate: totalAssignments > 0 ? (totalSubmissions / (totalStudents * totalAssignments)) * 100 : 0,
        gradingRate: totalSubmissions > 0 ? (gradedSubmissions / totalSubmissions) * 100 : 0
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas del curso:', error);
      throw new Error('No se pudieron obtener las estadísticas del curso');
    }
  }
}

// Instancia singleton del servicio
export const classroomService = new GoogleClassroomService();
