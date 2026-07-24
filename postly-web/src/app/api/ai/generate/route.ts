import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { prompt, provider = "pollinations", apiKey } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Le prompt est requis" }, { status: 400 });
    }

    const systemPrompt = `Tu es un expert en community management et en marketing digital. Ton but est d'écrire un post pour les réseaux sociaux (TikTok, LinkedIn, Facebook, Instagram) très engageant. Le sujet donné par l'utilisateur est : "${prompt}". Rédige le contenu du post de manière captivante. Ajoute des emojis pertinents. Inclus 3 à 5 hashtags à la fin. Ne mets pas de guillemets autour de ton résultat, renvoie directement le texte du post prêt à être copié-collé.`;

    if (provider === "pollinations") {
      // Modèle 100% Gratuit, sans clé d'API requise
      const res = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: systemPrompt }]
        })
      });
      if (!res.ok) throw new Error("Erreur Pollinations AI");
      const generatedText = await res.text();
      return NextResponse.json({ text: generatedText });
    }

    if (provider === "gemini") {
      const key = apiKey || process.env.GEMINI_API_KEY;
      if (!key) return NextResponse.json({ error: "Clé API Gemini requise" }, { status: 400 });
      
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { temperature: 0.7 }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Erreur API Gemini");
      return NextResponse.json({ text: data.candidates[0].content.parts[0].text });
    }

    if (provider === "openai") {
      const key = apiKey || process.env.OPENAI_API_KEY;
      if (!key) return NextResponse.json({ error: "Clé API OpenAI requise" }, { status: 400 });

      const res = await fetch(`https://api.openai.com/v1/chat/completions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Modèle rapide et abordable
          messages: [{ role: "user", content: systemPrompt }],
          temperature: 0.7
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Erreur API OpenAI");
      return NextResponse.json({ text: data.choices[0].message.content });
    }

    return NextResponse.json({ error: "Fournisseur non supporté" }, { status: 400 });

  } catch (error: any) {
    console.error("AI API Error:", error);
    return NextResponse.json({ error: "Impossible de générer le contenu." }, { status: 500 });
  }
}
