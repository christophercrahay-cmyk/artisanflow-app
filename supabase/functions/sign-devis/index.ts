// deno-lint-ignore-file no-explicit-any
// Edge Function: sign-devis
// Actions:
//  - { action: "info", token }
//  - { action: "sign", token, name, signatureDataUrl }

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type InfoRequest = { action: "info"; token: string };
type SignRequest = { action: "sign"; token: string; name: string; signatureDataUrl: string };
type SignDevisRequest = InfoRequest | SignRequest;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// 1 — Origines autorisées (peuvent être complétées plus tard, ex: https://sign.artisanflow.app)
const ALLOWED_ORIGINS = [
  "https://*.netlify.app",
  "https://*--*.netlify.app",
];

function patternToRegExp(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  return new RegExp("^" + escaped + "$", "i");
}

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some((p) => patternToRegExp(p).test(origin));
}

function buildCorsHeaders(origin: string | null) {
  const allowOrigin = isAllowedOrigin(origin) ? origin! : "*";
  const corsHeaders = {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
  return corsHeaders;
}

function jsonResponseWithCors(req: Request, body: any, status = 200) {
  const origin = req.headers.get("origin");
  const cors = buildCorsHeaders(origin);
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors,
      "Content-Type": "application/json",
    },
  });
}

async function getLink(token: string) {
  const { data: link, error } = await supabaseAdmin
    .from("devis_signature_links")
    .select("id, devis_id, artisan_id, token, expires_at, used_at")
    .eq("token", token)
    .maybeSingle();
  if (error) throw error;
  return link;
}

async function getDevisPublicInfo(devisId: string) {
  const { data, error } = await supabaseAdmin
    .from("devis")
    .select(`
      id,
      numero,
      signature_status,
      montant_ttc,
      date_creation,
      projects:projects!inner (
        id,
        title,
        clients:clients!inner(
          id,
          name
        ),
        user_id
      )
    `)
    .eq("id", devisId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() <= Date.now();
}

function parseDataUrl(dataUrl: string): Uint8Array {
  const match = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) throw new Error("INVALID_DATA_URL");
  const base64 = match[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function handleInfo(req: Request, token: string) {
  const link = await getLink(token);
  if (!link) return jsonResponseWithCors(req, { ok: false, reason: "not_found" }, 404);
  if (link.used_at) return jsonResponseWithCors(req, { ok: false, reason: "used" }, 400);
  if (isExpired(link.expires_at)) return jsonResponseWithCors(req, { ok: false, reason: "expired" }, 400);

  const devis = await getDevisPublicInfo(link.devis_id);
  if (!devis) return jsonResponseWithCors(req, { ok: false, reason: "not_found" }, 404);

  const { data: artisan, error: artisanErr } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, company_name, company_city, company_address, company_siret, company_tva")
    .eq("id", link.artisan_id)
    .maybeSingle();
  if (artisanErr) throw artisanErr;

  return jsonResponseWithCors(req, {
    ok: true,
    devis: {
      id: devis.id,
      numero: devis.numero,
      montant_ttc: devis.montant_ttc,
      date_creation: devis.date_creation,
      client_name: devis.projects?.clients?.name ?? null,
      project_title: devis.projects?.title ?? null,
    },
    artisan: artisan ?? { id: link.artisan_id },
  });
}

async function handleSign(httpReq: Request, body: SignRequest, ip: string | null, userAgent: string | null) {
  const link = await getLink(body.token);
  if (!link) return jsonResponseWithCors(httpReq, { ok: false, reason: "not_found" }, 404);
  if (link.used_at) return jsonResponseWithCors(httpReq, { ok: false, reason: "used" }, 400);
  if (isExpired(link.expires_at)) return jsonResponseWithCors(httpReq, { ok: false, reason: "expired" }, 400);

  if (!body.name || !body.signatureDataUrl) {
    return jsonResponseWithCors(httpReq, { ok: false, reason: "invalid_payload" }, 400);
  }

  const pngBytes = parseDataUrl(body.signatureDataUrl);
  const path = `devis/${link.devis_id}/${link.token}.png`;
  const { error: uploadErr } = await supabaseAdmin.storage
    .from("signatures")
    .upload(path, pngBytes, { contentType: "image/png", upsert: true });
  if (uploadErr) throw uploadErr;

  const { data: publicUrlData } = supabaseAdmin.storage.from("signatures").getPublicUrl(path);
  const signatureUrl = publicUrlData?.publicUrl ?? null;

  const { error: usedErr } = await supabaseAdmin
    .from("devis_signature_links")
    .update({ used_at: new Date().toISOString() })
    .eq("id", link.id);
  if (usedErr) throw usedErr;

  const { error: devisErr } = await supabaseAdmin
    .from("devis")
    .update({
      signature_status: "signed",
      signed_at: new Date().toISOString(),
      signed_by_name: body.name,
      signed_ip: ip,
      signed_user_agent: userAgent,
      signature_image_url: signatureUrl,
    })
    .eq("id", link.devis_id);
  if (devisErr) throw devisErr;

  return jsonResponseWithCors(httpReq, { ok: true });
}

serve(async (request: Request) => {
  try {
    console.log('📨 Edge Function - Requête reçue');
    console.log('📨 Edge Function - URL:', request.url);
    console.log('📨 Edge Function - Method:', request.method);
    try {
      const cloned = request.clone();
      const bodyPreview = await cloned.json().catch(() => null);
      console.log('📨 Edge Function - Body:', bodyPreview);
    } catch (e) {
      console.log('📨 Edge Function - Body non lisible', e?.message);
    }
  } catch (_e) {
    // ignore logging errors
  }
  if (request.method === "OPTIONS") {
    const origin = request.headers.get("origin");
    const cors = buildCorsHeaders(origin);
    return new Response("OK", { headers: cors });
  }

  try {
    const body = (await request.json()) as SignDevisRequest;
    const { headers } = request;
    const ip = headers.get("x-forwarded-for") ?? headers.get("x-real-ip") ?? null;
    const userAgent = headers.get("user-agent") ?? null;

    if (!body?.action) {
      return jsonResponseWithCors(request, { ok: false, reason: "bad_request" }, 400);
    }

    if (body.action === "info") {
      if (!("token" in body) || !body.token) {
        return jsonResponseWithCors(request, { ok: false, reason: "bad_request" }, 400);
      }
      return await handleInfo(request, body.token);
    }

    if (body.action === "sign") {
      const b = body as SignRequest;
      if (!b.token || !b.name || !b.signatureDataUrl) {
        return jsonResponseWithCors(request, { ok: false, reason: "bad_request" }, 400);
      }
      return await handleSign(request, b, ip, userAgent);
    }

    return jsonResponseWithCors(request, { ok: false, reason: "not_found" }, 404);
  } catch (error: any) {
    console.error("[sign-devis] Error", error);
    return jsonResponseWithCors(request, { ok: false, reason: "server_error", message: error?.message ?? "Error" }, 500);
  }
});


