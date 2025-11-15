// utils/qaRunner.js
// Runner principal pour les tests E2E QA

import { supabase } from '../supabaseClient';
import { generateMockAudioUri, MOCK_TRANSCRIPTION, generateMockImageBase64, createMockClient, createMockProject } from './qaMocks';
import { generateQuoteFromTranscription } from './ai_quote_generator';
import { insertAutoQuote } from './supabase_helpers';
import { generateDevisPDF } from './utils/pdf';

/**
 * Classe principale du QA Runner
 */
export class QARunner {
  constructor() {
    this.runId = `qa_run_${Date.now()}`;
    this.results = {
      runId: this.runId,
      startTime: Date.now(),
      endTime: null,
      duration: null,
      steps: {},
      ids: {},
      errors: [],
    };
    this.createdIds = {
      clientId: null,
      projectId: null,
      noteId: null,
      devisId: null,
      factureId: null,
      photoUrl: null,
      pdfUrl: null,
    };
  }

  /**
   * Log une étape
   */
  log(step, status, data = {}) {
    this.results.steps[step] = {
      status,
      timestamp: Date.now(),
      ...data,
    };
    console.log(`[QA] ${step}: ${status}`, data);
  }

  /**
   * ERREUR
   */
  error(step, error) {
    this.log(step, '❌', { error: error?.message || error });
    this.results.errors.push({ step, error: error?.message || String(error) });
    throw error;
  }

  /**
   * SUCCÈS
   */
  success(step, data = {}) {
    this.log(step, '✅', data);
  }

  /**
   * ÉTAPE 1 : Créer un client de test
   */
  async step1_CreateClient() {
    try {
      // Récupérer l'utilisateur connecté pour RLS
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {throw new Error('Utilisateur non authentifié');}

      const mockClient = createMockClient();
      const { data, error } = await supabase
        .from('clients')
        .insert([{ ...mockClient, user_id: user.id }])
        .select()
        .single();

      if (error) {throw error;}
      this.createdIds.clientId = data.id;
      this.results.ids.client_id = data.id;
      this.success('1_CreateClient', { clientId: data.id });
    } catch (err) {
      this.error('1_CreateClient', err);
    }
  }

  /**
   * ÉTAPE 2 : Créer un chantier de test
   */
  async step2_CreateProject() {
    try {
      // Récupérer l'utilisateur connecté pour RLS
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {throw new Error('Utilisateur non authentifié');}

      const mockProject = createMockProject(this.createdIds.clientId);
      const { data, error } = await supabase
        .from('projects')
        .insert([{ ...mockProject, user_id: user.id }])
        .select()
        .single();

      if (error) {throw error;}
      this.createdIds.projectId = data.id;
      this.results.ids.project_id = data.id;
      this.success('2_CreateProject', { projectId: data.id });
    } catch (err) {
      this.error('2_CreateProject', err);
    }
  }

  /**
   * ÉTAPE 3 : Ajouter une note vocale mock
   */
  async step3_AddMockVoiceNote() {
    try {
      // Récupérer l'utilisateur connecté pour RLS
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {throw new Error('Utilisateur non authentifié');}

      const { data, error } = await supabase
        .from('notes')
        .insert([
          {
            project_id: this.createdIds.projectId,
            client_id: this.createdIds.clientId,
            user_id: user.id, // Nécessaire pour RLS
            type: 'voice',
            transcription: MOCK_TRANSCRIPTION,
            duration_ms: 10000,
          },
        ])
        .select()
        .single();

      if (error) {throw error;}
      this.createdIds.noteId = data.id;
      this.results.ids.note_id = data.id;
      this.success('3_AddMockVoiceNote', { noteId: data.id });
    } catch (err) {
      this.error('3_AddMockVoiceNote', err);
    }
  }

  /**
   * ÉTAPE 4 : Générer devis via IA
   */
  async step4_GenerateDevisIA() {
    try {
      const quoteData = generateQuoteFromTranscription(
        MOCK_TRANSCRIPTION,
        this.createdIds.projectId,
        this.createdIds.clientId,
        20
      );

      if (!quoteData || !quoteData.services || quoteData.services.length === 0) {
        throw new Error('Aucune prestation détectée par l\'IA');
      }

      // Vérifier les totaux
      const { totalHT, totalTTC } = quoteData.totals;
      if (isNaN(totalHT) || isNaN(totalTTC) || totalHT <= 0 || totalTTC <= 0) {
        throw new Error('Totaux invalides calculés par l\'IA');
      }

      const devis = await insertAutoQuote(
        this.createdIds.projectId,
        this.createdIds.clientId,
        quoteData.services,
        quoteData.totals,
        MOCK_TRANSCRIPTION,
        20
      );

      if (!devis) {throw new Error('Échec création devis');}

      this.createdIds.devisId = devis.id;
      this.results.ids.devis_id = devis.id;
      this.results.ids.devis_numero = devis.numero;
      this.success('4_GenerateDevisIA', {
        devisId: devis.id,
        numero: devis.numero,
        totalHT,
        totalTTC,
        nbServices: quoteData.services.length,
      });
    } catch (err) {
      this.error('4_GenerateDevisIA', err);
    }
  }

  /**
   * ÉTAPE 5 : Générer PDF
   */
  async step5_GeneratePDF() {
    try {
      const { data: devisData } = await supabase
        .from('devis')
        .select('*, projects(name), clients(name)')
        .eq('id', this.createdIds.devisId)
        .single();

      const company = {
        name: 'Test Entreprise QA',
        siret: '12345678901234',
        address: 'Test Address',
        phone: '0123456789',
        email: 'test@qa.com',
      };

      const pdfResult = await generateDevisPDF({
        company,
        client: { name: devisData.clients.name },
        project: { title: devisData.projects.name },
        lignes: [],
        tva: 20,
        template: 'classique',
      });

      this.createdIds.pdfUrl = pdfResult.pdfUrl;
      this.results.ids.pdf_url = pdfResult.pdfUrl;

      // Mettre à jour le devis avec l'URL du PDF
      await supabase
        .from('devis')
        .update({ pdf_url: pdfResult.pdfUrl })
        .eq('id', this.createdIds.devisId);

      this.success('5_GeneratePDF', { pdfUrl: pdfResult.pdfUrl });
    } catch (err) {
      this.error('5_GeneratePDF', err);
    }
  }

  /**
   * ÉTAPE 6 : Créer facture depuis devis
   */
  async step6_CreateFacture() {
    try {
      // Récupérer l'utilisateur connecté pour RLS
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {throw new Error('Utilisateur non authentifié');}

      const { data: devisData } = await supabase
        .from('devis')
        .select('*')
        .eq('id', this.createdIds.devisId)
        .single();

      const factureNumber = `FA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const { data, error } = await supabase
        .from('factures')
        .insert([
          {
            project_id: this.createdIds.projectId,
            client_id: this.createdIds.clientId,
            devis_id: this.createdIds.devisId,
            user_id: user.id, // Nécessaire pour RLS
            numero: factureNumber,
            montant_ht: devisData.montant_ht,
            montant_ttc: devisData.montant_ttc,
            tva_percent: devisData.tva_percent,
            statut: 'brouillon',
          },
        ])
        .select()
        .single();

      if (error) {throw error;}

      this.createdIds.factureId = data.id;
      this.results.ids.facture_id = data.id;
      this.results.ids.facture_numero = factureNumber;
      this.success('6_CreateFacture', { factureId: data.id, numero: factureNumber });
    } catch (err) {
      this.error('6_CreateFacture', err);
    }
  }

  /**
   * ÉTAPE 7 : Upload photo mock
   */
  async step7_UploadMockPhoto() {
    try {
      const mockBase64 = generateMockImageBase64();
      // Convertir base64 en bytes (polyfill pour React Native)
      const binaryString = atob(mockBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const fileName = `qa_test/${this.createdIds.projectId}/${Date.now()}.png`;

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('project-photos')
        .upload(fileName, bytes, { contentType: 'image/png', upsert: false });

      if (uploadErr) {throw uploadErr;}

      const { data: urlData } = supabase.storage.from('project-photos').getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;

      // Récupérer l'utilisateur connecté pour RLS
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {throw new Error('Utilisateur non authentifié');}

      await supabase.from('project_photos').insert([
        {
          project_id: this.createdIds.projectId,
          client_id: this.createdIds.clientId,
          user_id: user.id, // Nécessaire pour RLS
          url: publicUrl,
        },
      ]);

      this.createdIds.photoUrl = publicUrl;
      this.results.ids.photo_url = publicUrl;
      this.success('7_UploadMockPhoto', { photoUrl: publicUrl });
    } catch (err) {
      this.error('7_UploadMockPhoto', err);
    }
  }

  /**
   * LANCE LE RUNNER COMPLET
   */
  async runAll() {
    const startTime = Date.now();
    
    try {
      await this.step1_CreateClient();
      await this.step2_CreateProject();
      await this.step3_AddMockVoiceNote();
      await this.step4_GenerateDevisIA();
      await this.step5_GeneratePDF();
      await this.step6_CreateFacture();
      await this.step7_UploadMockPhoto();
    } catch (err) {
      // Erreur déjà loggée
    }

    this.results.endTime = Date.now();
    this.results.duration = this.results.endTime - this.results.startTime;
    
    return this.results;
  }

  /**
   * PURGE tout ce qui a été créé par ce run
   */
  async purge() {
    try {
      // Supprimer dans l'ordre inverse
      if (this.createdIds.factureId) {
        await supabase.from('factures').delete().eq('id', this.createdIds.factureId);
        console.log('[QA] Facture supprimée');
      }

      if (this.createdIds.devisId) {
        await supabase.from('devis').delete().eq('id', this.createdIds.devisId);
        console.log('[QA] Devis supprimé');
      }

      if (this.createdIds.noteId) {
        await supabase.from('notes').delete().eq('id', this.createdIds.noteId);
        console.log('[QA] Note supprimée');
      }

      if (this.createdIds.photoUrl) {
        // Extraire le chemin du storage
        const path = this.createdIds.photoUrl.split('/').slice(-3).join('/');
        await supabase.storage.from('project-photos').remove([path]);
        console.log('[QA] Photo supprimée');
      }

      if (this.createdIds.projectId) {
        await supabase.from('projects').delete().eq('id', this.createdIds.projectId);
        console.log('[QA] Projet supprimé');
      }

      if (this.createdIds.clientId) {
        await supabase.from('clients').delete().eq('id', this.createdIds.clientId);
        console.log('[QA] Client supprimé');
      }

      console.log('[QA] ✅ Purge complète effectuée');
    } catch (err) {
      console.error('[QA] Erreur purge:', err);
      throw err;
    }
  }

  /**
   * Exporte le rapport en JSON
   */
  exportReport() {
    return JSON.stringify(this.results, null, 2);
  }
}

