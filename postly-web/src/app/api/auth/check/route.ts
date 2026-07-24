import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform");

  let configured = false;

  switch (platform) {
    case "tiktok":
      configured = !!process.env.TIKTOK_CLIENT_KEY;
      break;
    case "linkedin":
      configured = !!process.env.LINKEDIN_CLIENT_ID;
      break;
    case "meta":
      configured = !!process.env.META_APP_ID;
      break;
    default:
      return NextResponse.json({ error: "Plateforme inconnue" }, { status: 400 });
  }

  return NextResponse.json({ configured });
}
