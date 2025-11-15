// ============================================
// EDGE FUNCTION : ANALYSE D'IMPORT UNIVERSEL
// ============================================
// Analyse n'importe quel fichier (CSV, Excel, PDF, etc.) avec GPT
// et retourne un JSON structuré standardisé
// Endpoint : /functions/v1/ai-import-analyze
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Configuration
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Types (simplifiés pour Deno)
interface ImportAnalyzeRequest {
  fileUrl?: string;
  fileId?: string;
  bucketName?: string;
}

interface ImportAnalysis {
  summary: {
    clients: number;
    projects: number;
    quotes: number;
    invoices: number;
    line_items: number;
    articles: number;
    notes: number;
    unknown_rows: number;
  };
  entities: {
    clients: any[];
    projects: any[];
    quotes: any[];
    invoices: any[];
    line_items: any[];
    articles: any[];
    notes: any[];
  };
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

    // Parser le body
    const body: ImportAnalyzeRequest = await req.json();

    if (!body.fileUrl && !body.fileId) {
      return new Response(
        JSON.stringify({ error: "ANALYZE_FAILED", message: "fileUrl ou fileId requis" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Récupérer le fichier
    let fileContent: string;
    let fileType: string;
    let fileArrayBuffer: ArrayBuffer;

    if (body.fileUrl) {
      // Télécharger depuis URL
      const response = await fetch(body.fileUrl);
      if (!response.ok) {
        throw new Error(`Impossible de télécharger le fichier: ${response.statusText}`);
      }
      fileArrayBuffer = await response.arrayBuffer();
      fileType = detectFileType(body.fileUrl);
    } else if (body.fileId && body.bucketName) {
      // Récupérer depuis Supabase Storage
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data, error } = await supabase.storage
        .from(body.bucketName)
        .download(body.fileId);

      if (error || !data) {
        throw new Error(`Impossible de récupérer le fichier: ${error?.message || "Fichier introuvable"}`);
      }

      fileArrayBuffer = await data.arrayBuffer();
      fileType = detectFileType(body.fileId);
    } else {
      throw new Error("fileId nécessite bucketName");
    }

    // Convertir en texte selon le type (gérer les fichiers binaires)
    if (fileType === "excel") {
      // Excel : pour l'instant, on retourne une erreur claire
      throw new Error(
        "Excel (.xlsx/.xls) n'est pas encore supporté directement en Edge Function. " +
        "Veuillez convertir votre fichier Excel en CSV avant l'import. " +
        "Dans Excel : Fichier → Enregistrer sous → CSV (délimité par des virgules ou point-virgules)"
      );
    }

    // Décoder en UTF-8 pour les fichiers texte
    fileContent = new TextDecoder("utf-8").decode(fileArrayBuffer);

    // Convertir en texte formaté (selon le type)
    const textContent = await extractTextFromFile(fileContent, fileType);

    // Limiter la taille pour GPT (premières lignes / taille max)
    const truncatedText = truncateText(
      textContent,
      800, // Conserver plus de lignes pour les exports volumineux
      200_000 // ~200 KB
    );

    // Pré-normaliser le CSV pour obtenir un tableau propre
    const normalizedText = normalizeCsvForGpt(truncatedText);
    const textForGPT = normalizedText || truncatedText;

    // Appeler GPT avec le schéma JSON strict
    const analysis = await analyzeWithGPT(textForGPT);

    return new Response(JSON.stringify(analysis), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("❌ Erreur analyse import:", error);
    return new Response(
      JSON.stringify({
        error: "ANALYZE_FAILED",
        message: error?.message || "Impossible d'analyser le fichier.",
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

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Détecte le type de fichier depuis l'URL ou le nom
 */
function detectFileType(filePath: string): string {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".csv") || lower.endsWith(".tsv") || lower.endsWith(".txt")) {
    return "csv";
  }
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    return "excel";
  }
  if (lower.endsWith(".pdf")) {
    return "pdf";
  }
  if (lower.endsWith(".json")) {
    return "json";
  }
  return "csv"; // Par défaut
}

/**
 * Extrait le texte d'un fichier selon son type
 */
async function extractTextFromFile(content: string, fileType: string): Promise<string> {
  switch (fileType) {
    case "csv":
    case "tsv":
    case "txt":
      // CSV/TSV : garder tel quel
      return content;

    case "excel":
      // Excel : cette fonction ne devrait jamais être appelée car on gère l'erreur avant
      throw new Error("Excel non supporté (erreur devrait être levée avant)");

    case "json":
      // JSON : convertir en texte lisible
      try {
        const json = JSON.parse(content);
        return JSON.stringify(json, null, 2);
      } catch {
        return content;
      }

    case "pdf":
      throw new Error("PDF non encore supporté. Utilisez CSV ou Excel converti en CSV.");

    default:
      return content;
  }
}

/**
 * Tronque le texte pour limiter la taille de l'input GPT
 */
function truncateText(text: string, maxLines: number, maxBytes: number): string {
  const lines = text.split("\n");
  const truncatedLines = lines.slice(0, maxLines);
  let result = truncatedLines.join("\n");

  // Limiter aussi en bytes
  const encoder = new TextEncoder();
  const bytes = encoder.encode(result);
  if (bytes.length > maxBytes) {
    const truncatedBytes = bytes.slice(0, maxBytes);
    result = new TextDecoder("utf-8").decode(truncatedBytes);
    // S'assurer qu'on ne coupe pas au milieu d'un caractère UTF-8
    const lastNewline = result.lastIndexOf("\n");
    if (lastNewline > 0) {
      result = result.substring(0, lastNewline);
    }
  }

  return result;
}

/**
 * Analyse le contenu avec GPT et retourne un JSON structuré
 */
async function analyzeWithGPT(textContent: string): Promise<ImportAnalysis> {
  const systemPrompt = `Tu es un assistant expert en analyse de données pour ArtisanFlow, une application de gestion pour artisans.

Ta mission : analyser un export de données (peu importe le logiciel source : Obat, Tolteck, EBP, Boby, Excel, etc.) et extraire les entités suivantes :

1. **Clients** : personnes ou entreprises avec nom, email, téléphone, adresse, etc.
2. **Projets/Chantiers** : projets de travaux avec titre, client associé, adresse
3. **Devis** : devis avec montants HT/TTC, dates, clients associés
4. **Factures** : factures avec montants HT/TTC, dates, clients associés
5. **Lignes de devis/factures** : détails des lignes (description, quantité, prix unitaire, TVA)
6. **Articles/Catalogue** : produits/services avec références, libellés, prix
7. **Notes** : notes diverses non catégorisées

**Règles importantes** :
- Si une ligne ne correspond à aucune catégorie, l'ajouter dans "unknown_rows" du summary
- Respecter STRICTEMENT le schéma JSON fourni
- Les champs optionnels peuvent être null
- Les champs requis ne doivent jamais être vides
- Les exports peuvent contenir des colonnes comme "Nom complet", "Adresse email 1", "Téléphone 1", "Adresses", "SIREN", etc. Chaque ligne correspond généralement à un client ou à une entité métier.
- Analyse chaque ligne du tableau même si beaucoup de colonnes sont présentes. Repère les colonnes de nom, emails, téléphones, adresses et utilise-les pour remplir les champs.
- Utilise les colonnes de statut/type/civilité pour remplir les champs "status", "type", "notes" lorsque c'est pertinent.
- Normaliser les formats (dates, montants, etc.) quand possible

Retourne UNIQUEMENT un JSON valide conforme au schéma.`;

  const userPrompt = `Voici le contenu d'un fichier exporté depuis un logiciel de gestion (Obat, Tolteck, EBP, Excel, etc.) :

\`\`\`
${textContent}
\`\`\`

Analyse ce fichier et extrais toutes les entités (clients, projets, devis, factures, lignes, articles, notes) en respectant STRICTEMENT le schéma JSON fourni.

Considère que chaque ligne du tableau correspond à un enregistrement potentiel. Les colonnes peuvent s'appeler "Nom complet", "Adresse email 1", "Adresse email 2", "Téléphone 1", "Téléphone 2", "Notes", "SIREN", etc.`;

  // Schéma JSON pour response_format (OpenAI JSON Schema)
  // IMPORTANT: additionalProperties: false est requis par OpenAI pour les schémas stricts
  const jsonSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      summary: {
        type: "object",
        additionalProperties: false,
        properties: {
          clients: { type: "number" },
          projects: { type: "number" },
          quotes: { type: "number" },
          invoices: { type: "number" },
          line_items: { type: "number" },
          articles: { type: "number" },
          notes: { type: "number" },
          unknown_rows: { type: "number" },
        },
        required: [
          "clients",
          "projects",
          "quotes",
          "invoices",
          "line_items",
          "articles",
          "notes",
          "unknown_rows",
        ],
      },
      entities: {
        type: "object",
        additionalProperties: false,
        properties: {
          clients: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                external_id: { type: ["string", "null"] },
                name: { type: "string" },
                company: { type: ["string", "null"] },
                email: { type: ["string", "null"] },
                phone: { type: ["string", "null"] },
                address: { type: ["string", "null"] },
                postal_code: { type: ["string", "null"] },
                city: { type: ["string", "null"] },
                country: { type: ["string", "null"] },
                type: {
                  type: ["string", "null"],
                  enum: ["particulier", "professionnel", null],
                },
                status: {
                  type: ["string", "null"],
                  enum: ["client", "prospect", "contact", null],
                },
              },
              required: [
                "external_id",
                "name",
                "company",
                "email",
                "phone",
                "address",
                "postal_code",
                "city",
                "country",
                "type",
                "status",
              ],
            },
          },
          projects: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                external_id: { type: ["string", "null"] },
                title: { type: "string" },
                client_name: { type: ["string", "null"] },
                address: { type: ["string", "null"] },
                city: { type: ["string", "null"] },
                postal_code: { type: ["string", "null"] },
              },
              required: [
                "external_id",
                "title",
                "client_name",
                "address",
                "city",
                "postal_code",
              ],
            },
          },
          quotes: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                external_id: { type: ["string", "null"] },
                title: { type: ["string", "null"] },
                client_name: { type: ["string", "null"] },
                project_title: { type: ["string", "null"] },
                date: { type: ["string", "null"] },
                total_ht: { type: ["number", "null"] },
                total_ttc: { type: ["number", "null"] },
                currency: { type: ["string", "null"] },
              },
              required: [
                "external_id",
                "title",
                "client_name",
                "project_title",
                "date",
                "total_ht",
                "total_ttc",
                "currency",
              ],
            },
          },
          invoices: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                external_id: { type: ["string", "null"] },
                client_name: { type: ["string", "null"] },
                project_title: { type: ["string", "null"] },
                date: { type: ["string", "null"] },
                total_ht: { type: ["number", "null"] },
                total_ttc: { type: ["number", "null"] },
                currency: { type: ["string", "null"] },
              },
              required: [
                "external_id",
                "client_name",
                "project_title",
                "date",
                "total_ht",
                "total_ttc",
                "currency",
              ],
            },
          },
          line_items: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                parent_type: {
                  type: ["string", "null"],
                  enum: ["quote", "invoice", null],
                },
                parent_ref: { type: ["string", "null"] },
                description: { type: "string" },
                quantity: { type: ["number", "null"] },
                unit: { type: ["string", "null"] },
                unit_price_ht: { type: ["number", "null"] },
                total_ht: { type: ["number", "null"] },
                vat_rate: { type: ["number", "null"] },
              },
              required: [
                "parent_type",
                "parent_ref",
                "description",
                "quantity",
                "unit",
                "unit_price_ht",
                "total_ht",
                "vat_rate",
              ],
            },
          },
          articles: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                reference: { type: ["string", "null"] },
                label: { type: "string" },
                family: { type: ["string", "null"] },
                unit: { type: ["string", "null"] },
                unit_price_ht: { type: ["number", "null"] },
                vat_rate: { type: ["number", "null"] },
              },
              required: [
                "reference",
                "label",
                "family",
                "unit",
                "unit_price_ht",
                "vat_rate",
              ],
            },
          },
          notes: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                content: { type: "string" },
              },
              required: ["content"],
            },
          },
        },
        required: ["clients", "projects", "quotes", "invoices", "line_items", "articles", "notes"],
      },
    },
    required: ["summary", "entities"],
  };

  // Appel OpenAI
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
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "import_analysis",
          strict: true,
          schema: jsonSchema,
        },
      },
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur OpenAI: ${error}`);
  }

  const result = await response.json();
  const content = result.choices[0]?.message?.content;

  if (!content) {
    throw new Error("Réponse GPT vide");
  }

  // Parser le JSON retourné
  const analysis: ImportAnalysis = JSON.parse(content);

  return analysis;
}

/**
 * Essaie de normaliser un CSV bruité en un tableau simplifié pour GPT
 */
function normalizeCsvForGpt(rawText: string): string | null {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return null;
  }

  const { headerIndex, delimiter } = findHeaderLine(lines);
  if (headerIndex === -1) {
    return null;
  }

  const headerLine = lines[headerIndex];
  const headers = splitCsvLine(headerLine, delimiter);
  if (headers.length === 0) {
    return null;
  }

  const mapping = mapHeaders(headers);
  if (mapping.name === null) {
    return null;
  }

  const outputHeaders = [
    "Nom",
    "Email 1",
    "Email 2",
    "Téléphone 1",
    "Téléphone 2",
    "Adresse",
    "Ville",
    "Notes",
    "Statut",
    "Type",
    "SIREN",
  ];

  const rows: string[] = [outputHeaders.join(";")];

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const values = splitCsvLine(lines[i], delimiter);
    if (values.length === 0) {
      continue;
    }

    const getValue = (index: number | null) =>
      typeof index === "number" && index >= 0 && index < values.length
        ? sanitizeCsvValue(values[index])
        : "";

    const row = [
      getValue(mapping.name),
      getValue(mapping.email1),
      getValue(mapping.email2),
      getValue(mapping.phone1),
      getValue(mapping.phone2),
      getValue(mapping.address),
      getValue(mapping.city),
      getValue(mapping.notes),
      getValue(mapping.status),
      getValue(mapping.type),
      getValue(mapping.siren),
    ];

    if (row[0]) {
      rows.push(row.join(";"));
    }
  }

  if (rows.length <= 1) {
    return null;
  }

  // DEBUG : log entêtes + 2 premières lignes pour inspection rapide
  console.log("[NormalizeCSV] Header:", rows[0]);
  console.log("[NormalizeCSV] Row1:", rows[1] || "-");
  console.log("[NormalizeCSV] Row2:", rows[2] || "-");

  return rows.join("\n");
}

function findHeaderLine(lines: string[]): { headerIndex: number; delimiter: string } {
  const delimiters = [";", ",", "\t", "|"]; // ajout pipe au cas où
  for (let i = 0; i < Math.min(lines.length, 50); i++) {
    const line = lines[i];
    for (const delimiter of delimiters) {
      if (line.split(delimiter).length >= 4) {
        return { headerIndex: i, delimiter };
      }
    }
  }

  return { headerIndex: -1, delimiter: ";" };
}

function splitCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function sanitizeCsvValue(value: string): string {
  return value.replace(/[\r\n;]/g, " ").trim();
}

function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function mapHeaders(headers: string[]): Record<string, number | null> {
  const mapping: Record<string, number | null> = {
    name: null,
    email1: null,
    email2: null,
    phone1: null,
    phone2: null,
    address: null,
    city: null,
    notes: null,
    status: null,
    type: null,
    siren: null,
  };

  headers.forEach((header, index) => {
    const normalized = normalizeHeader(header);

    if (mapping.name === null && /(nom complet|nom|client|contact)/.test(normalized)) {
      mapping.name = index;
      return;
    }
    if (mapping.email1 === null && /(email|courriel|mail|adresse mail)/.test(normalized)) {
      mapping.email1 = index;
      return;
    }
    if (mapping.email2 === null && /(email 2|email secondaire|autre email)/.test(normalized)) {
      mapping.email2 = index;
      return;
    }
    if (mapping.phone1 === null && /(tel|telephone|mobile|gsm)/.test(normalized)) {
      mapping.phone1 = index;
      return;
    }
    if (mapping.phone2 === null && /(tel 2|phone 2|autre tel)/.test(normalized)) {
      mapping.phone2 = index;
      return;
    }
    if (mapping.address === null && /(adresse|adress)/.test(normalized)) {
      mapping.address = index;
      return;
    }
    if (mapping.city === null && /(ville|city)/.test(normalized)) {
      mapping.city = index;
      return;
    }
    if (mapping.notes === null && /(note|commentaire|memo)/.test(normalized)) {
      mapping.notes = index;
      return;
    }
    if (mapping.status === null && /(statut|status)/.test(normalized)) {
      mapping.status = index;
      return;
    }
    if (mapping.type === null && /(type|categorie|category)/.test(normalized)) {
      mapping.type = index;
      return;
    }
    if (mapping.siren === null && /(siren|siret|tva)/.test(normalized)) {
      mapping.siren = index;
      return;
    }
  });

  return mapping;
}

