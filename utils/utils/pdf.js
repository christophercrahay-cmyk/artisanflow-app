import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../../supabaseClient';
import logger from '../logger';
import { DEFAULT_TEMPLATE, isValidTemplateId } from '../../types/documentTemplates';

/**
 * Génère un numéro de devis unique : DE-YYYY-#### (#### = incrément local simple)
 * Tu pourras plus tard remplacer par un compteur DB.
 */
function generateDevisNumber() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000); // 4 chiffres
  return `DE-${year}-${rand}`;
}

/**
 * Formate la forme juridique pour affichage
 */
function formatLegalForm(legalForm) {
  const forms = {
    'auto_entrepreneur': 'Micro-entreprise',
    'eurl': 'EURL',
    'sarl': 'SARL',
    'sas': 'SAS',
    'sasu': 'SASU',
    'sci': 'SCI',
    'other': 'Autre',
  };
  return forms[legalForm] || legalForm;
}

/**
 * Template HTML/CSS A4 très simple et propre (MVP)
 * - logoUrl optionnel (en <img>)
 * - company : { name, siret, address, phone, email, tvaNumber, legalForm, capitalSocial, insuranceRcp, insuranceDecennale, qualification }
 * - client : { name, address, phone, email }
 * - project : { title, address }
 * - lignes : [{ designation, quantity, unit, unitPriceHT }]
 * - tva : nombre (ex: 20)
 * - template: 'minimal' | 'classique' | 'bandeBleue'
 */
export function buildDevisHTML({ number, dateISO, company, client, project, lignes, tva, logoUrl, template = DEFAULT_TEMPLATE, signature = null }) {
  const companyBlock = `
    <div class="company">
      ${logoUrl ? `<img class="logo" src="${logoUrl}" />` : ''}
      <div>
        <div class="c-name">${company?.name || ''}</div>
        ${company?.siret ? `<div>SIRET : ${company.siret}</div>` : ''}
        ${company?.address ? `<div>${company.address}</div>` : ''}
        ${company?.phone ? `<div>${company.phone}</div>` : ''}
        ${company?.email ? `<div>${company.email}</div>` : ''}
      </div>
    </div>
  `;

  const clientBlock = `
    <div class="block">
      <div class="b-title">Destinataire</div>
      <div><strong>${client?.name || ''}</strong></div>
      ${client?.address ? `<div>${client.address}</div>` : ''}
      ${client?.phone ? `<div>${client.phone}</div>` : ''}
      ${client?.email ? `<div>${client.email}</div>` : ''}
    </div>
  `;

  const projectBlock = `
    <div class="block">
      <div class="b-title">Chantier</div>
      <div><strong>${project?.title || ''}</strong></div>
      ${project?.address ? `<div>${project.address}</div>` : ''}
    </div>
  `;

  // Totaux
  const rows = (lignes || []).map((l) => {
    const q = Number(l.quantity || 0);
    const pu = Number(l.unitPriceHT || 0);
    const total = q * pu;
    return `
      <tr>
        <td>${l.designation || ''}</td>
        <td class="num">${q}</td>
        <td>${l.unit || ''}</td>
        <td class="num">${pu.toFixed(2)} €</td>
        <td class="num">${total.toFixed(2)} €</td>
      </tr>
    `;
  }).join('');

  const totalHT = (lignes || []).reduce((acc, l) => acc + Number(l.quantity || 0) * Number(l.unitPriceHT || 0), 0);
  const tvaRate = Number(tva || 0) / 100;
  const totalTVA = totalHT * tvaRate;
  const totalTTC = totalHT + totalTVA;

  // Styles selon template
  let templateStyles = '';
  const headerClass = 'header';
  const docTitleClass = 'doc-title';

  if (template === 'minimal') {
    // ✅ Template Minimal : Épuré, élégant, sans fioritures
    templateStyles = `
  body { font-family: 'Georgia', 'Times New Roman', serif; color: #111; background: #fff; }
  .header { border-bottom: 3px solid #000; padding-bottom: 20px; margin-bottom: 24px; }
  .company { color: #000; }
  .c-name { font-size: 18px; font-weight: 900; letter-spacing: 1px; }
  .doc-meta { text-align: right; }
  .doc-title { font-size: 26px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase; margin: 0; color: #000; }
  .doc-line { color: #000; font-size: 12px; font-weight: 600; }
  .block { border: 2px solid #000; border-radius: 0; padding: 12px; }
  .b-title { font-weight: 900; text-transform: uppercase; letter-spacing: 2px; font-size: 11px; color: #000; }
  table { border: 2px solid #000; }
  table th { background: #000; color: white; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
  table td { border: 1px solid #ddd; }
  .totals { border: 2px solid #000; border-radius: 0; }
  .totals-row:last-child { border-top: 3px solid #000; background: #000; color: white; font-weight: 900; }
  .legal { border-top: 1px solid #000; padding-top: 12px; margin-top: 18px; font-size: 11px; line-height: 1.6; }
  .legal-title { font-size: 13px; margin-bottom: 12px; color: #000; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 900; }
  .legal-item { margin-bottom: 6px; }
  .legal-item strong { color: #000; font-weight: 800; }
    `;
  } else if (template === 'bandeBleue') {
    // ✅ Template Bande Bleue : Moderne, coloré, professionnel
    templateStyles = `
  body { font-family: 'Arial', 'Helvetica', sans-serif; color: #111; background: #f8f9fa; }
  .header { background: linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%); color: white; padding: 28px; border-radius: 12px; margin-bottom: 28px; box-shadow: 0 4px 12px rgba(29, 78, 216, 0.3); }
  .company { color: white; }
  .c-name { font-size: 20px; font-weight: 800; color: white; }
  .doc-meta { text-align: right; color: white; }
  .doc-title { font-size: 32px; font-weight: 900; margin: 0; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
  .doc-line { color: rgba(255,255,255,0.95); font-weight: 600; font-size: 14px; }
  .grid { margin-top: 20px; }
  .block { border: 3px solid #1D4ED8; border-radius: 10px; padding: 14px; background: white; box-shadow: 0 2px 8px rgba(29, 78, 216, 0.15); }
  .b-title { color: #1D4ED8; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
  table { border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  table th { background: #1D4ED8; color: white; font-weight: 700; padding: 12px; }
  table td { border: 1px solid #e5e7eb; }
  .totals { border: 3px solid #1D4ED8; border-radius: 10px; box-shadow: 0 2px 8px rgba(29, 78, 216, 0.2); }
  .totals-row:last-child { background: linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%); color: white; font-weight: 900; font-size: 16px; }
  .legal { background: #f0f4ff; padding: 16px; border-radius: 8px; border-left: 4px solid #1D4ED8; font-size: 11px; line-height: 1.6; margin-top: 18px; }
  .legal-title { font-size: 13px; margin-bottom: 12px; color: #1D4ED8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800; }
  .legal-item { margin-bottom: 6px; }
  .legal-item strong { color: #1D4ED8; font-weight: 700; }
  .sign { border: 2px dashed #1D4ED8; }
    `;
  } else if (template === 'premiumNoirOr' || template === 'premium') {
    // ✅ Template Premium Noir & Or : Haut de gamme noir & or (compatibilité avec ancien 'premium')
    templateStyles = `
  body { font-family: 'Arial', 'Helvetica', sans-serif; color: #111; background: #fff; }
  .header { background: #000000; color: white; padding: 28px; margin-bottom: 24px; }
  .company { color: white; }
  .c-name { font-size: 22px; font-weight: 900; color: white; margin-bottom: 8px; }
  .company > div > div:not(.c-name) { color: rgba(255,255,255,0.7); font-size: 12px; }
  .doc-meta { text-align: right; color: white; }
  .doc-title { font-size: 32px; font-weight: 900; margin: 0; color: #f4c159; text-transform: uppercase; letter-spacing: 2px; }
  .doc-line { color: rgba(255,255,255,0.85); font-weight: 500; font-size: 13px; }
  .grid { margin-top: 20px; }
  .block { border: 1px solid #e0e0e0; border-radius: 6px; padding: 14px; background: #F6F6F9; }
  .b-title { font-weight: 800; color: #000000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
  table { border-collapse: collapse; margin-top: 16px; }
  table th { background: #000000; color: white; font-weight: 700; padding: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-size: 11px; }
  table td { border: 1px solid #e0e0e0; padding: 10px; background: white; }
  table tbody tr:nth-child(even) td { background: #FAFAFC; }
  .totals { border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden; }
  .totals-row { border-bottom: 1px solid #e0e0e0; }
  .totals-row:last-child { background: #f4c159; color: #000000; font-weight: 900; font-size: 16px; border-bottom: none; }
  .legal { margin-top: 24px; font-size: 11px; line-height: 1.6; padding: 16px; background: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb; }
  .legal-title { font-size: 13px; margin-bottom: 12px; color: #000000; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800; }
  .legal-item { margin-bottom: 6px; }
  .legal-item strong { color: #000000; font-weight: 700; }
  .sign { border: 1px solid #e0e0e0; border-radius: 6px; }
    `;
  } else if (template === 'bleuElectrique') {
    // ✅ Template Bleu Électrique : En-tête bleu électrique
    templateStyles = `
  body { font-family: 'Arial', 'Helvetica', sans-serif; color: #111; background: #fff; }
  .header { background: linear-gradient(135deg, #0066ff 0%, #0052cc 100%); color: white; padding: 28px; border-radius: 12px; margin-bottom: 28px; box-shadow: 0 4px 12px rgba(0, 102, 255, 0.3); border-bottom: 4px solid #0066ff; }
  .company { color: white; }
  .c-name { font-size: 20px; font-weight: 800; color: white; }
  .doc-meta { text-align: right; color: white; }
  .doc-title { font-size: 32px; font-weight: 900; margin: 0; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
  .doc-line { color: rgba(255,255,255,0.95); font-weight: 600; font-size: 14px; }
  .grid { margin-top: 20px; }
  .block { border: 2px solid #0066ff; border-radius: 10px; padding: 14px; background: white; box-shadow: 0 2px 8px rgba(0, 102, 255, 0.15); }
  .b-title { color: #0066ff; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
  table { border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 2px solid #0066ff; }
  table th { background: #0066ff; color: white; font-weight: 700; padding: 12px; }
  table td { border: 1px solid #e5e7eb; }
  .totals { border: 2px solid #0066ff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0, 102, 255, 0.2); }
  .totals-row:last-child { background: linear-gradient(135deg, #0066ff 0%, #0052cc 100%); color: white; font-weight: 900; font-size: 16px; }
  .legal { background: #e6f2ff; padding: 16px; border-radius: 8px; border-left: 4px solid #0066ff; font-size: 11px; line-height: 1.6; margin-top: 18px; }
  .legal-title { font-size: 13px; margin-bottom: 12px; color: #0066ff; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800; }
  .legal-item { margin-bottom: 6px; }
  .legal-item strong { color: #0066ff; font-weight: 700; }
  .sign { border: 2px dashed #0066ff; }
    `;
  } else if (template === 'graphite') {
    // ✅ Template Graphite : Gris foncé, lignes fines, style moderne et sobre
    templateStyles = `
  body { font-family: 'Arial', 'Helvetica', sans-serif; color: #111; background: #fff; }
  .header { background: #222222; color: white; padding: 28px; margin-bottom: 24px; }
  .company { color: white; }
  .c-name { font-size: 20px; font-weight: 800; color: white; }
  .doc-meta { text-align: right; color: white; }
  .doc-title { font-size: 28px; font-weight: 900; margin: 0; color: white; }
  .doc-line { color: rgba(255,255,255,0.9); font-weight: 500; font-size: 13px; }
  .grid { margin-top: 20px; }
  .block { border: 1px solid #555555; border-radius: 6px; padding: 14px; background: #f9fafb; }
  .b-title { font-weight: 800; color: #222222; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
  table { border-collapse: collapse; margin-top: 16px; border: 1px solid #555555; }
  table th { background: #222222; color: white; font-weight: 700; padding: 12px; border: 1px solid #555555; }
  table td { border: 1px solid #555555; padding: 10px; background: white; }
  .totals { border: 1px solid #555555; border-radius: 6px; overflow: hidden; }
  .totals-row { border-bottom: 1px solid #555555; }
  .totals-row:last-child { background: #222222; color: white; font-weight: 900; font-size: 16px; border-bottom: none; }
  .legal { margin-top: 24px; font-size: 11px; line-height: 1.6; padding: 16px; background: #f9fafb; border-radius: 6px; border: 1px solid #555555; }
  .legal-title { font-size: 13px; margin-bottom: 12px; color: #222222; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800; }
  .legal-item { margin-bottom: 6px; }
  .legal-item strong { color: #222222; font-weight: 700; }
  .sign { border: 1px solid #555555; border-radius: 6px; }
    `;
  } else if (template === 'ecoVert') {
    // ✅ Template Éco Vert : Accents verts, idéal pour travaux énergie / éco
    templateStyles = `
  body { font-family: 'Arial', 'Helvetica', sans-serif; color: #111; background: #fff; }
  .header { border-bottom: 3px solid #2e7d32; padding-bottom: 20px; margin-bottom: 24px; }
  .company { color: #111; }
  .c-name { font-size: 20px; font-weight: 800; color: #111; }
  .doc-meta { text-align: right; }
  .doc-title { font-size: 28px; font-weight: 900; margin: 0; color: #2e7d32; text-transform: uppercase; }
  .doc-line { color: #666; font-weight: 500; font-size: 13px; }
  .grid { margin-top: 20px; }
  .block { border: 2px solid #2e7d32; border-radius: 8px; padding: 14px; background: #f1f8f4; }
  .b-title { font-weight: 800; color: #2e7d32; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
  table { border-collapse: collapse; margin-top: 16px; border: 1px solid #2e7d32; }
  table th { background: #2e7d32; color: white; font-weight: 700; padding: 12px; }
  table td { border: 1px solid #c8e6c9; padding: 10px; background: white; }
  .totals { border: 2px solid #2e7d32; border-radius: 8px; overflow: hidden; }
  .totals-row { border-bottom: 1px solid #c8e6c9; }
  .totals-row:last-child { background: #2e7d32; color: white; font-weight: 900; font-size: 16px; border-bottom: none; }
  .legal { margin-top: 24px; font-size: 11px; line-height: 1.6; padding: 16px; background: #f1f8f4; border-radius: 8px; border-left: 4px solid #2e7d32; }
  .legal-title { font-size: 13px; margin-bottom: 12px; color: #2e7d32; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800; }
  .legal-item { margin-bottom: 6px; }
  .legal-item strong { color: #2e7d32; font-weight: 700; }
  .sign { border: 2px dashed #2e7d32; border-radius: 6px; }
    `;
  } else if (template === 'chantierOrange') {
    // ✅ Template Chantier Orange : Codes couleur BTP, titres orange, très lisible
    templateStyles = `
  body { font-family: 'Arial', 'Helvetica', sans-serif; color: #111; background: #fff; }
  .header { border-bottom: 4px solid #f57c00; padding-bottom: 20px; margin-bottom: 24px; }
  .company { color: #111; }
  .c-name { font-size: 22px; font-weight: 900; color: #111; }
  .doc-meta { text-align: right; }
  .doc-title { font-size: 32px; font-weight: 900; margin: 0; color: #f57c00; text-transform: uppercase; letter-spacing: 2px; }
  .doc-line { color: #666; font-weight: 600; font-size: 13px; }
  .grid { margin-top: 20px; }
  .block { border: 3px solid #f57c00; border-radius: 8px; padding: 14px; background: #fff8f0; }
  .b-title { font-weight: 900; color: #f57c00; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
  table { border-collapse: collapse; margin-top: 16px; border: 3px solid #f57c00; }
  table th { background: #f57c00; color: white; font-weight: 800; padding: 14px; text-transform: uppercase; letter-spacing: 1px; font-size: 12px; border: 2px solid #e65100; }
  table td { border: 2px solid #ffb74d; padding: 12px; background: white; }
  .totals { border: 3px solid #f57c00; border-radius: 8px; overflow: hidden; }
  .totals-row { border-bottom: 2px solid #ffb74d; }
  .totals-row:last-child { background: #f57c00; color: white; font-weight: 900; font-size: 18px; border-bottom: none; }
  .legal { margin-top: 24px; font-size: 11px; line-height: 1.6; padding: 16px; background: #fff8f0; border-radius: 8px; border-left: 4px solid #f57c00; }
  .legal-title { font-size: 14px; margin-bottom: 12px; color: #f57c00; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 900; }
  .legal-item { margin-bottom: 6px; }
  .legal-item strong { color: #f57c00; font-weight: 800; }
  .sign { border: 3px dashed #f57c00; border-radius: 6px; }
    `;
  } else if (template === 'architecte') {
    // ✅ Template Architecte : Police fine, beaucoup de blanc, look cabinet d'étude
    templateStyles = `
  body { font-family: 'Georgia', 'Times New Roman', serif; color: #111; background: #fff; }
  .header { border-bottom: 1px solid #e0e0e0; padding-bottom: 24px; margin-bottom: 32px; }
  .company { color: #111; }
  .c-name { font-size: 18px; font-weight: 400; color: #111; letter-spacing: 0.5px; }
  .doc-meta { text-align: right; }
  .doc-title { font-size: 24px; font-weight: 300; margin: 0; color: #111; letter-spacing: 3px; }
  .doc-line { color: #666; font-weight: 300; font-size: 12px; }
  .grid { margin-top: 24px; }
  .block { border: 1px solid #e0e0e0; border-radius: 0; padding: 20px; background: #fff; }
  .b-title { font-weight: 400; color: #111; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; }
  table { border-collapse: collapse; margin-top: 24px; border: 1px solid #e0e0e0; }
  table th { background: #fafafa; color: #111; font-weight: 400; padding: 14px; text-transform: uppercase; letter-spacing: 1px; font-size: 10px; border-bottom: 1px solid #e0e0e0; }
  table td { border-bottom: 1px solid #f0f0f0; padding: 14px; background: white; }
  .totals { border: 1px solid #e0e0e0; border-radius: 0; overflow: hidden; margin-top: 24px; }
  .totals-row { border-bottom: 1px solid #f0f0f0; padding: 14px; }
  .totals-row:last-child { background: #fafafa; color: #111; font-weight: 400; font-size: 14px; border-bottom: none; }
  .legal { margin-top: 32px; font-size: 10px; line-height: 1.8; padding: 20px; background: #fff; border-top: 1px solid #e0e0e0; }
  .legal-title { font-size: 11px; margin-bottom: 16px; color: #111; text-transform: uppercase; letter-spacing: 2px; font-weight: 400; }
  .legal-item { margin-bottom: 8px; }
  .legal-item strong { color: #111; font-weight: 400; }
  .sign { border: 1px dashed #e0e0e0; border-radius: 0; }
    `;
  } else if (template === 'filigraneLogo') {
    // ✅ Template Filigrane Logo : Template clair avec le logo en fond discret
    templateStyles = `
  body { font-family: 'Arial', 'Helvetica', sans-serif; color: #111; background: #fff; }
  .header { border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 24px; }
  .company { color: #111; }
  .c-name { font-size: 20px; font-weight: 700; color: #111; }
  .doc-meta { text-align: right; }
  .doc-title { font-size: 26px; font-weight: 800; margin: 0; color: #111; }
  .doc-line { color: #666; font-weight: 500; font-size: 13px; }
  .grid { margin-top: 20px; }
  .block { border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; background: #f9fafb; }
  .b-title { font-weight: 700; color: #374151; font-size: 12px; }
  table { border-collapse: collapse; margin-top: 16px; border: 1px solid #e5e7eb; background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IiNmOWZhZmIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5MT0dPPC90ZXh0Pjwvc3ZnPg=='); background-repeat: no-repeat; background-position: center; background-size: 200px; opacity: 0.05; }
  table th { background: #f3f4f6; color: #111; font-weight: 700; padding: 12px; border: 1px solid #e5e7eb; }
  table td { border: 1px solid #e5e7eb; padding: 10px; background: white; }
  .totals { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
  .totals-row { border-bottom: 1px solid #e5e7eb; }
  .totals-row:last-child { background: #f3f4f6; font-weight: 800; font-size: 16px; border-bottom: none; }
  .legal { margin-top: 24px; font-size: 11px; line-height: 1.6; padding: 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; }
  .legal-title { font-size: 13px; margin-bottom: 12px; color: #111; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800; }
  .legal-item { margin-bottom: 6px; }
  .legal-item strong { color: #374151; font-weight: 700; }
  .sign { border: 1px dashed #e5e7eb; border-radius: 6px; }
    `;
  } else { // classique
    // ✅ Template Classique : Équilibré, professionnel, standard
    templateStyles = `
  body { font-family: 'Arial', 'Helvetica', sans-serif; color: #111; background: #fff; }
  .header { display:flex; justify-content: space-between; align-items:flex-start; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
  .doc-title { font-size: 24px; font-weight: 800; margin: 0; color: #1D4ED8; }
  .doc-line { color: #666; font-size: 13px; }
  .block { border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; background: #f9fafb; }
  .b-title { font-weight: 700; color: #374151; font-size: 12px; }
  table th { background: #f3f4f6; color: #111; font-weight: 700; }
  .totals { border: 1px solid #e5e7eb; border-radius: 6px; }
  .totals-row:last-child { background: #f3f4f6; font-weight: 800; }
    `;
  }

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Devis ${number}</title>
<style>
  @page { size: A4; margin: 24mm; }
  ${templateStyles}
  
  .header { display:flex; justify-content: space-between; align-items:flex-start; margin-bottom: 18px; }
  .company { display:flex; gap:14px; align-items:flex-start; }
  .logo { width: 80px; height: 80px; object-fit: contain; border: 1px solid #eee; }
  .c-name { font-weight: 700; font-size: 16px; margin-bottom: 4px; }

  .doc-meta { text-align: right; }

  .grid { display:flex; gap:16px; margin-top: 12px; }
  .block { flex:1; border:1px solid #eee; padding:10px; border-radius:8px; }
  .b-title { font-weight:700; margin-bottom: 6px; }

  table { width:100%; border-collapse: collapse; margin-top: 16px; }
  th, td { border: 1px solid #eaeaea; padding: 8px; font-size: 13px; }
  th { background:#f6f7fb; text-align:left; }
  .num { text-align: right; white-space: nowrap; }

  .totals { width: 320px; margin-left:auto; margin-top: 12px; border:1px solid #eee; border-radius: 8px; overflow:hidden; }
  .totals-row { display:flex; justify-content: space-between; padding: 8px 10px; border-bottom: 1px solid #eee; }
  .totals-row:last-child { border-bottom: none; background:#f6f7fb; font-weight:700; }

  .legal { margin-top: 18px; font-size: 11px; color:#555; line-height: 1.6; padding: 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; }
  .legal-title { font-size: 13px; margin-bottom: 12px; color: #111; text-transform: uppercase; letter-spacing: 0.5px; }
  .legal-item { margin-bottom: 6px; padding-left: 0; }
  .legal-item strong { color: #374151; font-weight: 600; }
  .sign { margin-top: 28px; border:1px dashed #bbb; height: 80px; display:flex; align-items:center; justify-content:center; color:#777; border-radius: 8px; }
  .signature-block { page-break-before: always; page-break-inside: avoid; margin-top: 20px; padding: 15px; border: 2px solid #333; border-radius: 8px; background: #f9fafb; }
  .signature-title { font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; color: #111; }
  .signature-info { font-size: 11px; color: #555; margin-bottom: 8px; }
  .signature-image { max-width: 400px; max-height: 200px; margin-top: 10px; border: 1px solid #ccc; border-radius: 4px; padding: 5px; filter: brightness(0) saturate(100%); }
</style>
</head>
<body>
  <div class="header">
    ${companyBlock}
    <div class="doc-meta">
      <h1 class="doc-title">DEVIS</h1>
      <div class="doc-line">Numéro : <strong>${number}</strong></div>
      <div class="doc-line">Date : ${dateISO}</div>
    </div>
  </div>

  <div class="grid">
    ${clientBlock}
    ${projectBlock}
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:52%;">Désignation</th>
        <th style="width:8%;">Qté</th>
        <th style="width:10%;">Unité</th>
        <th style="width:15%;">PU HT</th>
        <th style="width:15%;">Total HT</th>
      </tr>
    </thead>
    <tbody>
      ${rows || ''}
      ${rows ? '' : `<tr><td colspan="5" style="text-align:center;color:#777;">(Aucune ligne)</td></tr>`}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row"><div>Total HT</div><div>${totalHT.toFixed(2)} €</div></div>
    <div class="totals-row"><div>TVA ${Number(tva||0).toFixed(0)}%</div><div>${totalTVA.toFixed(2)} €</div></div>
    <div class="totals-row"><div>Total TTC</div><div>${totalTTC.toFixed(2)} €</div></div>
  </div>

  <div class="legal">
    <div class="legal-title"><strong>Conditions Générales de Vente</strong></div>
    
    <div class="legal-item">
      <strong>• Validité :</strong> 30 jours à compter de la date d'émission.
    </div>
    
    <div class="legal-item">
      <strong>• Conditions de paiement :</strong> Acompte de 30% à la commande – Solde à la fin des travaux.
    </div>
    
    <div class="legal-item">
      <strong>• Délai de rétractation :</strong> 14 jours pour les particuliers (Code de la consommation, art. L221-18).
    </div>
    
    <div class="legal-item">
      <strong>• Pénalités de retard :</strong> En cas de retard de paiement, des pénalités égales à trois fois le taux d'intérêt légal en vigueur seront appliquées (décret 2009-138).
    </div>
    
    <div class="legal-item">
      <strong>• Indemnité forfaitaire de recouvrement :</strong> 40€ en cas de retard de paiement (décret 2012-1115).
    </div>
    
    ${company?.tvaNumber ? `<div class="legal-item"><strong>• TVA intra :</strong> ${company.tvaNumber}</div>` : ''}
    
    ${company?.legalForm ? `<div class="legal-item"><strong>• Forme juridique :</strong> ${formatLegalForm(company.legalForm)}${company.capitalSocial ? ` – Capital social : ${company.capitalSocial}` : ''}</div>` : ''}
    
    ${company?.insuranceRcp ? `<div class="legal-item"><strong>• Assurance RCP :</strong> ${company.insuranceRcp}</div>` : ''}
    
    ${company?.insuranceDecennale ? `<div class="legal-item"><strong>• Assurance décennale :</strong> ${company.insuranceDecennale}</div>` : ''}
    
    ${company?.qualification ? `<div class="legal-item"><strong>• Qualification :</strong> ${company.qualification}</div>` : ''}
  </div>

  ${signature ? `
    <div class="signature-block">
      <div class="signature-title">Signé électroniquement</div>
      <div class="signature-info">Signé par : <strong>${signature.signerName || signature.signed_by_name || ''}</strong></div>
      <div class="signature-info">Email : ${signature.signerEmail || signature.signed_by_email || ''}</div>
      <div class="signature-info">Le : ${signature.signedAt ? new Date(signature.signedAt).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' }) : ''}</div>
      ${signature.signatureImageBase64 ? `<img src="${signature.signatureImageBase64}" alt="Signature" class="signature-image" />` : ''}
    </div>
  ` : `
    <div class="sign">Signature du client</div>
  `}
</body>
</html>
`;
}

/**
 * Génère un PDF à partir d'un devis existant dans la BDD
 * Récupère automatiquement les lignes depuis devis_lignes
 * @param {string} devisId - ID du devis dans la table `devis`
 * @returns {Promise<{pdfUrl: string, number: string, localUri: string}>}
 */
export async function generateDevisPDFFromDB(devisId) {
  try {
    logger.info('PDF', `Génération PDF pour devis ${devisId}`);

    // 1. Récupérer le devis
    const { data: devis, error: devisError } = await supabase
      .from('devis')
      .select('*, projects(*), clients(*)')
      .eq('id', devisId)
      .single();

    if (devisError || !devis) {
      throw new Error(`Devis introuvable: ${devisError?.message || 'ID invalide'}`);
    }

    // 2. Récupérer les lignes
    const { data: lignes, error: lignesError } = await supabase
      .from('devis_lignes')
      .select('*')
      .eq('devis_id', devisId)
      .order('ordre', { ascending: true });

    if (lignesError) {
      throw new Error(`Erreur récupération lignes: ${lignesError.message}`);
    }

    if (!lignes || lignes.length === 0) {
      throw new Error('Aucune ligne de devis trouvée');
    }

    logger.info('PDF', `${lignes.length} lignes récupérées`);

    // 3. Récupérer les paramètres entreprise depuis brand_settings
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    const { data: brandSettings } = await supabase
      .from('brand_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(); // Utiliser maybeSingle() pour gérer l'absence de données

    // Construire l'adresse complète (adresse + ville)
    const addressParts = [];
    if (brandSettings?.company_address) {
      addressParts.push(brandSettings.company_address);
    }
    if (brandSettings?.company_city) {
      addressParts.push(brandSettings.company_city);
    }
    const fullAddress = addressParts.join(', ');

    const company = {
      name: brandSettings?.company_name || 'Mon Entreprise',
      siret: brandSettings?.company_siret || '',
      address: fullAddress || '',
      phone: brandSettings?.company_phone || '',
      email: brandSettings?.company_email || '',
      
      // ✅ Champs légaux (conformité devis/factures)
      tvaNumber: brandSettings?.company_tva_number || null,
      legalForm: brandSettings?.legal_form || null,
      capitalSocial: brandSettings?.capital_social || null,
      
      // Format assurance RCP
      insuranceRcp: brandSettings?.insurance_rcp_provider && brandSettings?.insurance_rcp_policy
        ? `${brandSettings.insurance_rcp_provider} – Police n°${brandSettings.insurance_rcp_policy}`
        : null,
      
      // Format assurance décennale
      insuranceDecennale: brandSettings?.insurance_decennale_provider && brandSettings?.insurance_decennale_policy
        ? `${brandSettings.insurance_decennale_provider} – Police n°${brandSettings.insurance_decennale_policy}`
        : null,
      
      qualification: brandSettings?.professional_qualification || null,
    };

    // Récupérer le template depuis les settings (avec validation)
    let templateRaw = brandSettings?.template_default || DEFAULT_TEMPLATE;
    
    // ✅ Compatibilité : mapper l'ancien 'premium' vers 'premiumNoirOr'
    if (templateRaw === 'premium') {
      templateRaw = 'premiumNoirOr';
    }
    
    const template = isValidTemplateId(templateRaw) ? templateRaw : DEFAULT_TEMPLATE;

    const client = {
      name: devis.clients?.name || '',
      address: devis.clients?.address || '',
      phone: devis.clients?.phone || '',
      email: devis.clients?.email || '',
    };

    const project = {
      title: devis.projects?.title || '',
      address: devis.projects?.address || '',
      id: devis.project_id,
    };

    // Récupérer les informations de signature si le devis est signé
    let signature = null;
    if (devis.signature_status === 'signed') {
      logger.info('PDF', '🔍 Devis signé détecté, récupération des infos de signature', {
        devisId,
        signed_by_name: devis.signed_by_name,
        signed_at: devis.signed_at,
        signature_image_url: devis.signature_image_url,
      });

      // Récupérer la dernière signature (si elle existe encore en base)
      const { data: signatureData } = await supabase
        .from('devis_signatures')
        .select('*')
        .eq('devis_id', devisId)
        .order('signed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      logger.info('PDF', '🔍 Signature data depuis devis_signatures', {
        hasSignatureData: !!signatureData,
        hasSignatureImageBase64: !!signatureData?.signature_image_base64,
      });

      const signerName = devis.signed_by_name || signatureData?.signer_name || null;
      const signerEmail = devis.signed_by_email || signatureData?.signer_email || null;
      const signedAt = devis.signed_at || signatureData?.signed_at || null;

      // L'image peut venir soit de la table devis_signatures (data URL),
      // soit de la colonne devis.signature_image_url (URL Storage générée par l'Edge Function)
      const signatureImageSource =
        signatureData?.signature_image_base64 ||
        devis.signature_image_url ||
        null;

      logger.info('PDF', '🔍 Source image signature déterminée', {
        signatureImageSource: signatureImageSource ? (signatureImageSource.substring(0, 50) + '...') : null,
        isDataUrl: signatureImageSource?.startsWith('data:image') || false,
        isHttpUrl: signatureImageSource?.startsWith('http') || false,
      });

      let signatureImageBase64 = null;

      if (signatureImageSource) {
        if (typeof signatureImageSource === 'string' && signatureImageSource.startsWith('data:image')) {
          // Déjà une data URL prête à être injectée dans le PDF
          logger.info('PDF', '✅ Signature déjà en data URL, utilisation directe');
          signatureImageBase64 = signatureImageSource;
        } else if (typeof signatureImageSource === 'string') {
          // URL HTTP(s) vers Storage → extraire le path et générer une URL signée
          logger.info('PDF', '🔍 DEBUT téléchargement signature depuis URL', {
            url: signatureImageSource,
            devisId,
          });
          try {
            // Extraire le bucket et le path depuis l'URL publique Supabase Storage
            // Format: https://{project-ref}.supabase.co/storage/v1/object/public/{bucket}/{path}
            const urlMatch = signatureImageSource.match(/\/storage\/v1\/object\/public\/([^\/]+)\/(.+)$/);
            let downloadUrl = signatureImageSource;
            
            if (urlMatch) {
              const bucketName = urlMatch[1];
              const filePath = urlMatch[2];
              
              logger.info('PDF', '🔍 Extraction path depuis URL publique', {
                bucketName,
                filePath,
              });
              
              // Générer une URL signée (valide 1 heure)
              const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                .from(bucketName)
                .createSignedUrl(filePath, 3600);
              
              if (signedUrlError) {
                logger.error('PDF', '❌ Erreur génération URL signée', signedUrlError);
                throw new Error(`Impossible de générer l'URL signée: ${signedUrlError.message}`);
              }
              
              downloadUrl = signedUrlData.signedUrl;
              logger.info('PDF', '✅ URL signée générée', {
                originalUrl: signatureImageSource.substring(0, 80) + '...',
                signedUrl: downloadUrl.substring(0, 80) + '...',
              });
            } else {
              logger.warn('PDF', '⚠️ URL ne correspond pas au format Supabase Storage, utilisation directe', {
                url: signatureImageSource,
              });
            }
            
            const fileName = `signature_${devisId}_${Date.now()}.png`;
            const downloadPath = `${FileSystem.cacheDirectory}${fileName}`;

            logger.info('PDF', '📥 Téléchargement en cours...', { downloadPath, downloadUrl: downloadUrl.substring(0, 80) + '...' });
            const downloadRes = await FileSystem.downloadAsync(downloadUrl, downloadPath);
            logger.info('PDF', '📥 Téléchargement terminé', { 
              localUri: downloadRes.uri,
              status: downloadRes.status,
              headers: downloadRes.headers,
            });

            // Vérifier la taille du fichier téléchargé
            const fileInfo = await FileSystem.getInfoAsync(downloadRes.uri);
            logger.info('PDF', '📊 Info fichier téléchargé', {
              exists: fileInfo.exists,
              size: fileInfo.size,
              isDirectory: fileInfo.isDirectory,
            });

            if (!fileInfo.exists || fileInfo.size === 0) {
              throw new Error(`Fichier téléchargé vide ou inexistant (size: ${fileInfo.size})`);
            }

            const base64 = await FileSystem.readAsStringAsync(downloadRes.uri, {
              encoding: FileSystem.EncodingType.Base64,
            });

            // Vérifier la longueur du base64 (une image PNG devrait faire au moins quelques KB en base64)
            logger.info('PDF', '🔍 Vérification base64', {
              base64Length: base64?.length || 0,
              base64Start: base64?.substring(0, 30) || '',
              expectedMinSize: Math.ceil(fileInfo.size * 1.33), // Base64 = ~33% plus grand que binaire
            });

            signatureImageBase64 = `data:image/png;base64,${base64}`;
            logger.info('PDF', '✅ Signature image téléchargée pour le PDF', {
              originalUrl: signatureImageSource,
              downloadUrl: downloadUrl.substring(0, 80) + '...',
              localUri: downloadRes.uri,
              fileSize: fileInfo.size,
              base64Length: base64?.length || 0,
            });
          } catch (error) {
            logger.error('PDF', '❌ Erreur chargement/encodage de la signature pour le PDF', {
              error: error.message,
              stack: error.stack,
              url: signatureImageSource,
            });
          }
        } else {
          logger.warn('PDF', '⚠️ signatureImageSource n\'est pas une string', {
            type: typeof signatureImageSource,
            value: signatureImageSource,
          });
        }
      } else {
        logger.warn('PDF', '⚠️ Aucune source d\'image de signature trouvée', {
          hasSignatureData: !!signatureData,
          hasSignatureImageBase64: !!signatureData?.signature_image_base64,
          hasDevisSignatureImageUrl: !!devis.signature_image_url,
        });
      }

      signature = {
        signerName,
        signerEmail,
        signedAt,
        signatureImageBase64,
      };
    }

    // 4. Formater les lignes pour le template
    const lignesFormatted = lignes.map(l => ({
      designation: l.description,
      quantity: Number(l.quantite),
      unit: l.unite,
      unitPriceHT: Number(l.prix_unitaire),
    }));

    // 5. Générer le PDF
    const number = devis.numero;
    const dateISO = new Date(devis.created_at).toLocaleDateString('fr-FR');

    const html = buildDevisHTML({
      number,
      dateISO,
      company,
      client,
      project,
      lignes: lignesFormatted,
      tva: devis.tva_percent || brandSettings?.tva_default || 20,
      logoUrl: brandSettings?.logo_url || null, // ✅ Utiliser le logo depuis les settings
      template: template, // ✅ Utiliser le template depuis les settings
      signature, // ✅ Passer les informations de signature si le devis est signé
    });

    const printResult = await Print.printToFileAsync({ html });
    const { uri } = printResult;

    logger.success('PDF', `PDF local créé: ${uri}`);

    // 6. Upload dans Supabase Storage
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      // Structure : {user_id}/{project_id}/{numero}.pdf
      const path = `${user.id}/${project.id}/${number}.pdf`;
      
      // Lire le fichier local et le convertir en bytes
      const resp = await fetch(uri);
      const arrayBuffer = await resp.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Upload dans Storage
      const { error: upErr } = await supabase.storage
        .from('docs')
        .upload(path, bytes, {
          contentType: 'application/pdf',
          upsert: true, // Écraser si existe déjà
        });

      if (upErr) {
        logger.error('PDF', 'Erreur upload Storage', upErr);
        // Continuer avec fichier local si upload échoue
        return { pdfUrl: null, number, localUri: uri };
      }

      // Récupérer l'URL publique
      const { data: urlData } = supabase.storage.from('docs').getPublicUrl(path);
      const pdfUrl = urlData?.publicUrl;

      // Mettre à jour le devis avec l'URL du PDF
      await supabase
        .from('devis')
        .update({ pdf_url: pdfUrl })
        .eq('id', devisId);

      logger.success('PDF', `PDF uploadé dans Storage: ${pdfUrl}`);
      return { pdfUrl, number, localUri: uri };
    } catch (uploadError) {
      logger.error('PDF', 'Exception upload Storage', uploadError);
      // En cas d'erreur, retourner le fichier local
      return { pdfUrl: null, number, localUri: uri };
    }
  } catch (error) {
    logger.error('PDF', 'Exception generateDevisPDFFromDB', error);
    throw error;
  }
}

/**
 * Génère un PDF local puis l'upload dans Supabase Storage (bucket "docs").
 * Retourne { pdfUrl, number }.
 */
export async function generateDevisPDF({
  company,
  client,
  project,
  lignes = [],
  tva = 20,
  logoUrl = null,
  template = DEFAULT_TEMPLATE,
}) {
  try {
    logger.info('PDF', 'generateDevisPDF appelé', {
      hasCompany: !!company,
      hasClient: !!client,
      hasProject: !!project,
      lignesCount: lignes?.length || 0,
    });
    
    // Validation des paramètres
    if (!company) {
      throw new Error('Paramètre company manquant');
    }
    if (!client) {
      throw new Error('Paramètre client manquant');
    }
    if (!project) {
      throw new Error('Paramètre project manquant');
    }
    if (!lignes || lignes.length === 0) {
      throw new Error('Aucune ligne de devis fournie');
    }
    
    const number = generateDevisNumber();
    const dateISO = new Date().toLocaleDateString('fr-FR');

    logger.info('PDF', `Génération devis ${number}`, { projectId: project?.id, template });

    // 1) HTML
    logger.info('PDF', 'Construction HTML...');
    const html = buildDevisHTML({
      number,
      dateISO,
      company,
      client,
      project,
      lignes,
      tva,
      logoUrl,
      template,
    });
    
    if (!html) {
      throw new Error('HTML généré est vide');
    }
    
    logger.info('PDF', 'HTML construit', { htmlLength: html.length });

    // 2) Générer PDF local
    logger.info('PDF', 'Appel Print.printToFileAsync...');
    
    let printResult;
    try {
      printResult = await Print.printToFileAsync({ html });
    } catch (printError) {
      logger.error('PDF', 'Erreur Print.printToFileAsync', printError);
      throw new Error(`Impossible de créer le PDF: ${printError.message}`);
    }
    
    if (!printResult || !printResult.uri) {
      throw new Error('Print.printToFileAsync n\'a pas retourné d\'URI');
    }
    
    const { uri } = printResult;
    logger.success('PDF', `PDF local créé: ${uri}`);

    // 3) Upload dans Supabase Storage
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      // Structure : {user_id}/{project_id}/{numero}.pdf
      const path = `${user.id}/${project.id}/${number}.pdf`;
      
      // Lire le fichier local et le convertir en bytes
      const resp = await fetch(uri);
      const arrayBuffer = await resp.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Upload dans Storage
      const { error: upErr } = await supabase.storage
        .from('docs')
        .upload(path, bytes, {
          contentType: 'application/pdf',
          upsert: true, // Écraser si existe déjà
        });

      if (upErr) {
        logger.error('PDF', 'Erreur upload Storage', upErr);
        // Continuer avec fichier local si upload échoue
        return { pdfUrl: null, number, localUri: uri };
      }

      // Récupérer l'URL publique
      const { data: urlData } = supabase.storage.from('docs').getPublicUrl(path);
      const pdfUrl = urlData?.publicUrl;

      logger.success('PDF', `PDF uploadé dans Storage: ${pdfUrl}`);
      return { pdfUrl, number, localUri: uri };
    } catch (uploadError) {
      logger.error('PDF', 'Exception upload Storage', uploadError);
      // En cas d'erreur, retourner le fichier local
      return { pdfUrl: null, number, localUri: uri };
    }
  } catch (error) {
    logger.error('PDF', 'Exception generateDevisPDF', error);
    throw error; // Propager l'erreur pour que handleGeneratePDF l'attrape
  }
}
