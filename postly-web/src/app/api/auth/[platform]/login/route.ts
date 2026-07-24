import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ platform: string }> }) {
  // En Next.js 15, on doit `await` les params
  const { platform } = await params;

  // L'URL de base de notre application (pour le callback)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/auth/${platform}/callback`;

  let authUrl = "";

  switch (platform) {
    case "tiktok":
      const tiktokClientId = process.env.TIKTOK_CLIENT_KEY;
      if (!tiktokClientId) return NextResponse.json({ error: "Clé TikTok manquante dans .env" }, { status: 500 });
      // L'API TikTok V2 demande un csrf state, généré aléatoirement
      const csrfState = Math.random().toString(36).substring(7);
      authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${tiktokClientId}&response_type=code&scope=user.info.basic,video.publish&redirect_uri=${encodeURIComponent(redirectUri)}&state=${csrfState}`;
      break;

    case "linkedin":
      const linkedinClientId = process.env.LINKEDIN_CLIENT_ID;
      if (!linkedinClientId) return NextResponse.json({ error: "Clé LinkedIn manquante dans .env" }, { status: 500 });
      authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${linkedinClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=linkedin_auth&scope=w_member_social%20openid%20profile`;
      break;

    case "meta":
      const metaAppId = process.env.META_APP_ID;
      if (!metaAppId) return NextResponse.json({ error: "Clé Meta manquante dans .env" }, { status: 500 });
      authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${metaAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=meta_auth&scope=pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish`;
      break;

    default:
      return NextResponse.json({ error: "Plateforme non reconnue" }, { status: 400 });
  }

  // Rediriger l'utilisateur vers la page de login de la plateforme
  return NextResponse.redirect(authUrl);
}
