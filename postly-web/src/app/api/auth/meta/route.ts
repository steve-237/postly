import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.META_CLIENT_ID;
  const redirectUri = process.env.META_REDIRECT_URI || "http://localhost:3000/api/auth/meta/callback";
  
  if (!clientId) {
    return NextResponse.json({ error: "Configuration Meta manquante dans le fichier .env" }, { status: 500 });
  }

  // Permissions nécessaires pour publier sur des Pages Facebook et Instagram pro
  const scope = "pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish";
  const state = Math.random().toString(36).substring(7);

  const metaAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;

  return NextResponse.redirect(metaAuthUrl);
}
