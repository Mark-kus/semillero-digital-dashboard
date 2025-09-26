import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

// Configuración OAuth2
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function POST(request: NextRequest) {
  try {
    // Obtener el token de acceso desde las cookies o headers
    const accessToken = request.cookies.get('google_access_token')?.value ||
                       request.headers.get('authorization')?.replace('Bearer ', '');

    const refreshToken = request.cookies.get('google_refresh_token')?.value;

    // Revocar el token en Google si existe
    if (accessToken) {
      try {
        oauth2Client.setCredentials({ 
          access_token: accessToken,
          refresh_token: refreshToken 
        });
        
        // Revocar el token de acceso
        await oauth2Client.revokeCredentials();
        console.log('Google tokens revoked successfully');
      } catch (error) {
        console.warn('Failed to revoke Google tokens:', error);
        // No fallar el logout si no se puede revocar el token
      }
    }

    // Crear respuesta de logout exitoso
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Limpiar todas las cookies de autenticación
    response.cookies.delete('google_access_token');
    response.cookies.delete('google_refresh_token');
    response.cookies.delete('google_id_token');
    response.cookies.delete('user_session');
    response.cookies.delete('oauth_state'); // Limpiar también el state de OAuth

    return response;

  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to log out'
    });
  }
}

// También soportar GET para redirección directa
export async function GET(request: NextRequest) {
  try {
    // Llamar al método POST para hacer el logout
    const logoutResponse = await POST(request);
    
    // Crear respuesta de redirección
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('logout', 'success');
    
    const redirectResponse = NextResponse.redirect(redirectUrl);
    
    // Copiar las cookies de eliminación de la respuesta del POST
    const logoutJson = await logoutResponse.json();
    if (logoutJson.success) {
      // Limpiar todas las cookies de autenticación también en la redirección
      redirectResponse.cookies.delete('google_access_token');
      redirectResponse.cookies.delete('google_refresh_token');
      redirectResponse.cookies.delete('google_id_token');
      redirectResponse.cookies.delete('user_session');
      redirectResponse.cookies.delete('oauth_state');
    }
    
    return redirectResponse;
  } catch (error) {
    console.error('Error during GET logout:', error);
    // En caso de error, redirigir con mensaje de error
    const errorUrl = new URL('/', request.url);
    errorUrl.searchParams.set('logout', 'error');
    return NextResponse.redirect(errorUrl);
  }
}
