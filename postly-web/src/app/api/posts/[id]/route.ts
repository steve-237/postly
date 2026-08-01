import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { newDate } = body; // ISO string de la date ciblée (par exemple: 2024-05-15T00:00:00.000Z)

    if (!newDate) {
      return NextResponse.json({ success: false, error: "Date manquante" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ success: false, error: "Post introuvable" }, { status: 404 });
    }

    const targetDate = new Date(newDate);

    // Fonction utilitaire pour préserver l'heure d'origine
    const preserveTime = (originalDate: Date) => {
      const newD = new Date(originalDate);
      newD.setFullYear(targetDate.getFullYear());
      newD.setMonth(targetDate.getMonth());
      newD.setDate(targetDate.getDate());
      return newD;
    };

    const updatedCreatedAt = preserveTime(post.createdAt);
    let updatedScheduledAt = post.scheduledAt;
    
    if (post.scheduledAt) {
      updatedScheduledAt = preserveTime(post.scheduledAt);
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        createdAt: updatedCreatedAt,
        scheduledAt: updatedScheduledAt,
      },
    });

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (error: any) {
    console.error("Erreur PATCH post:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
