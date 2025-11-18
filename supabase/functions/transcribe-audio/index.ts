// ============================================
// EDGE FUNCTION : TRANSCRIPTION AUDIO WHISPER
// ============================================
// Transcrit un fichier audio avec OpenAI Whisper API
// Endpoint : /functions/v1/transcribe-audio
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Configuration
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Types
interface TranscribeRequest {
  filePath?: string; // Chemin dans Supabase Storage (bucket "voices")
  audioBase64?: string; // Audio en Base64 (optionnel, pour petits fichiers)
  language?: string; // Code langue (défaut: "fr")
}

interface TranscribeResponse {
  transcription: string;
  language?: string;
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

  try {
    // Vérifier la clé OpenAI
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY non configurée");
    }

    // Parser la requête
    const body: TranscribeRequest = await req.json();

    if (!body.filePath && !body.audioBase64) {
      return new Response(
        JSON.stringify({ error: "TRANSCRIBE_FAILED", message: "filePath ou audioBase64 requis" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Créer le client Supabase (avec service role pour accéder à Storage)
    // Note : Service Role permet d'accéder à Storage sans vérifier l'auth utilisateur
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let audioFile: Uint8Array;
    let fileName = "audio.m4a";

    // Option 1 : Télécharger depuis Storage
    if (body.filePath) {
      console.log(`[Transcribe] Téléchargement depuis Storage: ${body.filePath}`);
      
      const { data, error } = await supabase.storage
        .from("voices")
        .download(body.filePath);

      if (error || !data) {
        throw new Error(`Erreur téléchargement Storage: ${error?.message || "Fichier introuvable"}`);
      }

      audioFile = new Uint8Array(await data.arrayBuffer());
      fileName = body.filePath.split("/").pop() || "audio.m4a";
    } 
    // Option 2 : Utiliser Base64 fourni
    else if (body.audioBase64) {
      console.log(`[Transcribe] Utilisation audio Base64`);
      const base64Data = body.audioBase64.replace(/^data:audio\/\w+;base64,/, "");
      audioFile = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    } else {
      throw new Error("Aucune source audio fournie");
    }

    // Préparer le FormData pour OpenAI
    const formData = new FormData();
    
    // Créer un Blob à partir de l'audio
    const audioBlob = new Blob([audioFile], { type: "audio/m4a" });
    formData.append("file", audioBlob, fileName);
    formData.append("model", "whisper-1");
    formData.append("language", body.language || "fr");
    formData.append("response_format", "json");

    console.log(`[Transcribe] Appel Whisper API (taille: ${audioFile.length} bytes)`);

    // Appel OpenAI Whisper API
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur OpenAI: ${error}`);
    }

    const data = await response.json();
    const transcription = data.text || "";

    console.log(`[Transcribe] ✅ Transcription réussie (${transcription.length} caractères)`);

    // Retourner la transcription
    const result: TranscribeResponse = {
      transcription,
      language: body.language || "fr",
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
    console.error("❌ Erreur transcription:", error);
    return new Response(
      JSON.stringify({
        error: "TRANSCRIBE_FAILED",
        message: error?.message || "Erreur lors de la transcription",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});

