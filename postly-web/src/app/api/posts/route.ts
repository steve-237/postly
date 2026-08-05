import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { content, status, scheduledAt, platforms, mediaUrls } = data;

    if (!content) {
      return NextResponse.json({ error: "Le contenu du post est obligatoire" }, { status: 400 });
    }

    // Récupérer le premier workspace (en mode local-first on simplifie)
    let workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: { name: "Mon Espace Personnel" }
      });
    }

    // Créer le post
    const post = await prisma.post.create({
      data: {
        text: content,
        status: status || "DRAFT",
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        workspaceId: workspace.id,
      }
    });

    // Sauvegarder les médias attachés
    if (mediaUrls && Array.isArray(mediaUrls)) {
      for (const url of mediaUrls) {
        await prisma.media.create({
          data: {
            url: url,
            type: url.match(/\.(mp4|mov|avi)$/i) ? "VIDEO" : "IMAGE",
            postId: post.id
          }
        });
      }
    }

    // --- PUBLICATION RÉELLE ---
    if (status === "PUBLISHED") {
      // On récupère les comptes Natifs associés au Workspace
      const nativeAccounts = await prisma.account.findMany({
        where: { workspaceId: workspace.id }
      });

      // Si l'utilisateur a configuré Meta en Natif
      const metaAccount = nativeAccounts.find(a => a.platform === "meta");
      if (metaAccount && platforms.includes("facebook")) {
        console.log("Envoi Natif vers Facebook Graph API...");
        try {
          await fetch(`https://graph.facebook.com/v19.0/me/feed`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: content,
              access_token: metaAccount.accessToken
            })
          });
        } catch (e) { console.error("Erreur Graph API", e); }
      }

      // Si Ayrshare est configuré (Option B / Fallback)
      if (workspace.ayrshareKey) {
        console.log("Envoi de la publication à Ayrshare (Agrégateur)...");
        const ayrsharePayload = {
          post: content,
          platforms: platforms || ["tiktok", "facebook", "linkedin"],
          ...(mediaUrls?.length > 0 && { mediaUrls })
        };

        const ayrRes = await fetch("https://app.ayrshare.com/api/post", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${workspace.ayrshareKey}`
          },
          body: JSON.stringify(ayrsharePayload)
        });

        const ayrData = await ayrRes.json();
        if (ayrData.status === "error") {
          await prisma.post.update({ where: { id: post.id }, data: { status: "FAILED" } });
          return NextResponse.json({ success: false, error: "Erreur API Ayrshare: " + ayrData.message, post });
        }
      }
    }

    return NextResponse.json({ success: true, post });

  } catch (error) {
    console.error("Save Post Error:", error);
    return NextResponse.json({ error: "Erreur lors de la sauvegarde du post" }, { status: 500 });
  }
}
