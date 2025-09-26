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
    
    // Obtener tareas del curso
    const assignments = await classroomService.getAssignments(courseId);
    
    return NextResponse.json({
      success: true,
      data: assignments,
      count: assignments.length,
      courseId
    });
  } catch (error: any) {
    console.error('Error obteniendo tareas:', error);
    
    // Si es un error de permisos, devolver array vacío en lugar de error
    if (error.message?.includes('permission') || error.message?.includes('403')) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Sin permisos para ver las tareas de este curso'
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Error al obtener las tareas de Google Classroom',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
