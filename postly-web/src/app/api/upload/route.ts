import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const postId = formData.get("postId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier n'a été fourni" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Définition du chemin public local (0 euro !)
    const uploadDir = join(process.cwd(), "public", "uploads");
    
    // Créer le dossier s'il n'existe pas
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Ignorer l'erreur si le dossier existe déjà
    }

    const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const filePath = join(uploadDir, uniqueName);

    await writeFile(filePath, buffer);
    const publicUrl = `/uploads/${uniqueName}`;

    // Si on a déjà un Post ID, on lie le média directement dans la DB
    if (postId) {
      await prisma.media.create({
        data: {
          url: publicUrl,
          type: file.type.startsWith("video") ? "VIDEO" : "IMAGE",
          postId: postId,
        }
      });
    }

    return NextResponse.json({ success: true, url: publicUrl, name: uniqueName, type: file.type });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Erreur lors de la sauvegarde du fichier" }, { status: 500 });
  }
}
