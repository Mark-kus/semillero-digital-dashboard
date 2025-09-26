import {NextRequest, NextResponse} from "next/server";
import {google} from "googleapis";
import {OAuth2Client} from "google-auth-library";

// Configuración OAuth2
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

export async function GET(request: NextRequest) {
  try {
    // Obtener el token de acceso desde las cookies o headers
    const accessToken =
      request.cookies.get("google_access_token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!accessToken) {
      return NextResponse.json({error: "No access token provided"}, {status: 401});
    }

    // Configurar el cliente OAuth con el token
    oauth2Client.setCredentials({access_token: accessToken});

    // Verificar que el token sea válido
    try {
      await oauth2Client.getAccessToken();
    } catch (error) {
      console.error("Token validation failed:", error);

      return NextResponse.json({error: "Invalid or expired token"}, {status: 401});
    }

    // Obtener información del usuario desde Google
    const oauth2 = google.oauth2({version: "v2", auth: oauth2Client});
    const {data: userInfo} = await oauth2.userinfo.get();

    if (!userInfo.email) {
      return NextResponse.json({error: "Unable to retrieve user information"}, {status: 400});
    }

    // Obtener información adicional del perfil desde Google People API
    const people = google.people({version: "v1", auth: oauth2Client});
    let additionalInfo = null;

    const {data: personData} = await people.people.get({
      resourceName: "people/me",
      personFields: "names,emailAddresses,photos",
    });

    additionalInfo = personData;

    // Construir el perfil del usuario
    const profile = {
      id: userInfo.id,
      emailAddress: userInfo.email,
      name: {
        givenName: userInfo.given_name || additionalInfo?.names?.[0]?.givenName || "",
        familyName: userInfo.family_name || additionalInfo?.names?.[0]?.familyName || "",
        fullName: userInfo.name || additionalInfo?.names?.[0]?.displayName || userInfo.email,
      },
      photoUrl: userInfo.picture || additionalInfo?.photos?.[0]?.url,
      verified: userInfo.verified_email || false,
      locale: userInfo.locale || "es",
    };

    // Verificar que el usuario tenga acceso a Google Classroom
    try {
      const classroom = google.classroom({version: "v1", auth: oauth2Client});

      await classroom.courses.list({pageSize: 1});
    } catch (error) {
      console.error("User does not have Classroom access:", error);

      return NextResponse.json(
        {
          error: "User does not have access to Google Classroom",
          details: "Please ensure you have Google Classroom access and the necessary permissions.",
        },
        {status: 403},
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);

    // Manejar diferentes tipos de errores
    if (error instanceof Error) {
      if (error.message.includes("invalid_grant")) {
        return NextResponse.json(
          {error: "Token expired or invalid. Please re-authenticate."},
          {status: 401},
        );
      }

      if (error.message.includes("insufficient_scope")) {
        return NextResponse.json(
          {error: "Insufficient permissions. Please re-authenticate with proper scopes."},
          {status: 403},
        );
      }
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      {status: 500},
    );
  }
}
