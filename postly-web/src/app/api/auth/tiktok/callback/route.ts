import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/accounts?error=access_denied", request.url));
  }

  if (!code) {
    return NextResponse.json({ error: "Code d'autorisation manquant" }, { status: 400 });
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI || "http://localhost:3000/api/auth/tiktok/callback";

  try {
    // 1. Échanger le code contre un Access Token
    const tokenResponse = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
      },
      body: new URLSearchParams({
        client_key: clientKey!,
        client_secret: clientSecret!,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error || !tokenData.access_token) {
      console.error("TikTok Token Error:", tokenData);
      return NextResponse.redirect(new URL("/accounts?error=token_failed", request.url));
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in; // En secondes
    const providerAccountId = tokenData.open_id; // Identifiant unique de l'utilisateur TikTok

    if (!providerAccountId) {
      throw new Error("Impossible de récupérer l'OpenID de TikTok");
    }

    // 2. Sauvegarder dans la base de données locale
    let workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: { name: "Mon Espace Personnel" },
      });
    }

    // On crée ou met à jour le compte TikTok
    await prisma.account.upsert({
      where: {
        id: `tiktok-${providerAccountId}`,
      },
      update: {
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
      },
      create: {
        id: `tiktok-${providerAccountId}`,
        workspaceId: workspace.id,
        platform: "tiktok",
        providerAccountId: providerAccountId,
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
      },
    });

    // 3. Rediriger vers la page des comptes avec un message de succès
    return NextResponse.redirect(new URL("/accounts?success=tiktok", request.url));
  } catch (err) {
    console.error("OAuth Callback Error:", err);
    return NextResponse.redirect(new URL("/accounts?error=server_error", request.url));
  }
}
