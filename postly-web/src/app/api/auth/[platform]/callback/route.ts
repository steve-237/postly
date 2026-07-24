import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/accounts?error=" + error, request.url));
  }

  if (!code) {
    return NextResponse.json({ error: "Code d'autorisation manquant" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/auth/${platform}/callback`;

  try {
    let accessToken = "";
    let providerAccountId = "unknown";
    
    // --- Échange du code contre un Access Token ---
    switch (platform) {
      case "tiktok":
        // Requête à l'API TikTok V2
        const tkRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_key: process.env.TIKTOK_CLIENT_KEY!,
            client_secret: process.env.TIKTOK_CLIENT_SECRET!,
            code,
            grant_type: "authorization_code",
            redirect_uri: redirectUri
          })
        });
        const tkData = await tkRes.json();
        if (tkData.error) throw new Error(tkData.error_description || "Erreur TikTok");
        accessToken = tkData.access_token;
        providerAccountId = tkData.open_id; // Identifiant unique utilisateur TikTok
        break;

      case "linkedin":
        const liRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectUri,
            client_id: process.env.LINKEDIN_CLIENT_ID!,
            client_secret: process.env.LINKEDIN_CLIENT_SECRET!
          })
        });
        const liData = await liRes.json();
        if (liData.error) throw new Error(liData.error_description || "Erreur LinkedIn");
        accessToken = liData.access_token;
        providerAccountId = "linkedin-user"; // LinkedIn require un autre call API pour l'ID (simplifié pour MVP)
        break;

      case "meta":
        const fbRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${process.env.META_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${process.env.META_APP_SECRET}&code=${code}`);
        const fbData = await fbRes.json();
        if (fbData.error) throw new Error(fbData.error.message || "Erreur Meta");
        accessToken = fbData.access_token;
        providerAccountId = "meta-user"; // Simplifié pour le MVP
        break;

      default:
        return NextResponse.json({ error: "Plateforme inconnue" }, { status: 400 });
    }

    // --- Sauvegarde dans la Base de Données (SQLite) ---
    // 1. On récupère l'espace de travail
    let workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      workspace = await prisma.workspace.create({ data: { name: "Mon Espace Personnel" } });
    }

    // 2. On créer ou on met à jour le compte OAuth
    await prisma.account.create({
      data: {
        workspaceId: workspace.id,
        platform: platform,
        providerAccountId: providerAccountId,
        accessToken: accessToken,
        refreshToken: "none" // À implémenter selon les retours des APIs
      }
    });

    // 3. Redirection vers la page des comptes
    return NextResponse.redirect(new URL("/accounts?success=true", request.url));

  } catch (err: any) {
    console.error(`Erreur OAuth Callback ${platform}:`, err);
    return NextResponse.redirect(new URL(`/accounts?error=${encodeURIComponent(err.message)}`, request.url));
  }
}
