# 📊 ANALYSE DES PATTERNS EDGE FUNCTIONS EXISTANTES

## 🔍 PATTERNS IDENTIFIÉS

### **1. STRUCTURE GLOBALE**

```typescript
// ============================================
// EDGE FUNCTION : [NOM]
// ============================================
// [Description]
// Endpoint : /functions/v1/[nom]
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Configuration
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Types
interface Request { ... }
interface Response { ... }

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
    const body: Request = await req.json();

    // Validation
    if (!body.requiredField) {
      return new Response(
        JSON.stringify({ error: "requiredField requis" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    // Logique métier...

    // Retourner la réponse
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (error: any) {
    console.error("❌ Erreur:", error);
    return new Response(
      JSON.stringify({
        error: "ERROR_CODE",
        message: error?.message || "Erreur inconnue",
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
```

---

### **2. PATTERNS SPÉCIFIQUES**

#### **A. Récupération Clé OpenAI**

```typescript
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

// Vérification au début du try
if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY non configurée");
}
```

#### **B. CORS Headers**

```typescript
// OPTIONS
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

// Toutes les réponses
headers: {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
}
```

#### **C. Parser Body**

```typescript
const body: RequestType = await req.json();
```

#### **D. Validation**

```typescript
if (!body.requiredField) {
  return new Response(
    JSON.stringify({ error: "requiredField requis" }),
    {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    }
  );
}
```

#### **E. Client Supabase**

**Option 1 : Service Role (pour Storage)**
```typescript
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
```

**Option 2 : Token Utilisateur (pour RLS)**
```typescript
const authHeader = req.headers.get("authorization");
if (!authHeader) {
  throw new Error("Token d'authentification manquant");
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    headers: {
      authorization: authHeader,
    },
  },
});
```

#### **F. Appel OpenAI**

```typescript
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${OPENAI_API_KEY}`,
  },
  body: JSON.stringify({
    model: "gpt-4o-mini",
    messages: [...],
    // ...
  }),
});

if (!response.ok) {
  const error = await response.text();
  throw new Error(`Erreur OpenAI: ${error}`);
}

const data = await response.json();
const content = data.choices[0]?.message?.content;
```

#### **G. Gestion d'Erreurs**

```typescript
try {
  // ...
} catch (error: any) {
  console.error("❌ Erreur:", error);
  return new Response(
    JSON.stringify({
      error: "ERROR_CODE",
      message: error?.message || "Erreur inconnue",
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
```

---

### **3. DIFFÉRENCES ENTRE LES DEUX**

| Aspect | ai-import-analyze | ai-devis-conversational |
|--------|-------------------|------------------------|
| **Client Supabase** | Service Role (pour Storage) | Token utilisateur (pour RLS) |
| **Authentification** | Pas de vérification authHeader | Vérifie `authorization` header |
| **Structure** | Fonction unique | Router avec switch/actions |
| **Erreurs** | `{ error: "ANALYZE_FAILED", message }` | `{ error: error.message }` |

---

### **4. RECOMMANDATIONS POUR NOS 3 NOUVELLES FUNCTIONS**

#### **transcribe-audio**
- ✅ Service Role (pour accéder à Storage)
- ✅ Pas besoin de vérifier authHeader (Storage accessible avec service role)
- ✅ Structure simple (pas de router)

#### **correct-text**
- ✅ Pas besoin de Supabase
- ✅ Pas besoin de vérifier authHeader (mais on peut pour logs)
- ✅ Structure simple

#### **analyze-note**
- ✅ Pas besoin de Supabase
- ✅ Pas besoin de vérifier authHeader (mais on peut pour logs)
- ✅ Structure simple

---

## ✅ PATTERN UNIFIÉ À UTILISER

```typescript
// Configuration
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // CORS
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
    // Vérifier clé OpenAI
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY non configurée");
    }

    // Parser body
    const body = await req.json();

    // Validation
    if (!body.requiredField) {
      return new Response(
        JSON.stringify({ error: "requiredField requis" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    // Logique métier...

    // Retourner succès
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (error: any) {
    console.error("❌ Erreur:", error);
    return new Response(
      JSON.stringify({
        error: error?.message || "Erreur inconnue",
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
```

