import { NextRequest, NextResponse } from 'next/server';
import { GoogleClassroomService } from '@/lib/google-classroom';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    
    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId es requerido' },
        { status: 400 }
      );
    }

    // Obtener token de acceso de las cookies
    const accessToken = request.cookies.get('google_access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Token de acceso no encontrado. Por favor, autentícate primero.' },
        { status: 401 }
      );
    }

    // Crear instancia del servicio con el token
    const classroomService = new GoogleClassroomService(accessToken);
    
    // Obtener estadísticas del curso
    const stats = await classroomService.getCourseStats(courseId);
    
    return NextResponse.json({
      success: true,
      data: stats,
      courseId
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener las estadísticas del curso',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
