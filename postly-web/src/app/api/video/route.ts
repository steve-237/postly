import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

// Configuration de ffmpeg pour utiliser le binaire embarqué
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { mediaUrl } = data; // Exemple: "/uploads/1715423-video.mp4"

    if (!mediaUrl) {
      return NextResponse.json({ error: "Aucun média fourni" }, { status: 400 });
    }

    const publicDir = path.join(process.cwd(), "public");
    const inputPath = path.join(publicDir, mediaUrl);
    
    // Vérifier si le fichier existe
    try {
      await fs.access(inputPath);
    } catch {
      return NextResponse.json({ error: "Fichier introuvable sur le disque" }, { status: 404 });
    }

    const ext = path.extname(mediaUrl);
    const basename = path.basename(mediaUrl, ext);
    const outputName = `${basename}-tiktok${ext}`;
    const outputPath = path.join(publicDir, "uploads", outputName);

    // On utilise Promise pour gérer le traitement asynchrone FFmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        // Format TikTok standard : 1080x1920
        // On garde le ratio d'aspect, et on ajoute des bandes noires si nécessaire
        .videoFilters('scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black')
        .outputOptions([
          '-c:v libx264',    // Codec vidéo standard et compatible
          '-crf 23',         // Qualité standard (0-51, plus bas = meilleur)
          '-preset fast',    // Vitesse de traitement
          '-c:a aac',        // Codec audio standard
          '-b:a 128k',       // Bitrate audio
        ])
        .save(outputPath)
        .on('end', () => resolve(true))
        .on('error', (err) => {
          console.error("FFmpeg Error:", err);
          reject(err);
        });
    });

    const newUrl = `/uploads/${outputName}`;

    return NextResponse.json({ 
      success: true, 
      url: newUrl,
      message: "Vidéo formatée avec succès pour TikTok"
    });

  } catch (error) {
    console.error("Video Processing Error:", error);
    return NextResponse.json({ error: "Erreur lors du traitement vidéo" }, { status: 500 });
  }
}
