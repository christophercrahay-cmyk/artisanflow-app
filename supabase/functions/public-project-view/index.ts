// ============================================
// EDGE FUNCTION : VUE PUBLIQUE DE CHANTIER
// ============================================
// Affiche une vue publique (lecture seule) d'un chantier via un token
// Endpoint : /functions/v1/public-project-view?token=...
// ============================================

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ============================================
// FONCTION : Vérifier la validité du lien
// ============================================
async function getPublicLink(token: string) {
  const { data: link, error } = await supabaseAdmin
    .from("project_public_links")
    .select("id, project_id, expires_at, is_revoked")
    .eq("token", token)
    .maybeSingle();

  if (error) throw error;
  return link;
}

function isLinkValid(link: { expires_at: string | null; is_revoked: boolean } | null): boolean {
  if (!link) return false;
  if (link.is_revoked) return false;
  if (link.expires_at) {
    const expiresAt = new Date(link.expires_at).getTime();
    if (expiresAt <= Date.now()) return false;
  }
  return true;
}

// ============================================
// FONCTION : Charger les données du projet
// ============================================
async function loadProjectData(projectId: string) {
  // Charger le projet avec le client
  // Note: postal_code et city peuvent ne pas exister dans tous les schémas
  const { data: project, error: projectError } = await supabaseAdmin
    .from("projects")
    .select(`
      id,
      name,
      address,
      clients:clients (
        id,
        name
      )
    `)
    .eq("id", projectId)
    .maybeSingle();

  if (projectError) throw projectError;
  if (!project) return null;

  // Charger les photos
  const { data: photos, error: photosError } = await supabaseAdmin
    .from("project_photos")
    .select("id, url, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (photosError) throw photosError;

  // Charger les devis
  const { data: devis, error: devisError } = await supabaseAdmin
    .from("devis")
    .select("id, numero, pdf_url, status")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (devisError) throw devisError;

  // Charger les factures
  const { data: factures, error: facturesError } = await supabaseAdmin
    .from("factures")
    .select("id, numero, pdf_url, status")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (facturesError) throw facturesError;

  return {
    project,
    photos: photos || [],
    devis: devis || [],
    factures: factures || [],
  };
}

// ============================================
// FONCTION : Générer le HTML
// ============================================
function generatePublicProjectHtml(data: {
  project: any;
  photos: any[];
  devis: any[];
  factures: any[];
}) {
  const { project, photos, devis, factures } = data;
  const client = project.clients;

  const projectName = project.name || "Chantier";
  const clientName = client?.name || "—";
  const address = project.address || "";

  const fullAddress = address || "";

  // Générer les vignettes photos
  const photosHtml = photos.length > 0
    ? photos
        .map(
          (photo) => `
        <div class="photo-thumbnail">
          <img src="${photo.url}" alt="Photo du chantier" loading="lazy" />
        </div>
      `
        )
        .join("")
    : '<p class="no-data">Aucune photo disponible</p>';

  // Générer les liens devis
  const devisHtml =
    devis.length > 0
      ? devis
          .map(
            (d) => `
        <a href="${d.pdf_url}" target="_blank" class="document-link">
          📄 Télécharger le devis ${d.numero || d.id.substring(0, 8)}
        </a>
      `
          )
          .join("")
      : '<p class="no-data">Aucun devis disponible</p>';

  // Générer les liens factures
  const facturesHtml =
    factures.length > 0
      ? factures
          .map(
            (f) => `
        <a href="${f.pdf_url}" target="_blank" class="document-link">
          📄 Télécharger la facture ${f.numero || f.id.substring(0, 8)}
        </a>
      `
          )
          .join("")
      : '<p class="no-data">Aucune facture disponible</p>';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Suivi de chantier - ${projectName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      color: #F9FAFB;
      min-height: 100vh;
      padding: 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding: 30px 20px;
      background: rgba(15, 23, 42, 0.95);
      border-radius: 16px;
      border: 1px solid rgba(148, 163, 184, 0.18);
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 16px;
      color: #F9FAFB;
    }
    .header .subtitle {
      font-size: 16px;
      color: #9CA3AF;
      margin-top: 8px;
    }
    .section {
      background: rgba(15, 23, 42, 0.95);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      border: 1px solid rgba(148, 163, 184, 0.18);
    }
    .section h2 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #F9FAFB;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .info-row {
      margin-bottom: 12px;
      color: #D1D5DB;
    }
    .info-label {
      font-weight: 600;
      color: #9CA3AF;
      margin-right: 8px;
    }
    .photos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 12px;
      margin-top: 16px;
    }
    .photo-thumbnail {
      aspect-ratio: 1;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid rgba(148, 163, 184, 0.18);
      cursor: pointer;
      transition: transform 0.2s;
    }
    .photo-thumbnail:hover {
      transform: scale(1.05);
    }
    .photo-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .document-link {
      display: inline-block;
      padding: 12px 20px;
      background: #3B82F6;
      color: #FFFFFF;
      text-decoration: none;
      border-radius: 8px;
      margin: 8px 8px 8px 0;
      transition: background 0.2s;
      font-weight: 500;
    }
    .document-link:hover {
      background: #2563EB;
    }
    .no-data {
      color: #9CA3AF;
      font-style: italic;
      margin-top: 8px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding: 20px;
      color: #9CA3AF;
      font-size: 14px;
    }
    @media (max-width: 600px) {
      .photos-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      }
      .header h1 {
        font-size: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📁 ${escapeHtml(projectName)}</h1>
      <div class="subtitle">Suivi de votre chantier</div>
    </div>

    <div class="section">
      <h2>ℹ️ Informations</h2>
      <div class="info-row">
        <span class="info-label">Client :</span>
        <span>${escapeHtml(clientName)}</span>
      </div>
      ${fullAddress ? `<div class="info-row">
        <span class="info-label">Adresse :</span>
        <span>${escapeHtml(fullAddress)}</span>
      </div>` : ""}
    </div>

    <div class="section">
      <h2>📸 Photos du chantier</h2>
      <div class="photos-grid">
        ${photosHtml}
      </div>
    </div>

    <div class="section">
      <h2>📄 Devis</h2>
      ${devisHtml}
    </div>

    <div class="section">
      <h2>🧾 Factures</h2>
      ${facturesHtml}
    </div>

    <div class="footer">
      <p>Cette page est en lecture seule. Pour toute question, contactez votre artisan.</p>
    </div>
  </div>

  <script>
    // Ouvrir les photos en plein écran au clic
    document.querySelectorAll('.photo-thumbnail img').forEach(img => {
      img.addEventListener('click', function() {
        window.open(this.src, '_blank');
      });
    });
  </script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// ============================================
// HANDLER PRINCIPAL
// ============================================
serve(async (req: Request) => {
  try {
    // CORS headers pour permettre l'accès depuis n'importe où
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Récupérer le token depuis les query params
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(
        generateErrorHtml("Lien invalide", "Le token est manquant dans l'URL."),
        {
          status: 400,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    // Vérifier le lien
    const link = await getPublicLink(token);
    if (!link || !isLinkValid(link)) {
      return new Response(
        generateErrorHtml("Lien expiré ou invalide", "Ce lien n'est plus valide ou a été révoqué."),
        {
          status: 403,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    // Charger les données
    const data = await loadProjectData(link.project_id);
    if (!data) {
      return new Response(
        generateErrorHtml("Chantier introuvable", "Le chantier associé à ce lien n'existe plus."),
        {
          status: 404,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    // Générer et retourner le HTML
    const html = generatePublicProjectHtml(data);
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("[public-project-view] Error", error);
    return new Response(
      generateErrorHtml("Erreur serveur", "Une erreur est survenue. Veuillez réessayer plus tard."),
      {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }
});

function generateErrorHtml(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      color: #F9FAFB;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .error-container {
      text-align: center;
      background: rgba(15, 23, 42, 0.95);
      border-radius: 16px;
      padding: 40px;
      border: 1px solid rgba(148, 163, 184, 0.18);
      max-width: 500px;
    }
    .error-container h1 {
      font-size: 24px;
      margin-bottom: 16px;
      color: #EF4444;
    }
    .error-container p {
      color: #9CA3AF;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="error-container">
    <h1>❌ ${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}

