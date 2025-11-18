// ============================================
// EDGE FUNCTION : CORRECTION ORTHOGRAPHIQUE
// ============================================
// Corrige l'orthographe et la grammaire d'un texte avec GPT-4o-mini
// Endpoint : /functions/v1/correct-text
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Configuration
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

// Types
interface CorrectRequest {
  text: string;
}

interface CorrectResponse {
  correctedText: string;
}

// ============================================
// FONCTION PRINCIPALE
// ============================================

serve(async (req) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  // Parser la requête AVANT le try (pour pouvoir l'utiliser dans le catch si erreur)
  let body: CorrectRequest;
  try {
    body = await req.json();
  } catch {
    body = { text: "" };
  }

  try {
    // Vérifier la clé OpenAI
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY non configurée");
    }

    if (!body.text || typeof body.text !== "string") {
      return new Response(
        JSON.stringify({ error: "CORRECT_FAILED", message: "text requis (string)" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Si texte vide ou trop court, retourner tel quel
    const text = body.text.trim();
    if (text.length < 3) {
      return new Response(
        JSON.stringify({ correctedText: text }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    console.log(`[Correct] Correction de ${text.length} caractères`);

    // Appel GPT-4o-mini pour correction
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Tu es un correcteur orthographique pour des notes vocales d'artisans du bâtiment.

RÈGLES STRICTES :
1. Corrige UNIQUEMENT l'orthographe, les accords et la ponctuation
2. NE CHANGE PAS le sens ni la formulation
3. NE REFORMULE PAS les phrases
4. Garde le style oral et naturel
5. Renvoie UNIQUEMENT le texte corrigé, sans explications ni commentaires

Exemples :
- "y faut changer 3 prise dan la cuissine" → "Il faut changer 3 prises dans la cuisine"
- "jai refait lelectricite du salon" → "J'ai refait l'électricité du salon"
- "8 prise 3 interrupteur" → "8 prises, 3 interrupteurs"
- "faut prevoir cable et gaine" → "Il faut prévoir câble et gaine"`,
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0.3, // Peu de créativité pour rester fidèle
        max_tokens: 500,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      throw new Error(`Erreur OpenAI: ${error}`);
    }

    const data = await openaiResponse.json();
    const correctedText = data.choices[0]?.message?.content?.trim() || text;

    console.log(`[Correct] ✅ Texte corrigé (${correctedText.length} caractères)`);

    // Retourner le texte corrigé
    const result: CorrectResponse = {
      correctedText,
    };

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );

  } catch (error: any) {
    console.error("❌ Erreur correction:", error);
    
    // En cas d'erreur, retourner le texte original (pas de blocage)
    const originalText = body?.text || "";
    
    return new Response(
      JSON.stringify({
        correctedText: originalText, // Fallback vers texte original
        error: "CORRECT_FAILED",
        message: error?.message || "Erreur lors de la correction (texte original retourné)",
      }),
      {
        status: 200, // 200 car on retourne quand même le texte original
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});

