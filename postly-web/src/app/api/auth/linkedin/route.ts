import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || "http://localhost:3000/api/auth/linkedin/callback";
  
  if (!clientId) {
    return NextResponse.json({ error: "Configuration LinkedIn manquante dans le fichier .env" }, { status: 500 });
  }

  const scope = "w_member_social r_liteprofile";
  const state = Math.random().toString(36).substring(7); // Pour la sécurité CSRF (à stocker idéalement en session)

  const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;

  return NextResponse.redirect(linkedInAuthUrl);
}
