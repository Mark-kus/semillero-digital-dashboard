import {NextRequest, NextResponse} from "next/server";
import {OAuth2Client} from "google-auth-library";
import {google} from "googleapis";

// Configuración OAuth2
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

// Callback para manejar la respuesta de Google OAuth
export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Manejar errores de OAuth
    if (error) {
      console.error("OAuth error:", error, errorDescription);

      const errorUrl = new URL("/auth/error", request.url);

      errorUrl.searchParams.set("error", error);
      errorUrl.searchParams.set("message", errorDescription || "Error durante la autenticación");

      return NextResponse.redirect(errorUrl);
    }

    if (!code) {
      const errorUrl = new URL("/auth/error", request.url);

      errorUrl.searchParams.set("error", "no_code");
      errorUrl.searchParams.set("message", "Código de autorización no encontrado");

      return NextResponse.redirect(errorUrl);
    }

    // Verificar el state para prevenir CSRF
    const storedState = request.cookies.get("oauth_state")?.value;
    let stateData = null;

    try {
      stateData = state ? JSON.parse(state) : null;
    } catch (e) {
      console.error("Invalid state format:", e);
    }

    if (!storedState || !stateData || stateData.state !== storedState) {
      console.error("State mismatch - possible CSRF attack");

      const errorUrl = new URL("/auth/error", request.url);

      errorUrl.searchParams.set("error", "state_mismatch");
      errorUrl.searchParams.set("message", "Error de seguridad. Por favor, intenta de nuevo.");

      return NextResponse.redirect(errorUrl);
    }

    // Intercambiar código por tokens
    const {tokens} = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      throw new Error("No access token received");
    }

    // Configurar el cliente con los tokens
    oauth2Client.setCredentials(tokens);

    // Verificar que el usuario tenga acceso a Google Classroom
    try {
      const classroom = google.classroom({version: "v1", auth: oauth2Client});

      await classroom.courses.list({pageSize: 1});
    } catch (classroomError) {
      console.error("User does not have Classroom access:", classroomError);

      const errorUrl = new URL("/auth/error", request.url);

      errorUrl.searchParams.set("error", "no_classroom_access");
      errorUrl.searchParams.set(
        "message",
        "No tienes acceso a Google Classroom. Contacta a tu administrador.",
      );

      return NextResponse.redirect(errorUrl);
    }

    // Obtener información básica del usuario para validación
    try {
      const oauth2 = google.oauth2({version: "v2", auth: oauth2Client});
      const {data: userInfo} = await oauth2.userinfo.get();

      if (!userInfo.email || !userInfo.verified_email) {
        throw new Error("Email not verified");
      }
    } catch (userError) {
      console.error("Error getting user info:", userError);

      const errorUrl = new URL("/auth/error", request.url);

      errorUrl.searchParams.set("error", "user_info_failed");
      errorUrl.searchParams.set("message", "No se pudo verificar la información del usuario");

      return NextResponse.redirect(errorUrl);
    }

    // Crear respuesta de redirección exitosa
    const returnUrl = stateData.returnUrl || "/dashboard";
    const successUrl = new URL(returnUrl, request.url);

    successUrl.searchParams.set("auth", "success");

    const response = NextResponse.redirect(successUrl);

    // Configurar cookies seguras para los tokens
    const cookieOptions = {
      httpOnly: false, // Permitir acceso desde JavaScript del cliente
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };

    // Guardar access token (1 hora de duración típica)
    response.cookies.set("google_access_token", tokens.access_token, {
      ...cookieOptions,
      maxAge: tokens.expiry_date ? Math.floor((tokens.expiry_date - Date.now()) / 1000) : 3600,
    });

    // Guardar refresh token si está disponible (para renovar el access token)
    if (tokens.refresh_token) {
      response.cookies.set("google_refresh_token", tokens.refresh_token, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60, // 30 días
      });
    }

    // Guardar ID token si está disponible
    if (tokens.id_token) {
      response.cookies.set("google_id_token", tokens.id_token, {
        ...cookieOptions,
        maxAge: 3600, // 1 hora
      });
    }

    // Limpiar el state cookie
    response.cookies.delete("oauth_state");

    return response;
  } catch (error) {
    console.error("Error en callback de autenticación:", error);

    const errorUrl = new URL("/auth/error", request.url);

    errorUrl.searchParams.set("error", "callback_failed");
    errorUrl.searchParams.set("message", "Error interno durante la autenticación");

    return NextResponse.redirect(errorUrl);
  }
}
