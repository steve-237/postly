import { NextResponse } from "next/server";

const SYSTEM_PROMPT = (subject: string) =>
  `Tu es un expert en community management et marketing digital. Écris un post pour les réseaux sociaux (TikTok, LinkedIn, Facebook, Instagram) sur le sujet suivant : "${subject}". Le post doit être engageant, authentique, avec des emojis pertinents et 3 à 5 hashtags à la fin. Renvoie directement le texte du post, sans guillemets ni explication.`;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function tryPollinations(prompt: string): Promise<string> {
  const systemMsg = SYSTEM_PROMPT(prompt);
  const seed = Math.floor(Math.random() * 99999);

  // Essai 1 : GET endpoint (le plus simple, évite le rate-limit POST)
  try {
    const encoded = encodeURIComponent(systemMsg);
    const res = await fetch(
      `https://text.pollinations.ai/${encoded}?model=openai&seed=${seed}`,
      { signal: AbortSignal.timeout(20000) }
    );
    if (res.ok) {
      const text = await res.text();
      if (text && text.length > 30) return text.trim();
    }
    // Si 429 (rate limit), attendre et réessayer
    if (res.status === 429) {
      await sleep(3000);
    }
  } catch {}

  // Essai 2 : endpoint POST OpenAI-compatible
  try {
    const res = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai",
        seed,
        messages: [{ role: "user", content: systemMsg }],
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (res.ok) {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) return text.trim();
      } else {
        const text = await res.text();
        if (text && text.length > 30) return text.trim();
      }
    }
  } catch {}

  // Essai 3 : POST body simple (format legacy)
  const res = await fetch("https://text.pollinations.ai/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: systemMsg }],
      model: "openai",
      seed,
    }),
    signal: AbortSignal.timeout(25000),
  });

  if (!res.ok) {
    throw new Error(
      "Le service IA public (Pollinations) est actuellement saturé ou hors ligne. Cliquez sur l'engrenage (⚙️) à côté du bouton pour utiliser une clé Google Gemini (qui est 100% gratuite et très fiable)."
    );
  }

  const raw = await res.text();
  try {
    const json = JSON.parse(raw);
    return (
      json?.choices?.[0]?.message?.content ||
      json?.text ||
      json?.content ||
      raw
    ).trim();
  } catch {
    return raw.trim();
  }
}

function getLocalFallback(subject: string): string {
  const safeSubject = subject.length > 50 ? "ce sujet" : subject;
  const tag = subject.replace(/[^a-zA-Z0-9]/g, '').substring(0, 15) || "Trending";
  
  const templates = [
    `🚀 Envie de tout savoir sur ${safeSubject} ? \n\nDécouvrez nos meilleures astuces et conseils exclusifs pour maîtriser le sujet comme un pro. N'hésitez pas à partager vos propres expériences en commentaire ! 👇\n\n#${tag} #Tips #Innovation`,
    `💡 Focus du jour : ${safeSubject}.\n\nC'est le moment idéal pour faire le point et repenser notre approche. Qu'en pensez-vous ? Discutons-en ensemble dans les commentaires ! 🗣️\n\n#${tag} #Community #Debate`,
    `🔥 Le saviez-vous ? Quand on parle de ${safeSubject}, les détails font toute la différence.\n\nRestez à l'affût, nous préparons du lourd sur ce sujet. Activez les notifications pour ne rien rater ! 🔔\n\n#${tag} #News #Tech`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

export async function POST(request: Request) {
  try {
    const { prompt, provider = "pollinations", apiKey } = await request.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Le prompt est requis" },
        { status: 400 }
      );
    }

    const systemPrompt = SYSTEM_PROMPT(prompt);

    // ───── Pollinations (gratuit, sans clé) avec Fallback ─────
    if (provider === "pollinations") {
      try {
        const text = await tryPollinations(prompt);
        return NextResponse.json({ text });
      } catch (error) {
        // En cas d'échec (saturation), on déclenche le fallback local instantané
        console.warn("Pollinations échoué, utilisation du fallback local.");
        const text = getLocalFallback(prompt);
        return NextResponse.json({ text, isFallback: true });
      }
    }

    // ───── Google Gemini ─────
    if (provider === "gemini") {
      const key = apiKey || process.env.GEMINI_API_KEY;
      if (!key)
        return NextResponse.json(
          { error: "Clé API Gemini manquante. Ajoutez-la dans les paramètres de l'IA." },
          { status: 400 }
        );

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: { temperature: 0.8, maxOutputTokens: 512 },
          }),
        }
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error?.message || "Erreur API Gemini");
      return NextResponse.json({
        text: data.candidates[0].content.parts[0].text,
      });
    }

    // ───── Groq AI ─────
    if (provider === "groq") {
      const key = apiKey || process.env.GROQ_API_KEY;
      if (!key)
        return NextResponse.json(
          { error: "Clé API Groq manquante. Ajoutez-la dans les paramètres de l'IA." },
          { status: 400 }
        );

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: "llama3-8b-8192", // Modèle très rapide de Groq
          messages: [{ role: "user", content: systemPrompt }],
          temperature: 0.8,
          max_tokens: 512,
        }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error?.message || "Erreur API Groq");
      return NextResponse.json({ text: data.choices[0].message.content });
    }

    // ───── OpenAI ─────
    if (provider === "openai") {
      const key = apiKey || process.env.OPENAI_API_KEY;
      if (!key)
        return NextResponse.json(
          { error: "Clé API OpenAI manquante. Ajoutez-la dans les paramètres de l'IA." },
          { status: 400 }
        );

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: systemPrompt }],
          temperature: 0.8,
          max_tokens: 512,
        }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error?.message || "Erreur API OpenAI");
      return NextResponse.json({ text: data.choices[0].message.content });
    }

    return NextResponse.json(
      { error: "Fournisseur non supporté" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("AI API Error:", error);
    return NextResponse.json(
      { error: error.message || "Impossible de générer le contenu. Réessayez." },
      { status: 500 }
    );
  }
}
