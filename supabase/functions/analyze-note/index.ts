// ============================================
// EDGE FUNCTION : ANALYSE DE NOTE VOCALE
// ============================================
// Analyse une note vocale et détermine son type (prestation/client_info/note_perso)
// Endpoint : /functions/v1/analyze-note
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Configuration
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

// Types
interface AnalyzeRequest {
  noteText: string;
}

interface AnalyzeResponse {
  type: "prestation" | "client_info" | "note_perso";
  categorie?: string;
  description?: string;
  quantite?: number;
  unite?: string;
  details?: string;
  info?: string;
  note?: string;
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
  let body: AnalyzeRequest;
  try {
    body = await req.json();
  } catch {
    body = { noteText: "" };
  }

  try {
    // Vérifier la clé OpenAI
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY non configurée");
    }

    if (!body.noteText || typeof body.noteText !== "string") {
      return new Response(
        JSON.stringify({ error: "ANALYZE_FAILED", message: "noteText requis (string)" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const noteText = body.noteText.trim();
    if (noteText.length === 0) {
      // Texte vide → note perso par défaut
      return new Response(
        JSON.stringify({
          type: "note_perso",
          note: noteText,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    console.log(`[Analyze] Analyse de ${noteText.length} caractères`);

    // Appel GPT-4o-mini pour analyse
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
            content: `Tu es un assistant IA pour artisans du bâtiment en France.
MISSION : Analyser une note vocale et déterminer son type.

TYPES POSSIBLES :
1. "prestation" : Travaux facturables (peinture, électricité, plomberie, etc.)
2. "client_info" : Préférences/détails du client (couleur, matériaux, style, etc.)
3. "note_perso" : Notes personnelles de l'artisan (RDV, rappels, outils, etc.)

POUR LES PRESTATIONS, EXTRAIRE :
- categorie : Type de travaux (Peinture, Électricité, Plomberie, Maçonnerie, Menuiserie, Carrelage, Plâtrerie, etc.)
- description : Description courte et claire
- quantite : Nombre/Surface (extraire uniquement si mentionné)
- unite : m², m, pièce, h, unité, ml, etc.
- details : Détails importants (nb couches, type matériau, etc.)

EXEMPLES :
Note: "Salon à repeindre, 20m², deux couches, peinture blanche mate"
→ Type: prestation
→ Données: {
  "categorie": "Peinture",
  "description": "Peinture salon",
  "quantite": 20,
  "unite": "m²",
  "details": "2 couches, blanc mat"
}

Note: "3 prises électriques à installer dans la cuisine"
→ Type: prestation
→ Données: {
  "categorie": "Électricité",
  "description": "Installation prises cuisine",
  "quantite": 3,
  "unite": "pièce",
  "details": "cuisine"
}

Note: "Le client préfère du parquet en chêne clair"
→ Type: client_info
→ Données: {
  "info": "Préfère parquet chêne clair"
}

Note: "RDV mardi prochain à 14h"
→ Type: note_perso
→ Données: {
  "note": "RDV mardi 14h"
}

IMPORTANT :
- Retourne UNIQUEMENT un JSON valide
- Pas de texte avant ou après le JSON
- Si incertain sur la quantité, ne pas inventer, mettre null`,
          },
          {
            role: "user",
            content: noteText,
          },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      throw new Error(`Erreur OpenAI: ${error}`);
    }

    const data = await openaiResponse.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("Réponse GPT vide");
    }

    // Parser le JSON retourné
    let result: AnalyzeResponse;
    try {
      result = JSON.parse(content);
    } catch (parseError) {
      console.error("[Analyze] Erreur parsing JSON:", parseError);
      throw new Error("Réponse OpenAI invalide (JSON malformé)");
    }

    // Validation : s'assurer que le type est valide
    if (!result.type || !["prestation", "client_info", "note_perso"].includes(result.type)) {
      result.type = "note_perso";
    }

    console.log(`[Analyze] ✅ Analyse réussie: type=${result.type}`);

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
    console.error("❌ Erreur analyse:", error);
    
    // En cas d'erreur, considérer comme note perso par défaut
    const originalText = body?.noteText || "";
    
    return new Response(
      JSON.stringify({
        type: "note_perso",
        note: originalText,
        error: "ANALYZE_FAILED",
        message: error?.message || "Erreur lors de l'analyse (type par défaut: note_perso)",
      }),
      {
        status: 200, // 200 car on retourne quand même un résultat
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});

