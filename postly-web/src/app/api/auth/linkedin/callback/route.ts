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

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || "http://localhost:3000/api/auth/linkedin/callback";

  try {
    // 1. Échanger le code contre un Access Token
    const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("LinkedIn Token Error:", tokenData);
      return NextResponse.redirect(new URL("/accounts?error=token_failed", request.url));
    }

    const accessToken = tokenData.access_token;
    const expiresIn = tokenData.expires_in; // En secondes

    // 2. Récupérer l'identifiant de l'utilisateur (providerAccountId)
    const profileResponse = await fetch("https://api.linkedin.com/v2/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profileData = await profileResponse.json();
    const providerAccountId = profileData.id;

    if (!providerAccountId) {
      throw new Error("Impossible de récupérer l'ID utilisateur LinkedIn");
    }

    // 3. Sauvegarder dans la base de données locale (SQLite via Prisma)
    // Pour l'instant, on lie au premier Workspace par défaut. (Dans une app réelle, on utiliserait le workspace actif via l'URL ou un cookie)
    let workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: { name: "Mon Espace Personnel" },
      });
    }

    // On crée ou met à jour le compte
    await prisma.account.upsert({
      where: {
        id: `linkedin-${providerAccountId}`, // Idéalement, créer une contrainte unique sur providerAccountId dans le schéma, mais pour simplifier on force l'ID
      },
      update: {
        accessToken: accessToken,
        expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
      },
      create: {
        id: `linkedin-${providerAccountId}`,
        workspaceId: workspace.id,
        platform: "linkedin",
        providerAccountId: providerAccountId,
        accessToken: accessToken,
        expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
      },
    });

    // 4. Rediriger vers la page des comptes avec un message de succès
    return NextResponse.redirect(new URL("/accounts?success=linkedin", request.url));
  } catch (err) {
    console.error("OAuth Callback Error:", err);
    return NextResponse.redirect(new URL("/accounts?error=server_error", request.url));
  }
}
