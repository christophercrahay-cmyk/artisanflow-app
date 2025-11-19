// ============================================
// EDGE FUNCTION : IA DEVIS CONVERSATIONNEL
// ============================================
// Gère la génération de devis IA avec mode Q/R
// Endpoint : /functions/v1/ai-devis-conversational
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Types
interface DevisLine {
  description: string;
  quantite: number;
  unite: string;
  prix_unitaire: number;
  prix_total: number;
}

interface DevisJSON {
  titre: string;
  description: string;
  lignes: DevisLine[];
  total_ht: number;
  tva_pourcent: number;
  tva_montant: number;
  total_ttc: number;
  questions_clarification?: string[];
}

interface AIResponse {
  status: "questions" | "ready" | "error";
  devis: DevisJSON;
  questions: string[];
  session_id: string;
  tour_count: number;
}

// Configuration
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const MAX_TOURS = 3;

// ============================================
// FONCTION PRINCIPALE
// ============================================

serve(async (req) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response("ok", {
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
    const { action, session_id, transcription, notes, reponses, project_id, client_id, user_id } = await req.json();

    // Récupérer le token d'authentification depuis les headers
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("Token d'authentification manquant");
    }

    // Créer le client Supabase avec le token de l'utilisateur
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          authorization: authHeader,
        },
      },
    });

    // Router selon l'action
    switch (action) {
      case "start":
        return await handleStart(supabase, { transcription, notes, project_id, client_id, user_id });
      
      case "answer":
        return await handleAnswer(supabase, { session_id, reponses });
      
      case "finalize":
        return await handleFinalize(supabase, { session_id });
      
      default:
        throw new Error(`Action inconnue : ${action}`);
    }

  } catch (error) {
    console.error("Erreur Edge Function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      }
    );
  }
});

// ============================================
// HANDLER : START (Démarrer une session)
// ============================================

async function handleStart(supabase: any, data: any) {
  const { transcription, notes, project_id, client_id, user_id } = data;

  console.log("🚀 Démarrage session IA pour user:", user_id);
  
  // Si notes fournies, les compiler en une seule transcription
  let fullTranscription = transcription || '';
  if (notes && notes.length > 0) {
    console.log(`📝 Compilation de ${notes.length} notes`);
    // Filtrer les notes null, undefined, ou sans transcription valide
    const validNotes = notes.filter((note: any) => {
      return note != null && 
             typeof note === 'object' && 
             note.transcription != null && 
             typeof note.transcription === 'string' && 
             note.transcription.trim().length > 0;
    });
    if (validNotes.length === 0) {
      // Aucune note valide : retourner un devis vide avec des questions
      console.log('⚠️ Aucune note valide trouvée, génération questionnaire');
      return {
        status: 'questions',
        devis: {
          lignes: [],
          total_ht: 0,
          total_ttc: 0,
          tva_pourcent: 20,
          tva_montant: 0,
          titre: 'Nouveau devis',
          description: 'Complétez le questionnaire pour générer votre devis',
        },
        questions: [
          'Quel type de prestation souhaitez-vous facturer ?',
          'Pouvez-vous décrire les travaux à réaliser ?',
          'Quelle est la surface ou la quantité concernée ?',
          'Y a-t-il des fournitures à inclure ?',
          'Quel niveau de finition est souhaité ?',
        ],
        session_id: '',
        tour_count: 0,
      };
    }
    fullTranscription = validNotes.map((note: any, index: number) => {
      const date = new Date(note.created_at).toLocaleDateString('fr-FR');
      return `[Note ${index + 1} - ${date}]\n${note.transcription || ''}`;
    }).join('\n\n');
  }

  // Créer une nouvelle session
  const { data: session, error: sessionError } = await supabase
    .from("devis_ai_sessions")
    .insert({
      user_id,
      project_id,
      client_id,
      context_json: {
        tours: [],
        transcription_initiale: fullTranscription,
        reponses_artisan: [],
        notes_count: notes?.length || 0,
      },
      status: "pending",
      tour_count: 0,
    })
    .select()
    .single();

  if (sessionError) {
    throw new Error(`Erreur création session: ${sessionError.message}`);
  }

  console.log("✅ Session créée:", session.id);

  // Analyser la transcription avec GPT
  const aiResult = await analyzeTranscriptionWithGPT(fullTranscription, null, 1);

  // Sauvegarder le devis temporaire
  const { error: tempError } = await supabase
    .from("devis_temp_ai")
    .insert({
      session_id: session.id,
      json_devis: aiResult.devis,
      questions_pending: aiResult.questions,
      version: 1,
    });

  if (tempError) {
    throw new Error(`Erreur sauvegarde devis temp: ${tempError.message}`);
  }

  // Mettre à jour la session
  const newStatus = aiResult.questions.length > 0 ? "questions" : "ready";
  await supabase
    .from("devis_ai_sessions")
    .update({
      status: newStatus,
      tour_count: 1,
      context_json: {
        tours: [{
          tour: 1,
          transcription: fullTranscription,
          devis: aiResult.devis,
          questions: aiResult.questions,
        }],
        transcription_initiale: fullTranscription,
        reponses_artisan: [],
        notes_count: notes?.length || 0,
      },
    })
    .eq("id", session.id);

  console.log(`✅ Session ${session.id} → ${newStatus}`);

  // Retourner la réponse
  const response: AIResponse = {
    status: newStatus,
    devis: aiResult.devis,
    questions: aiResult.questions,
    session_id: session.id,
    tour_count: 1,
  };

  return new Response(JSON.stringify(response), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

// ============================================
// HANDLER : ANSWER (Répondre aux questions)
// ============================================

async function handleAnswer(supabase: any, data: any) {
  const { session_id, reponses } = data;

  console.log("💬 Réponses reçues pour session:", session_id);

  // Récupérer la session
  const { data: session, error: sessionError } = await supabase
    .from("devis_ai_sessions")
    .select("*")
    .eq("id", session_id)
    .single();

  if (sessionError || !session) {
    throw new Error("Session introuvable");
  }

  // Vérifier le nombre de tours
  if (session.tour_count >= MAX_TOURS) {
    console.log("⚠️ Nombre max de tours atteint");
    return await handleFinalize(supabase, { session_id });
  }

  // Récupérer le dernier devis
  const { data: lastDevis, error: devisError } = await supabase
    .from("devis_temp_ai")
    .select("*")
    .eq("session_id", session_id)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  if (devisError) {
    throw new Error("Devis temporaire introuvable");
  }

  // Construire le contexte pour GPT
  const context = session.context_json;
  const newTourCount = session.tour_count + 1;

  // Analyser avec GPT en incluant les réponses
  const aiResult = await analyzeTranscriptionWithGPT(
    context.transcription_initiale,
    { previousDevis: lastDevis.json_devis, reponses },
    newTourCount
  );

  // Sauvegarder la nouvelle version du devis
  await supabase
    .from("devis_temp_ai")
    .insert({
      session_id,
      json_devis: aiResult.devis,
      questions_pending: aiResult.questions,
      version: newTourCount,
    });

  // Mettre à jour le contexte
  const updatedContext = {
    ...context,
    tours: [
      ...context.tours,
      {
        tour: newTourCount,
        reponses,
        devis: aiResult.devis,
        questions: aiResult.questions,
      },
    ],
    reponses_artisan: [...context.reponses_artisan, reponses],
  };

  const newStatus = aiResult.questions.length > 0 ? "questions" : "ready";

  await supabase
    .from("devis_ai_sessions")
    .update({
      status: newStatus,
      tour_count: newTourCount,
      context_json: updatedContext,
    })
    .eq("id", session_id);

  console.log(`✅ Session ${session_id} → Tour ${newTourCount} → ${newStatus}`);

  // Retourner la réponse
  const response: AIResponse = {
    status: newStatus,
    devis: aiResult.devis,
    questions: aiResult.questions,
    session_id,
    tour_count: newTourCount,
  };

  return new Response(JSON.stringify(response), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

// ============================================
// HANDLER : FINALIZE (Finaliser le devis)
// ============================================

async function handleFinalize(supabase: any, data: any) {
  const { session_id } = data;

  console.log("✅ Finalisation session:", session_id);

  // Récupérer le dernier devis
  const { data: lastDevis, error: devisError } = await supabase
    .from("devis_temp_ai")
    .select("*")
    .eq("session_id", session_id)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  if (devisError) {
    throw new Error("Devis temporaire introuvable");
  }

  // Marquer comme validé
  await supabase
    .from("devis_temp_ai")
    .update({ is_validated: true, validated_at: new Date().toISOString() })
    .eq("id", lastDevis.id);

  // Mettre à jour la session
  await supabase
    .from("devis_ai_sessions")
    .update({
      status: "ready",
      completed_at: new Date().toISOString(),
    })
    .eq("id", session_id);

  console.log(`✅ Session ${session_id} finalisée`);

  // Retourner le devis final
  const response: AIResponse = {
    status: "ready",
    devis: lastDevis.json_devis,
    questions: [],
    session_id,
    tour_count: lastDevis.version,
  };

  return new Response(JSON.stringify(response), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

// ============================================
// FONCTION : ANALYSER AVEC GPT
// ============================================

async function analyzeTranscriptionWithGPT(
  transcription: string,
  context: { previousDevis?: DevisJSON; reponses?: string[] } | null,
  tourNumber: number
): Promise<{ devis: DevisJSON; questions: string[] }> {
  
  console.log(`🤖 Appel GPT-4o-mini (Tour ${tourNumber})`);

  // Construire le prompt
  let systemPrompt = `Tu es un expert en devis pour tous types de prestations professionnelles en France (bâtiment, services, artisanat, etc.).
Ton rôle est de transformer une note vocale en devis structuré et professionnel.

RÈGLES IMPORTANTES :
1. Génère des prix réalistes basés sur les tarifs moyens français 2025 pour le secteur concerné
2. Pose des questions GÉNÉRIQUES et PERTINENTES si des informations critiques manquent
3. Maximum 5 questions par tour
4. Si tu as assez d'infos, ne pose AUCUNE question (questions_clarification = [])
5. Utilise les unités appropriées : unité, m², ml, forfait, heure, jour, kg, etc.
6. Adapte-toi au type de prestation (électricité, plomberie, peinture, conseil, formation, etc.)

QUESTIONS GÉNÉRIQUES À POSER SI NÉCESSAIRE :
- Quel est le type exact de prestation ? (installation, rénovation, dépannage, maintenance, conseil, etc.)
- Pouvez-vous préciser les quantités pour chaque élément ?
- Y a-t-il des contraintes particulières ? (délais, accès, normes, finitions, etc.)
- Le matériel/fournitures sont-ils inclus ou fournis par le client ?
- Quel est le niveau de finition ou de qualité souhaité ?

FORMAT DE SORTIE (JSON strict) :
{
  "titre": "Titre court du devis",
  "description": "Description détaillée de la prestation",
  "lignes": [
    {
      "description": "Description claire et précise",
      "quantite": 1,
      "unite": "unité",
      "prix_unitaire": 45.00,
      "prix_total": 45.00
    }
  ],
  "total_ht": 0,
  "tva_pourcent": 20.0,
  "tva_montant": 0,
  "total_ttc": 0,
  "questions_clarification": []
}`;

  let userPrompt = "";

  if (tourNumber === 1) {
    // Premier tour : analyse initiale
    userPrompt = `Analyse cette note vocale et génère un devis professionnel :

"${transcription}"

Si des informations critiques manquent pour établir un devis précis, pose des questions génériques et pertinentes.
Sinon, génère un devis complet sans questions.`;
  } else {
    // Tours suivants : raffinement avec réponses
    userPrompt = `CONTEXTE :
Transcription initiale : "${transcription}"

DEVIS PRÉCÉDENT :
${JSON.stringify(context?.previousDevis, null, 2)}

RÉPONSES DU PROFESSIONNEL :
${context?.reponses?.join("\n")}

TÂCHE :
Mets à jour le devis en intégrant les réponses.
Si tu as besoin de clarifications supplémentaires, pose des questions génériques (max 5).
Sinon, retourne un devis final sans questions.`;
  }

  // Appel à l'API OpenAI
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur OpenAI: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  const result = JSON.parse(content);

  console.log(`✅ GPT réponse : ${result.questions_clarification?.length || 0} questions`);

  return {
    devis: result,
    questions: result.questions_clarification || [],
  };
}

