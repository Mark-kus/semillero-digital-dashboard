import {NextRequest, NextResponse} from "next/server";

import {GoogleClassroomService} from "@/lib/google-classroom";

export async function GET(request: NextRequest) {
  try {
    // Obtener token de acceso de las cookies
    const accessToken = request.cookies.get("google_access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        {error: "Token de acceso no encontrado. Por favor, autentícate primero."},
        {status: 401},
      );
    }

    // Crear instancia del servicio con el token
    const classroomService = new GoogleClassroomService(accessToken);

    // Obtener cursos
    const courses = await classroomService.getCourses();

    return NextResponse.json({
      success: true,
      data: courses,
      count: courses.length,
    });
  } catch (error) {
    console.error("Error obteniendo cursos:", error);

    return NextResponse.json(
      {
        error: "Error al obtener los cursos de Google Classroom",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      {status: 500},
    );
  }
}
