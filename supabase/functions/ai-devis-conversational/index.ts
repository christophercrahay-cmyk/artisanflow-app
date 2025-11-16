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
  devis?: DevisJSON; // Pour compatibilité avec devis
  facture?: DevisJSON; // Pour factures (même structure que devis)
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
    const { action, session_id, transcription, notes, reponses, project_id, client_id, user_id, type, devis_id } = await req.json();
    
    // Type par défaut : devis (pour compatibilité)
    const documentType = type || 'devis';

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
        return await handleStart(supabase, { transcription, notes, project_id, client_id, user_id, type: documentType, devis_id });
      
      case "answer":
        return await handleAnswer(supabase, { session_id, reponses, type: documentType });
      
      case "finalize":
        return await handleFinalize(supabase, { session_id, type: documentType });
      
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
  const { transcription, notes, project_id, client_id, user_id, type = 'devis', devis_id } = data;

  console.log(`🚀 Démarrage session IA ${type} pour user:`, user_id);
  
  // Si notes fournies, les compiler en une seule transcription
  let fullTranscription = transcription || '';
  if (notes && notes.length > 0) {
    console.log(`📝 Compilation de ${notes.length} notes`);
    fullTranscription = notes.map((note: any, index: number) => {
      const date = new Date(note.created_at).toLocaleDateString('fr-FR');
      return `[Note ${index + 1} - ${date}]\n${note.transcription}`;
    }).join('\n\n');
  }

  // Si facture et devis_id fourni, ajouter le contexte du devis
  if (type === 'facture' && devis_id) {
    const { data: devis } = await supabase
      .from('devis')
      .select('*, devis_lignes(*)')
      .eq('id', devis_id)
      .single();
    
    if (devis) {
      const devisContext = `\n\n[CONTEXTE DEVIS ${devis.numero}]\n` +
        `Montant TTC: ${devis.montant_ttc}€\n` +
        `Statut: ${devis.statut}\n` +
        (devis.devis_lignes?.length > 0 ? 
          `Lignes:\n${devis.devis_lignes.map((l: any) => `- ${l.description}: ${l.prix_total}€`).join('\n')}\n` : '');
      fullTranscription = devisContext + '\n' + fullTranscription;
    }
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
        type: type, // Stocker le type dans le contexte
        devis_id: devis_id || null,
      },
      status: "pending",
      tour_count: 0,
      type: type, // Stocker le type dans la session
    })
    .select()
    .single();

  if (sessionError) {
    throw new Error(`Erreur création session: ${sessionError.message}`);
  }

  console.log("✅ Session créée:", session.id);

  // Analyser la transcription avec GPT
  const aiResult = await analyzeTranscriptionWithGPT(fullTranscription, null, 1, type);

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

  // Retourner la réponse selon le type
  const response: AIResponse = {
    status: newStatus,
    questions: aiResult.questions,
    session_id: session.id,
    tour_count: 1,
  };

  // Ajouter devis ou facture selon le type
  if (type === 'facture') {
    response.facture = aiResult.devis; // Même structure, juste le nom change
  } else {
    response.devis = aiResult.devis;
  }

  return new Response(JSON.stringify(response), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

// ============================================
// HANDLER : ANSWER (Répondre aux questions)
// ============================================

async function handleAnswer(supabase: any, data: any) {
  const { session_id, reponses, type = 'devis' } = data;

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

  // Récupérer le type depuis la session si non fourni
  const documentType = type || session.type || 'devis';

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
    newTourCount,
    documentType
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

  // Retourner la réponse selon le type
  const response: AIResponse = {
    status: newStatus,
    questions: aiResult.questions,
    session_id,
    tour_count: newTourCount,
  };

  // Ajouter devis ou facture selon le type
  if (documentType === 'facture') {
    response.facture = aiResult.devis;
  } else {
    response.devis = aiResult.devis;
  }

  return new Response(JSON.stringify(response), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

// ============================================
// HANDLER : FINALIZE (Finaliser le devis)
// ============================================

async function handleFinalize(supabase: any, data: any) {
  const { session_id, type } = data;

  console.log("✅ Finalisation session:", session_id);

  // Récupérer la session pour connaître le type
  const { data: session } = await supabase
    .from("devis_ai_sessions")
    .select("type")
    .eq("id", session_id)
    .single();

  const documentType = type || session?.type || 'devis';

  // Récupérer le dernier devis/facture temporaire
  const { data: lastDevis, error: devisError } = await supabase
    .from("devis_temp_ai")
    .select("*")
    .eq("session_id", session_id)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  if (devisError) {
    throw new Error("Document temporaire introuvable");
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

  // Retourner le document final selon le type
  const response: AIResponse = {
    status: "ready",
    questions: [],
    session_id,
    tour_count: lastDevis.version,
  };

  // Ajouter devis ou facture selon le type
  if (documentType === 'facture') {
    response.facture = lastDevis.json_devis;
  } else {
    response.devis = lastDevis.json_devis;
  }

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
  tourNumber: number,
  type: string = 'devis'
): Promise<{ devis: DevisJSON; questions: string[] }> {
  
  const documentType = type === 'facture' ? 'facture' : 'devis';
  console.log(`🤖 Appel GPT-4o-mini (Tour ${tourNumber}, Type: ${documentType})`);

  // Construire le prompt selon le type
  let systemPrompt = type === 'facture' 
    ? `Tu es un expert en facturation pour tous types de prestations professionnelles en France (bâtiment, services, artisanat, etc.).
Ton rôle est de transformer une note vocale en facture structurée et professionnelle.

RÈGLES IMPORTANTES :
1. Génère des prix réalistes basés sur les tarifs moyens français 2025 pour le secteur concerné
2. Une facture est généralement basée sur un devis accepté ou des travaux réalisés
3. Pose des questions GÉNÉRIQUES et PERTINENTES si des informations critiques manquent
4. Maximum 5 questions par tour
5. Si tu as assez d'infos, ne pose AUCUNE question (questions_clarification = [])
6. Utilise les unités appropriées : unité, m², ml, forfait, heure, jour, kg, etc.
7. Adapte-toi au type de prestation (électricité, plomberie, peinture, conseil, formation, etc.)

QUESTIONS GÉNÉRIQUES À POSER SI NÉCESSAIRE :
- Quels travaux ont été effectivement réalisés ?
- Y a-t-il des modifications par rapport au devis initial ?
- Des prestations supplémentaires ont-elles été ajoutées ?
- Le matériel/fournitures sont-ils inclus dans le prix ?
- Y a-t-il des acomptes ou paiements partiels à déduire ?`
    : `Tu es un expert en devis pour tous types de prestations professionnelles en France (bâtiment, services, artisanat, etc.).
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
- Quel est le niveau de finition ou de qualité souhaité ?`;

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

  const documentLabel = type === 'facture' ? 'facture' : 'devis';
  const documentLabelCapitalized = type === 'facture' ? 'Facture' : 'Devis';

  if (tourNumber === 1) {
    // Premier tour : analyse initiale
    userPrompt = type === 'facture'
      ? `Analyse cette note vocale et génère une facture professionnelle :

"${transcription}"

Si des informations critiques manquent pour établir une facture précise, pose des questions génériques et pertinentes.
Sinon, génère une facture complète sans questions.`
      : `Analyse cette note vocale et génère un devis professionnel :

"${transcription}"

Si des informations critiques manquent pour établir un devis précis, pose des questions génériques et pertinentes.
Sinon, génère un devis complet sans questions.`;
  } else {
    // Tours suivants : raffinement avec réponses
    userPrompt = `CONTEXTE :
Transcription initiale : "${transcription}"

${documentLabelCapitalized.toUpperCase()} PRÉCÉDENT :
${JSON.stringify(context?.previousDevis, null, 2)}

RÉPONSES DU PROFESSIONNEL :
${context?.reponses?.join("\n")}

TÂCHE :
Mets à jour le ${documentLabel} en intégrant les réponses.
Si tu as besoin de clarifications supplémentaires, pose des questions génériques (max 5).
Sinon, retourne un ${documentLabel} final sans questions.`;
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

