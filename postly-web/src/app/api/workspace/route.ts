import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let workspace = await prisma.workspace.findFirst({
      include: { accounts: true }
    });
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: { name: "Mon Espace Personnel" },
        include: { accounts: true }
      });
    }
    return NextResponse.json({ success: true, workspace });
  } catch (error) {
    console.error("Workspace GET Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { ayrshareKey } = data;

    let workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: { name: "Mon Espace Personnel", ayrshareKey }
      });
    } else {
      workspace = await prisma.workspace.update({
        where: { id: workspace.id },
        data: { ayrshareKey }
      });
    }

    return NextResponse.json({ success: true, workspace });
  } catch (error) {
    console.error("Workspace POST Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
