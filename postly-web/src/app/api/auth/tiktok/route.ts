import { NextResponse } from "next/server";

export async function GET() {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI || "http://localhost:3000/api/auth/tiktok/callback";
  
  if (!clientKey) {
    return NextResponse.json({ error: "Configuration TikTok manquante dans le fichier .env" }, { status: 500 });
  }

  // Permissions pour TikTok : vidéo upload et lecture du profil
  const scope = "user.info.basic,video.upload";
  const state = Math.random().toString(36).substring(7);

  // L'URL d'autorisation officielle de TikTok
  const tiktokAuthUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&response_type=code&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

  return NextResponse.redirect(tiktokAuthUrl);
}
