import {randomBytes} from "crypto";

import {NextRequest, NextResponse} from "next/server";
import {OAuth2Client} from "google-auth-library";

// Configuración OAuth2
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

// Scopes necesarios para Google Classroom
const SCOPES = [
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.rosters.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.me.readonly", // Para ver tareas como profesor
  "https://www.googleapis.com/auth/classroom.coursework.students.readonly", // Para ver tareas de estudiantes
  "https://www.googleapis.com/auth/classroom.student-submissions.me.readonly", // Para ver entregas como profesor
  "https://www.googleapis.com/auth/classroom.student-submissions.students.readonly", // Para ver entregas de estudiantes
  "https://www.googleapis.com/auth/classroom.profile.emails",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
];

// Ruta para iniciar la autenticación con Google
export async function GET(request: NextRequest) {
  try {
    // Generar un state único para prevenir CSRF
    const state = randomBytes(32).toString("hex");

    // Obtener parámetros de la URL
    const {searchParams} = new URL(request.url);
    const returnUrl = searchParams.get("returnUrl") || "/";

    // Generar URL de autorización de Google
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline", // Para obtener refresh token
      scope: SCOPES,
      prompt: "consent", // Forzar pantalla de consentimiento para obtener refresh token
      state: JSON.stringify({state, returnUrl}), // Incluir información del estado
      include_granted_scopes: true, // Incluir scopes ya otorgados
    });

    // Crear respuesta de redirección
    const response = NextResponse.redirect(authUrl);

    // Guardar el state en una cookie para verificar después
    response.cookies.set("oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutos
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error iniciando autenticación:", error);

    // Redirigir a una página de error en lugar de devolver JSON
    const errorUrl = new URL("/auth/error", request.url);

    errorUrl.searchParams.set("error", "auth_init_failed");
    errorUrl.searchParams.set("message", "Error al iniciar la autenticación con Google");

    return NextResponse.redirect(errorUrl);
  }
}
