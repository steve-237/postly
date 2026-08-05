import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

  const clientId = process.env.META_CLIENT_ID;
  const clientSecret = process.env.META_CLIENT_SECRET;
  const redirectUri = process.env.META_REDIRECT_URI || "http://localhost:3000/api/auth/meta/callback";

  try {
    // 1. Échanger le code contre un Access Token (User Token)
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${code}`;
    
    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("Meta Token Error:", tokenData);
      return NextResponse.redirect(new URL("/accounts?error=token_failed", request.url));
    }

    const shortLivedToken = tokenData.access_token;

    // 2. Échanger le token court contre un token long (Long-lived Token - valide 60 jours)
    const longTokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${shortLivedToken}`;
    
    const longTokenResponse = await fetch(longTokenUrl);
    const longTokenData = await longTokenResponse.json();
    
    const accessToken = longTokenData.access_token || shortLivedToken;
    const expiresIn = longTokenData.expires_in || 5184000; // 60 jours par défaut

    // 3. Récupérer l'identifiant de l'utilisateur Meta
    const profileResponse = await fetch(`https://graph.facebook.com/v19.0/me?access_token=${accessToken}`);
    const profileData = await profileResponse.json();
    const providerAccountId = profileData.id;

    if (!providerAccountId) {
      throw new Error("Impossible de récupérer l'ID utilisateur Meta");
    }

    // 4. Sauvegarder dans la base de données locale
    let workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: { name: "Mon Espace Personnel" },
      });
    }

    // On crée ou met à jour le compte
    await prisma.account.upsert({
      where: {
        id: `meta-${providerAccountId}`, 
      },
      update: {
        accessToken: accessToken,
        expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
      },
      create: {
        id: `meta-${providerAccountId}`,
        workspaceId: workspace.id,
        platform: "meta",
        providerAccountId: providerAccountId,
        accessToken: accessToken,
        expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
      },
    });

    // 5. Rediriger vers la page des comptes avec un message de succès
    return NextResponse.redirect(new URL("/accounts?success=meta", request.url));
  } catch (err) {
    console.error("OAuth Callback Error:", err);
    return NextResponse.redirect(new URL("/accounts?error=server_error", request.url));
  }
}
