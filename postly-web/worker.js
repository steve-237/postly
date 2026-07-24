const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const path = require('path');

const dbPath = path.resolve(__dirname, 'dev.db');
const adapter = new PrismaLibSql({ url: 'file:' + dbPath });
const prisma = new PrismaClient({ adapter, log: ['error'] });


console.log('🚀 [Auto-Pilote] Moteur de publication automatique démarré.');

cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const postsToPublish = await prisma.post.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: { lte: now }
      },
      include: {
        media: true,
        workspace: { include: { accounts: true } }
      }
    });

    if (postsToPublish.length > 0) {
      console.log(`⏳ [Auto-Pilote] ${postsToPublish.length} post(s) à publier...`);
    }

      for (const post of postsToPublish) {
      try {
        console.log(`[Auto-Pilote] Publication du post ID: ${post.id}`);
        
        // --- PUBLICATION RÉELLE VIA AYRSHARE (Option B) ---
        if (post.workspace?.ayrshareKey) {
          const ayrsharePayload = {
            post: post.text,
            platforms: ["tiktok", "facebook", "linkedin"],
            ...(post.media?.length > 0 && { mediaUrls: post.media.map(m => m.url) })
          };

          const ayrRes = await fetch("https://app.ayrshare.com/api/post", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${post.workspace.ayrshareKey}`
            },
            body: JSON.stringify(ayrsharePayload)
          });

          const ayrData = await ayrRes.json();
          console.log(`[Auto-Pilote] Ayrshare Response for post ${post.id}:`, ayrData);

          if (ayrData.status === "error") {
            throw new Error(ayrData.message);
          }
        } else {
          console.log(`[Auto-Pilote] Aucune clé Ayrshare trouvée pour l'espace ${post.workspaceId}. Simulation de publication seule.`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        await prisma.post.update({
          where: { id: post.id },
          data: { status: 'PUBLISHED' }
        });
        console.log(`✅ [Auto-Pilote] Post ID: ${post.id} publié avec succès !`);
      } catch (error) {
        console.error(`❌ [Auto-Pilote] Échec pour le post ID: ${post.id}`, error);
        await prisma.post.update({
          where: { id: post.id },
          data: { status: 'FAILED' }
        });
      }
    }
  } catch (error) {
    console.error('[Auto-Pilote] Erreur globale CRON:', error);
  }
});
