// Analizador de información de estudiantes
// Basado en la estructura de datos del Google Classroom API

export interface StudentInfo {
  courseId?: string | null;
  userId?: string | null;
  profile?: {
    id?: string | null;
    emailAddress?: string | null;
    name?: {
      givenName?: string | null;
      familyName?: string | null;
      fullName?: string | null;
    } | null;
    photoUrl?: string | null;
  } | null;
  joinTime?: string | null;
  permissions?: any[];
}

export interface StudentAnalysis {
  basicInfo: {
    courseId: string;
    userId: string;
    joinTime: string | null;
  };
  profile: {
    id: string;
    email: string;
    name: {
      given: string;
      family: string;
      full: string;
    };
    photoUrl: string | null;
  };
  analysis: {
    hasProfilePhoto: boolean;
    hasCompleteName: boolean;
    emailDomain: string;
    joinDate: Date | null;
    accountType: "personal" | "institutional" | "unknown";
  };
  permissions: any[];
}

export class StudentAnalyzer {
  /**
   * Analiza la información de un estudiante individual
   */
  static analyzeStudent(student: StudentInfo): StudentAnalysis {
    const email = student.profile?.emailAddress || "";
    const emailDomain = email.split("@")[1] || "unknown";

    return {
      basicInfo: {
        courseId: student.courseId || "unknown",
        userId: student.userId || "unknown",
        joinTime: student.joinTime || null,
      },
      profile: {
        id: student.profile?.id || "unknown",
        email: email,
        name: {
          given: student.profile?.name?.givenName || "",
          family: student.profile?.name?.familyName || "",
          full: student.profile?.name?.fullName || email,
        },
        photoUrl: student.profile?.photoUrl || null,
      },
      analysis: {
        hasProfilePhoto: !!student.profile?.photoUrl,
        hasCompleteName: !!(student.profile?.name?.givenName && student.profile?.name?.familyName),
        emailDomain: emailDomain,
        joinDate: student.joinTime ? new Date(student.joinTime) : null,
        accountType: this.determineAccountType(emailDomain),
      },
      permissions: student.permissions || [],
    };
  }

  /**
   * Analiza una lista de estudiantes y genera estadísticas
   */
  static analyzeStudentList(students: StudentInfo[]) {
    const analyzedStudents = students.map((student) => this.analyzeStudent(student));

    const stats = {
      total: students.length,
      withPhotos: analyzedStudents.filter((s) => s.analysis.hasProfilePhoto).length,
      withCompleteNames: analyzedStudents.filter((s) => s.analysis.hasCompleteName).length,
      emailDomains: [...new Set(analyzedStudents.map((s) => s.analysis.emailDomain))],
      accountTypes: this.getAccountTypeDistribution(analyzedStudents),
      joinDates: analyzedStudents
        .filter((s) => s.analysis.joinDate)
        .map((s) => s.analysis.joinDate!)
        .sort((a, b) => a.getTime() - b.getTime()),
    };

    return {
      students: analyzedStudents,
      statistics: stats,
      summary: this.generateSummary(stats),
    };
  }

  /**
   * Determina el tipo de cuenta basado en el dominio del email
   */
  private static determineAccountType(domain: string): "personal" | "institutional" | "unknown" {
    const personalDomains = ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com"];
    const institutionalIndicators = ["edu", "ac", "school", "colegio", "universidad"];

    if (personalDomains.includes(domain.toLowerCase())) {
      return "personal";
    }

    if (institutionalIndicators.some((indicator) => domain.toLowerCase().includes(indicator))) {
      return "institutional";
    }

    return "unknown";
  }

  /**
   * Obtiene la distribución de tipos de cuenta
   */
  private static getAccountTypeDistribution(students: StudentAnalysis[]) {
    const distribution = {
      personal: 0,
      institutional: 0,
      unknown: 0,
    };

    students.forEach((student) => {
      distribution[student.analysis.accountType]++;
    });

    return distribution;
  }

  /**
   * Genera un resumen legible de las estadísticas
   */
  private static generateSummary(stats: any) {
    return {
      message: `Análisis de ${stats.total} estudiantes completado`,
      highlights: [
        `${stats.withPhotos} estudiantes (${((stats.withPhotos / stats.total) * 100).toFixed(1)}%) tienen foto de perfil`,
        `${stats.withCompleteNames} estudiantes (${((stats.withCompleteNames / stats.total) * 100).toFixed(1)}%) tienen nombre completo`,
        `Se encontraron ${stats.emailDomains.length} dominios de email diferentes`,
        `Cuentas personales: ${stats.accountTypes.personal}, Institucionales: ${stats.accountTypes.institutional}`,
      ],
      recommendations: this.generateRecommendations(stats),
    };
  }

  /**
   * Genera recomendaciones basadas en el análisis
   */
  private static generateRecommendations(stats: any) {
    const recommendations = [];

    if (stats.withPhotos / stats.total < 0.5) {
      recommendations.push(
        "Considerar solicitar a los estudiantes que agreguen una foto de perfil para facilitar la identificación",
      );
    }

    if (stats.withCompleteNames / stats.total < 0.8) {
      recommendations.push(
        "Verificar que los estudiantes tengan sus nombres completos en sus perfiles",
      );
    }

    if (stats.accountTypes.personal > stats.accountTypes.institutional) {
      recommendations.push(
        "La mayoría usa cuentas personales - considerar políticas de uso de cuentas institucionales",
      );
    }

    return recommendations;
  }

  /**
   * Formatea la información de un estudiante para mostrar
   */
  static formatStudentInfo(analysis: StudentAnalysis): string {
    const lines = [
      `📚 Estudiante: ${analysis.profile.name.full}`,
      `📧 Email: ${analysis.profile.email}`,
      `🆔 ID: ${analysis.profile.id}`,
      `📸 Foto: ${analysis.analysis.hasProfilePhoto ? "✅ Sí" : "❌ No"}`,
      `👤 Nombre completo: ${analysis.analysis.hasCompleteName ? "✅ Sí" : "❌ No"}`,
      `🏢 Dominio: ${analysis.analysis.emailDomain}`,
      `📱 Tipo de cuenta: ${analysis.analysis.accountType}`,
      `📅 Fecha de ingreso: ${analysis.analysis.joinDate?.toLocaleDateString("es-ES") || "No disponible"}`,
    ];

    return lines.join("\n");
  }
}
