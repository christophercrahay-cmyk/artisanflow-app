// ============================================
// EDGE FUNCTION : TRAITEMENT D'IMPORT
// ============================================
// Importe les données analysées dans les tables Supabase
// Endpoint : /functions/v1/ai-import-process
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Configuration
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Types (simplifiés pour Deno)
interface ImportProcessRequest {
  analysis: {
    summary: any;
    entities: {
      clients: any[];
      projects: any[];
      quotes: any[];
      invoices: any[];
      line_items: any[];
      articles: any[];
      notes: any[];
    };
  };
  userId?: string;
}

interface ImportProcessResult {
  status: "ok" | "error";
  imported?: {
    clients: number;
    projects: number;
    quotes: number;
    invoices: number;
    line_items: number;
    articles: number;
    notes: number;
  };
  error?: string;
  message?: string;
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
    // Parser le body
    const body: ImportProcessRequest = await req.json();

    if (!body.analysis || !body.analysis.entities) {
      return new Response(
        JSON.stringify({ error: "PROCESS_FAILED", message: "analysis requis" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Récupérer userId depuis l'auth ou le body
    const authHeader = req.headers.get("authorization");
    let userId: string | null = body.userId || null;

    if (!userId && authHeader) {
      // Extraire userId depuis le token JWT si possible
      // Note: En production, valider le token avec Supabase Auth
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      try {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
        if (user) {
          userId = user.id;
        }
      } catch (err) {
        console.warn("Impossible de récupérer userId depuis auth:", err);
      }
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "PROCESS_FAILED", message: "userId requis (auth ou body)" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Créer le client Supabase avec service role pour bypass RLS si nécessaire
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { summary, entities } = body.analysis;
    const result: ImportProcessResult = {
      status: "ok",
      imported: {
        clients: 0,
        projects: 0,
        quotes: 0,
        invoices: 0,
        line_items: 0,
        articles: 0,
        notes: 0,
      },
    };

    // 1. Importer les clients
    if (entities.clients && entities.clients.length > 0) {
      const clientsToInsert = entities.clients.map((client) => ({
        name: client.name || "",
        email: client.email || null,
        phone: client.phone || null,
        address: formatAddress(client),
        user_id: userId,
        // Champs optionnels si la table les supporte
        // type: client.type || null,
        // status: client.status || null,
      }));

      const { data: insertedClients, error: clientsError } = await supabase
        .from("clients")
        .insert(clientsToInsert)
        .select("id, name");

      if (clientsError) {
        console.error("Erreur insertion clients:", clientsError);
        // Continuer avec les autres entités
      } else {
        result.imported!.clients = insertedClients?.length || 0;
        console.log(`✅ ${result.imported!.clients} clients importés`);
      }
    }

    // 2. Importer les projets (nécessite client_id)
    if (entities.projects && entities.projects.length > 0) {
      // Créer un mapping client_name -> client_id
      const { data: allClients } = await supabase
        .from("clients")
        .select("id, name")
        .eq("user_id", userId);

      const clientMap = new Map<string, string>();
      allClients?.forEach((c) => {
        clientMap.set(c.name.toLowerCase().trim(), c.id);
      });

      const projectsToInsert = [];
      for (const project of entities.projects) {
        let clientId: string | null = null;

        // Chercher le client par nom
        if (project.client_name) {
          clientId = clientMap.get(project.client_name.toLowerCase().trim()) || null;
        }

        // Si pas de client trouvé, créer un client par défaut
        if (!clientId) {
          const { data: newClient } = await supabase
            .from("clients")
            .insert({
              name: project.client_name || "Client Import",
              user_id: userId,
            })
            .select("id")
            .single();

          if (newClient) {
            clientId = newClient.id;
            clientMap.set((project.client_name || "Client Import").toLowerCase().trim(), clientId);
          }
        }

        if (clientId) {
          projectsToInsert.push({
            client_id: clientId,
            name: project.title || "Projet Import",
            address: formatAddress(project),
            user_id: userId,
            status: "active",
          });
        }
      }

      if (projectsToInsert.length > 0) {
        const { data: insertedProjects, error: projectsError } = await supabase
          .from("projects")
          .insert(projectsToInsert)
          .select("id, name");

        if (projectsError) {
          console.error("Erreur insertion projects:", projectsError);
        } else {
          result.imported!.projects = insertedProjects?.length || 0;
          console.log(`✅ ${result.imported!.projects} projets importés`);
        }
      }
    }

    // 3. Importer les devis (nécessite project_id et client_id)
    if (entities.quotes && entities.quotes.length > 0) {
      // Récupérer tous les clients et projets pour le mapping
      const { data: allClients } = await supabase
        .from("clients")
        .select("id, name")
        .eq("user_id", userId);

      const { data: allProjects } = await supabase
        .from("projects")
        .select("id, name, client_id")
        .eq("user_id", userId);

      const clientMap = new Map<string, string>();
      allClients?.forEach((c) => {
        clientMap.set(c.name.toLowerCase().trim(), c.id);
      });

      const projectMap = new Map<string, string>();
      allProjects?.forEach((p) => {
        projectMap.set(p.name.toLowerCase().trim(), p.id);
      });

      const devisToInsert = [];

      for (const quote of entities.quotes) {
        let clientId: string | null = null;
        let projectId: string | null = null;

        // Chercher le client par nom
        if (quote.client_name) {
          clientId = clientMap.get(quote.client_name.toLowerCase().trim()) || null;
        }

        // Chercher le projet par titre
        if (quote.project_title) {
          projectId = projectMap.get(quote.project_title.toLowerCase().trim()) || null;
        }

        // Si pas de projet trouvé mais client trouvé, créer un projet par défaut
        if (!projectId && clientId) {
          const { data: newProject } = await supabase
            .from("projects")
            .insert({
              client_id: clientId,
              name: quote.project_title || quote.title || "Projet Import",
              user_id: userId,
              status: "active",
            })
            .select("id, name")
            .single();

          if (newProject) {
            projectId = newProject.id;
            projectMap.set((quote.project_title || quote.title || "Projet Import").toLowerCase().trim(), projectId);
          }
        }

        // Si pas de client trouvé, créer un client par défaut
        if (!clientId) {
          const { data: newClient } = await supabase
            .from("clients")
            .insert({
              name: quote.client_name || "Client Import",
              user_id: userId,
            })
            .select("id, name")
            .single();

          if (newClient) {
            clientId = newClient.id;
            clientMap.set((quote.client_name || "Client Import").toLowerCase().trim(), clientId);

            // Créer aussi le projet si nécessaire
            if (!projectId) {
              const { data: newProject } = await supabase
                .from("projects")
                .insert({
                  client_id: clientId,
                  name: quote.project_title || quote.title || "Projet Import",
                  user_id: userId,
                  status: "active",
                })
                .select("id")
                .single();

              if (newProject) {
                projectId = newProject.id;
              }
            }
          }
        }

        if (clientId && projectId) {
          // Générer un numéro unique
          const numero = generateDevisNumber(userId);

          // Parser la date
          let dateCreation: string | null = null;
          if (quote.date) {
            try {
              const parsedDate = new Date(quote.date);
              if (!isNaN(parsedDate.getTime())) {
                dateCreation = parsedDate.toISOString();
              }
            } catch {
              // Ignorer si date invalide
            }
          }

          const devisData: any = {
            project_id: projectId,
            client_id: clientId,
            numero: numero,
            date_creation: dateCreation || new Date().toISOString(),
            montant_ht: quote.total_ht ? parseFloat(quote.total_ht.toString()) : 0,
            montant_ttc: quote.total_ttc ? parseFloat(quote.total_ttc.toString()) : 0,
            tva_percent: quote.total_ht && quote.total_ttc
              ? ((quote.total_ttc - quote.total_ht) / quote.total_ht) * 100
              : 20.0,
            statut: "brouillon",
          };
          
          // Note: user_id peut ne pas exister dans la table devis
          // Si la colonne n'existe pas, l'insertion échouera avec une erreur claire
          // Exécutez sql/add_user_id_to_devis_factures.sql pour ajouter la colonne
          // Sinon, le RLS fonctionnera via projects.user_id
          
          if (quote.title) {
            devisData.notes = quote.title;
          }

          devisToInsert.push(devisData);

          // Stocker les lignes associées à ce devis (par external_id ou par ordre)
          if (quote.external_id) {
            devisLineItemsMap.set(quote.external_id, []);
          }
        }
      }

      if (devisToInsert.length > 0) {
        const { data: insertedDevis, error: devisError } = await supabase
          .from("devis")
          .insert(devisToInsert)
          .select("id, numero");

        if (devisError) {
          console.error("Erreur insertion devis:", devisError);
        } else {
          result.imported!.quotes = insertedDevis?.length || 0;
          console.log(`✅ ${result.imported!.quotes} devis importés`);

          // 5. Importer les lignes de devis
          if (entities.line_items && entities.line_items.length > 0 && insertedDevis) {
            const lignesToInsert = [];
            const devisIdMap = new Map<string, string>(); // external_id ou index -> devis_id

            // Créer un mapping : external_id du quote -> devis_id
            insertedDevis.forEach((d, index) => {
              const quote = entities.quotes[index];
              if (quote?.external_id) {
                devisIdMap.set(quote.external_id, d.id);
              }
              // Aussi mapper par index pour fallback
              devisIdMap.set(`index_${index}`, d.id);
            });

            // Grouper les lignes par devis
            const lignesByDevis = new Map<string, any[]>();
            let currentDevisIndex = 0;

            for (const lineItem of entities.line_items) {
              let targetDevisId: string | null = null;

              // Si parent_type = "quote", chercher le devis correspondant
              if (lineItem.parent_type === "quote") {
                if (lineItem.parent_ref) {
                  // Chercher par external_id
                  targetDevisId = devisIdMap.get(lineItem.parent_ref) || null;
                } else {
                  // Si pas de parent_ref, associer au devis suivant (par ordre)
                  targetDevisId = devisIdMap.get(`index_${currentDevisIndex}`) || null;
                  // Passer au devis suivant après quelques lignes (heuristique)
                  if (lignesByDevis.get(targetDevisId || "")?.length || 0 > 5) {
                    currentDevisIndex = Math.min(currentDevisIndex + 1, insertedDevis.length - 1);
                    targetDevisId = devisIdMap.get(`index_${currentDevisIndex}`) || null;
                  }
                }
              } else {
                // Pour les autres types, ignorer pour l'instant
                continue;
              }

              if (targetDevisId) {
                if (!lignesByDevis.has(targetDevisId)) {
                  lignesByDevis.set(targetDevisId, []);
                }
                lignesByDevis.get(targetDevisId)!.push(lineItem);
              }
            }

            // Insérer les lignes groupées par devis
            for (const [devisId, lignes] of lignesByDevis.entries()) {
              let ordre = 0;
              for (const lineItem of lignes) {
                ordre++;
                lignesToInsert.push({
                  devis_id: devisId,
                  description: lineItem.description || "",
                  quantite: lineItem.quantity ? parseFloat(lineItem.quantity.toString()) : 1,
                  unite: lineItem.unit || "unité",
                  prix_unitaire: lineItem.unit_price_ht ? parseFloat(lineItem.unit_price_ht.toString()) : 0,
                  prix_total: lineItem.total_ht
                    ? parseFloat(lineItem.total_ht.toString())
                    : (lineItem.unit_price_ht && lineItem.quantity
                        ? parseFloat(lineItem.unit_price_ht.toString()) * parseFloat(lineItem.quantity.toString())
                        : 0),
                  ordre: ordre,
                });
              }
            }

            if (lignesToInsert.length > 0) {
              const { data: insertedLignes, error: lignesError } = await supabase
                .from("devis_lignes")
                .insert(lignesToInsert)
                .select("id");

              if (lignesError) {
                console.error("Erreur insertion lignes devis:", lignesError);
              } else {
                result.imported!.line_items = insertedLignes?.length || 0;
                console.log(`✅ ${result.imported!.line_items} lignes de devis importées`);
              }
            }
          }
        }
      }
    }

    // 4. Importer les factures
    if (entities.invoices && entities.invoices.length > 0) {
      // Récupérer tous les clients et projets pour le mapping
      const { data: allClients } = await supabase
        .from("clients")
        .select("id, name")
        .eq("user_id", userId);

      const { data: allProjects } = await supabase
        .from("projects")
        .select("id, name, client_id")
        .eq("user_id", userId);

      const { data: allDevis } = await supabase
        .from("devis")
        .select("id, numero")
        .eq("user_id", userId);

      const clientMap = new Map<string, string>();
      allClients?.forEach((c) => {
        clientMap.set(c.name.toLowerCase().trim(), c.id);
      });

      const projectMap = new Map<string, string>();
      allProjects?.forEach((p) => {
        projectMap.set(p.name.toLowerCase().trim(), p.id);
      });

      const facturesToInsert = [];

      for (const invoice of entities.invoices) {
        let clientId: string | null = null;
        let projectId: string | null = null;
        let devisId: string | null = null;

        // Chercher le client par nom
        if (invoice.client_name) {
          clientId = clientMap.get(invoice.client_name.toLowerCase().trim()) || null;
        }

        // Chercher le projet par titre
        if (invoice.project_title) {
          projectId = projectMap.get(invoice.project_title.toLowerCase().trim()) || null;
        }

        // Si pas de projet trouvé mais client trouvé, créer un projet par défaut
        if (!projectId && clientId) {
          const { data: newProject } = await supabase
            .from("projects")
            .insert({
              client_id: clientId,
              name: invoice.project_title || "Projet Import",
              user_id: userId,
              status: "active",
            })
            .select("id")
            .single();

          if (newProject) {
            projectId = newProject.id;
          }
        }

        // Si pas de client trouvé, créer un client par défaut
        if (!clientId) {
          const { data: newClient } = await supabase
            .from("clients")
            .insert({
              name: invoice.client_name || "Client Import",
              user_id: userId,
            })
            .select("id")
            .single();

          if (newClient) {
            clientId = newClient.id;

            if (!projectId) {
              const { data: newProject } = await supabase
                .from("projects")
                .insert({
                  client_id: clientId,
                  name: invoice.project_title || "Projet Import",
                  user_id: userId,
                  status: "active",
                })
                .select("id")
                .single();

              if (newProject) {
                projectId = newProject.id;
              }
            }
          }
        }

        if (clientId && projectId) {
          // Générer un numéro unique
          const numero = generateFactureNumber(userId);

          // Parser la date
          let dateCreation: string | null = null;
          if (invoice.date) {
            try {
              const parsedDate = new Date(invoice.date);
              if (!isNaN(parsedDate.getTime())) {
                dateCreation = parsedDate.toISOString();
              }
            } catch {
              // Ignorer si date invalide
            }
          }

          const factureData: any = {
            project_id: projectId,
            client_id: clientId,
            numero: numero,
            date_creation: dateCreation || new Date().toISOString(),
            montant_ht: invoice.total_ht ? parseFloat(invoice.total_ht.toString()) : 0,
            montant_ttc: invoice.total_ttc ? parseFloat(invoice.total_ttc.toString()) : 0,
            tva_percent: invoice.total_ht && invoice.total_ttc
              ? ((invoice.total_ttc - invoice.total_ht) / invoice.total_ht) * 100
              : 20.0,
            statut: "brouillon",
          };
          
          // Note: user_id peut ne pas exister dans la table factures
          // Si la colonne n'existe pas, l'insertion échouera avec une erreur claire
          // Exécutez sql/add_user_id_to_devis_factures.sql pour ajouter la colonne
          // Sinon, le RLS fonctionnera via projects.user_id

          facturesToInsert.push(factureData);
        }
      }

      if (facturesToInsert.length > 0) {
        const { data: insertedFactures, error: facturesError } = await supabase
          .from("factures")
          .insert(facturesToInsert)
          .select("id, numero");

        if (facturesError) {
          console.error("Erreur insertion factures:", facturesError);
        } else {
          result.imported!.invoices = insertedFactures?.length || 0;
          console.log(`✅ ${result.imported!.invoices} factures importées`);
        }
      }
    }

    // 6. Importer les articles/catalogue
    // TODO: Créer table articles si nécessaire
    if (entities.articles && entities.articles.length > 0) {
      console.log(`⚠️ Import articles non encore implémenté (${entities.articles.length} articles ignorés)`);
      // TODO: Créer table articles et mapper
    }

    // 7. Importer les notes
    if (entities.notes && entities.notes.length > 0) {
      // Les notes nécessitent project_id et client_id
      // Pour l'instant, on les ignore ou on les associe au premier projet
      console.log(`⚠️ Import notes non encore implémenté (${entities.notes.length} notes ignorées)`);
      // TODO: Mapper vers table notes avec project_id et client_id
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("❌ Erreur traitement import:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        error: "PROCESS_FAILED",
        message: error?.message || "Impossible de traiter l'import.",
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
 * Formate une adresse depuis les champs address, postal_code, city
 */
function formatAddress(entity: any): string | null {
  const parts = [];
  if (entity.address) parts.push(entity.address);
  if (entity.postal_code && entity.city) {
    parts.push(`${entity.postal_code} ${entity.city}`);
  } else if (entity.postal_code) {
    parts.push(entity.postal_code);
  } else if (entity.city) {
    parts.push(entity.city);
  }
  return parts.length > 0 ? parts.join(", ") : null;
}

/**
 * Génère un numéro de devis unique : DE-YYYY-####
 */
function generateDevisNumber(userId: string): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000); // 4 chiffres
  return `DE-${year}-${random}`;
}

/**
 * Génère un numéro de facture unique : FA-YYYY-####
 */
function generateFactureNumber(userId: string): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000); // 4 chiffres
  return `FA-${year}-${random}`;
}

