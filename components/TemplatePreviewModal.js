/**
 * Modal d'aperçu plein écran d'un template PDF
 * Affiche un aperçu réaliste avec des données d'exemple
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DOCUMENT_TEMPLATES } from '../types/documentTemplates';

const { width } = Dimensions.get('window');

/**
 * Composant d'aperçu de template avec données d'exemple
 */
export function TemplatePreviewModal({ visible, templateId, onClose, onSelect }) {
  const insets = useSafeAreaInsets();
  
  if (!templateId || !visible) return null;
  
  const template = DOCUMENT_TEMPLATES[templateId];
  if (!template) return null;
  
  const previewStyles = getPreviewStyles(templateId);
  
  // Données d'exemple
  const exampleData = {
    company: { name: 'Mon Entreprise', siret: '123 456 789 00012', address: '123 rue de la République', phone: '01 23 45 67 89', email: 'contact@entreprise.fr' },
    client: { name: 'Jean Dupont', address: '45 avenue des Champs', phone: '06 12 34 56 78' },
    project: { title: 'Rénovation salle de bain', address: '45 avenue des Champs' },
    number: 'DE-2025-0001',
    date: new Date().toLocaleDateString('fr-FR'),
    lignes: [
      { designation: 'Carrelage mural', qty: 15, unit: 'm²', pu: 45.00, total: 675.00 },
      { designation: 'Carrelage sol', qty: 8, unit: 'm²', pu: 35.00, total: 280.00 },
      { designation: 'Main d\'œuvre', qty: 12, unit: 'h', pu: 45.00, total: 540.00 },
    ],
    totalHT: 1495.00,
    tva: 299.00,
    totalTTC: 1794.00,
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: previewStyles.bgColor }]}>
          {/* Header */}
          <View style={[styles.modalHeader, previewStyles.header]}>
            <View style={styles.headerLeft}>
              <Text style={[styles.modalTitle, { color: previewStyles.textColor }]}>
                Aperçu : {template?.label}
              </Text>
              <Text style={[styles.modalSubtitle, { color: previewStyles.textColorSecondary }]}>
                {template?.description}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={previewStyles.textColor} />
            </TouchableOpacity>
          </View>
          
          {/* Preview Content */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Document Preview */}
            <View style={[styles.documentPreview, previewStyles.document]}>
              {/* Header du document */}
              <View style={[styles.docHeader, previewStyles.docHeader]}>
                <View style={styles.docHeaderLeft}>
                  <Text style={[styles.companyName, previewStyles.companyName]}>
                    {exampleData.company.name}
                  </Text>
                  <Text style={[styles.companyInfo, previewStyles.companyInfo]}>
                    SIRET : {exampleData.company.siret}
                  </Text>
                  <Text style={[styles.companyInfo, previewStyles.companyInfo]}>
                    {exampleData.company.address}
                  </Text>
                </View>
                <View style={styles.docHeaderRight}>
                  <Text style={[styles.docTitle, previewStyles.docTitle]}>DEVIS</Text>
                  <Text style={[styles.docNumber, previewStyles.docNumber]}>
                    {exampleData.number}
                  </Text>
                  <Text style={[styles.docDate, previewStyles.docDate]}>
                    {exampleData.date}
                  </Text>
                </View>
              </View>
              
              {/* Blocks Destinataire / Chantier */}
              <View style={styles.docBlocks}>
                <View style={[styles.docBlock, previewStyles.docBlock]}>
                  <Text style={[styles.blockTitle, previewStyles.blockTitle]}>DESTINATAIRE</Text>
                  <Text style={[styles.blockText, previewStyles.blockText]}>
                    <Text style={{ fontWeight: '700' }}>{exampleData.client.name}</Text>
                  </Text>
                  <Text style={[styles.blockText, previewStyles.blockText]}>
                    {exampleData.client.address}
                  </Text>
                </View>
                <View style={[styles.docBlock, previewStyles.docBlock]}>
                  <Text style={[styles.blockTitle, previewStyles.blockTitle]}>CHANTIER</Text>
                  <Text style={[styles.blockText, previewStyles.blockText]}>
                    <Text style={{ fontWeight: '700' }}>{exampleData.project.title}</Text>
                  </Text>
                  <Text style={[styles.blockText, previewStyles.blockText]}>
                    {exampleData.project.address}
                  </Text>
                </View>
              </View>
              
              {/* Table */}
              <View style={[styles.docTable, previewStyles.docTable]}>
                <View style={[styles.tableHeader, previewStyles.tableHeader]}>
                  <Text style={[styles.tableHeaderText, previewStyles.tableHeaderText]}>Désignation</Text>
                  <Text style={[styles.tableHeaderText, previewStyles.tableHeaderText]}>Qté</Text>
                  <Text style={[styles.tableHeaderText, previewStyles.tableHeaderText]}>Unité</Text>
                  <Text style={[styles.tableHeaderText, previewStyles.tableHeaderText]}>PU HT</Text>
                  <Text style={[styles.tableHeaderText, previewStyles.tableHeaderText]}>Total HT</Text>
                </View>
                {exampleData.lignes.map((ligne, idx) => {
                  const rowStyle = [
                    styles.tableRow, 
                    previewStyles.tableRow,
                  ];
                  if (idx % 2 === 1 && previewStyles.tableRowEven) {
                    rowStyle.push(previewStyles.tableRowEven);
                  }
                  return (
                    <View key={idx} style={rowStyle}>
                      <Text style={[styles.tableCell, { flex: 3 }, previewStyles.tableCell]}>{ligne.designation}</Text>
                      <Text style={[styles.tableCell, previewStyles.tableCell]}>{ligne.qty}</Text>
                      <Text style={[styles.tableCell, previewStyles.tableCell]}>{ligne.unit}</Text>
                      <Text style={[styles.tableCell, previewStyles.tableCell]}>{ligne.pu.toFixed(2)} €</Text>
                      <Text style={[styles.tableCell, previewStyles.tableCell]}>{ligne.total.toFixed(2)} €</Text>
                    </View>
                  );
                })}
              </View>
              
              {/* Totaux */}
              <View style={[styles.docTotals, previewStyles.docTotals]}>
                <View style={styles.totalsRow}>
                  <Text style={[styles.totalsLabel, previewStyles.totalsLabel]}>Total HT</Text>
                  <Text style={[styles.totalsValue, previewStyles.totalsValue]}>{exampleData.totalHT.toFixed(2)} €</Text>
                </View>
                <View style={styles.totalsRow}>
                  <Text style={[styles.totalsLabel, previewStyles.totalsLabel]}>TVA 20%</Text>
                  <Text style={[styles.totalsValue, previewStyles.totalsValue]}>{exampleData.tva.toFixed(2)} €</Text>
                </View>
                <View style={[styles.totalsRow, styles.totalsRowLast, previewStyles.totalsRowLast]}>
                  <Text style={[styles.totalsLabel, previewStyles.totalsLabelLast]}>Total TTC</Text>
                  <Text style={[styles.totalsValue, previewStyles.totalsValueLast]}>{exampleData.totalTTC.toFixed(2)} €</Text>
                </View>
              </View>
            </View>
          </ScrollView>
          
          {/* Footer avec bouton */}
          {onSelect && (
            <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
              <TouchableOpacity
                style={[styles.selectButton, previewStyles.selectButton]}
                onPress={() => {
                  onSelect(templateId);
                  onClose();
                }}
              >
                <Feather name="check" size={20} color="#fff" />
                <Text style={styles.selectButtonText}>Sélectionner ce modèle</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

/**
 * Retourne les styles spécifiques à chaque template
 */
function getPreviewStyles(templateId) {
  const base = {
    bgColor: '#fff',
    textColor: '#111',
    textColorSecondary: '#666',
    companyName: { color: '#111', fontSize: 16, fontWeight: '700' },
    companyInfo: { color: '#666', fontSize: 11 },
    docTitle: { color: '#111', fontSize: 20, fontWeight: '800' },
    docNumber: { color: '#666', fontSize: 12 },
    docDate: { color: '#666', fontSize: 12 },
    blockTitle: { color: '#111', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
    blockText: { color: '#111', fontSize: 12 },
    tableHeaderText: { color: '#fff', fontSize: 10, fontWeight: '700' },
    tableRow: {},
    tableRowEven: null,
    tableCell: { color: '#111', fontSize: 11 },
    totalsLabel: { color: '#111', fontSize: 12 },
    totalsValue: { color: '#111', fontSize: 12, fontWeight: '600' },
    totalsLabelLast: { color: '#111', fontSize: 14, fontWeight: '700' },
    totalsValueLast: { color: '#111', fontSize: 16, fontWeight: '900' },
  };

  switch (templateId) {
    case 'minimal':
      return {
        ...base,
        bgColor: '#fff',
        docHeader: { borderBottomWidth: 3, borderBottomColor: '#000', paddingBottom: 16 },
        companyName: { color: '#000', fontSize: 16, fontWeight: '900' },
        docTitle: { color: '#000', fontSize: 22, fontWeight: '900', letterSpacing: 2 },
        docTable: { borderWidth: 2, borderColor: '#000' },
        tableHeader: { backgroundColor: '#000' },
        tableHeaderText: { color: '#fff' },
        docTotals: { borderWidth: 2, borderColor: '#000' },
        totalsRowLast: { backgroundColor: '#000' },
        totalsLabelLast: { color: '#fff' },
        totalsValueLast: { color: '#fff' },
        selectButton: { backgroundColor: '#000' },
      };

    case 'bandeBleue':
      return {
        ...base,
        bgColor: '#f8f9fa',
        textColor: '#fff',
        textColorSecondary: 'rgba(255,255,255,0.9)',
        docHeader: { 
          backgroundColor: '#1D4ED8', 
          borderRadius: 12, 
          padding: 20,
          marginBottom: 20,
        },
        companyName: { color: '#fff', fontSize: 18, fontWeight: '800' },
        companyInfo: { color: 'rgba(255,255,255,0.9)', fontSize: 11 },
        docTitle: { color: '#fff', fontSize: 28, fontWeight: '900' },
        docNumber: { color: 'rgba(255,255,255,0.95)', fontSize: 13 },
        docDate: { color: 'rgba(255,255,255,0.95)', fontSize: 13 },
        docBlock: { borderColor: '#1D4ED8', borderWidth: 3, borderRadius: 10, backgroundColor: '#fff' },
        blockTitle: { color: '#1D4ED8', fontSize: 12, fontWeight: '800' },
        blockText: { color: '#111', fontSize: 12 },
        docTable: { borderRadius: 8, borderWidth: 2, borderColor: '#1D4ED8' },
        tableHeader: { backgroundColor: '#1D4ED8' },
        tableHeaderText: { color: '#fff', fontSize: 10, fontWeight: '700' },
        tableCell: { color: '#111', fontSize: 11 },
        docTotals: { borderWidth: 3, borderColor: '#1D4ED8', borderRadius: 10 },
        totalsRowLast: { backgroundColor: '#1D4ED8' },
        totalsLabelLast: { color: '#fff' },
        totalsValueLast: { color: '#fff', fontSize: 18 },
        selectButton: { backgroundColor: '#1D4ED8' },
      };

    case 'premiumNoirOr':
      return {
        ...base,
        bgColor: '#fff',
        textColor: '#fff',
        textColorSecondary: 'rgba(255,255,255,0.7)',
        docHeader: { backgroundColor: '#000000', padding: 20, marginBottom: 20 },
        companyName: { color: '#fff', fontSize: 20, fontWeight: '900' },
        companyInfo: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
        docTitle: { color: '#f4c159', fontSize: 28, fontWeight: '900', letterSpacing: 2 },
        docNumber: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
        docDate: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
        docBlock: { borderColor: '#e0e0e0', backgroundColor: '#F6F6F9' },
        blockTitle: { color: '#000000', fontSize: 12, fontWeight: '800' },
        blockText: { color: '#111', fontSize: 12 },
        docTable: { borderColor: '#e0e0e0' },
        tableHeader: { backgroundColor: '#000000' },
        tableHeaderText: { color: '#fff', fontSize: 10, fontWeight: '700' },
        tableRowEven: { backgroundColor: '#FAFAFC' },
        tableRow: {},
        tableCell: { color: '#111', fontSize: 11 },
        docTotals: { borderColor: '#e0e0e0', borderRadius: 6 },
        totalsRowLast: { backgroundColor: '#f4c159' },
        totalsLabelLast: { color: '#000000', fontSize: 16, fontWeight: '900' },
        totalsValueLast: { color: '#000000', fontSize: 18, fontWeight: '900' },
        selectButton: { backgroundColor: '#000000' },
      };

    case 'bleuElectrique':
      return {
        ...base,
        bgColor: '#fff',
        textColor: '#fff',
        textColorSecondary: 'rgba(255,255,255,0.9)',
        docHeader: { 
          backgroundColor: '#0066ff', 
          borderRadius: 12, 
          padding: 20,
          marginBottom: 20,
        },
        companyName: { color: '#fff', fontSize: 18, fontWeight: '800' },
        companyInfo: { color: 'rgba(255,255,255,0.9)', fontSize: 11 },
        docTitle: { color: '#fff', fontSize: 28, fontWeight: '900' },
        docNumber: { color: 'rgba(255,255,255,0.95)', fontSize: 13 },
        docDate: { color: 'rgba(255,255,255,0.95)', fontSize: 13 },
        docBlock: { borderColor: '#0066ff', borderWidth: 2, borderRadius: 10, backgroundColor: '#fff' },
        blockTitle: { color: '#0066ff', fontSize: 12, fontWeight: '800' },
        blockText: { color: '#111', fontSize: 12 },
        docTable: { borderRadius: 8, borderWidth: 2, borderColor: '#0066ff' },
        tableHeader: { backgroundColor: '#0066ff' },
        tableHeaderText: { color: '#fff', fontSize: 10, fontWeight: '700' },
        tableCell: { color: '#111', fontSize: 11 },
        docTotals: { borderWidth: 2, borderColor: '#0066ff', borderRadius: 10 },
        totalsRowLast: { backgroundColor: '#0066ff' },
        totalsLabelLast: { color: '#fff' },
        totalsValueLast: { color: '#fff', fontSize: 18 },
        selectButton: { backgroundColor: '#0066ff' },
      };

    case 'graphite':
      return {
        ...base,
        bgColor: '#fff',
        textColor: '#fff',
        textColorSecondary: 'rgba(255,255,255,0.9)',
        docHeader: { backgroundColor: '#222222', padding: 20, marginBottom: 20 },
        companyName: { color: '#fff', fontSize: 18, fontWeight: '800' },
        companyInfo: { color: 'rgba(255,255,255,0.9)', fontSize: 11 },
        docTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
        docNumber: { color: 'rgba(255,255,255,0.9)', fontSize: 13 },
        docDate: { color: 'rgba(255,255,255,0.9)', fontSize: 13 },
        docBlock: { borderColor: '#555555', backgroundColor: '#f9fafb' },
        blockTitle: { color: '#222222', fontSize: 12, fontWeight: '800' },
        blockText: { color: '#111', fontSize: 12 },
        docTable: { borderColor: '#555555' },
        tableHeader: { backgroundColor: '#222222' },
        tableHeaderText: { color: '#fff', fontSize: 10, fontWeight: '700' },
        tableCell: { color: '#111', fontSize: 11 },
        docTotals: { borderColor: '#555555', borderRadius: 6 },
        totalsRowLast: { backgroundColor: '#222222' },
        totalsLabelLast: { color: '#fff' },
        totalsValueLast: { color: '#fff', fontSize: 18 },
        selectButton: { backgroundColor: '#222222' },
      };

    case 'ecoVert':
      return {
        ...base,
        bgColor: '#fff',
        docHeader: { borderBottomWidth: 3, borderBottomColor: '#2e7d32', paddingBottom: 16 },
        companyName: { color: '#111', fontSize: 18, fontWeight: '800' },
        docTitle: { color: '#2e7d32', fontSize: 24, fontWeight: '900' },
        docBlock: { borderColor: '#2e7d32', borderWidth: 2, borderRadius: 8, backgroundColor: '#f1f8f4' },
        blockTitle: { color: '#2e7d32', fontSize: 12, fontWeight: '800' },
        blockText: { color: '#111', fontSize: 12 },
        docTable: { borderColor: '#2e7d32' },
        tableHeader: { backgroundColor: '#2e7d32' },
        tableHeaderText: { color: '#fff', fontSize: 10, fontWeight: '700' },
        tableCell: { color: '#111', fontSize: 11 },
        docTotals: { borderWidth: 2, borderColor: '#2e7d32', borderRadius: 8 },
        totalsRowLast: { backgroundColor: '#2e7d32' },
        totalsLabelLast: { color: '#fff' },
        totalsValueLast: { color: '#fff', fontSize: 18 },
        selectButton: { backgroundColor: '#2e7d32' },
      };

    case 'chantierOrange':
      return {
        ...base,
        bgColor: '#fff',
        docHeader: { borderBottomWidth: 4, borderBottomColor: '#f57c00', paddingBottom: 16 },
        companyName: { color: '#111', fontSize: 18, fontWeight: '900' },
        docTitle: { color: '#f57c00', fontSize: 26, fontWeight: '900', letterSpacing: 2 },
        docBlock: { borderColor: '#f57c00', borderWidth: 3, borderRadius: 8, backgroundColor: '#fff8f0' },
        blockTitle: { color: '#f57c00', fontSize: 12, fontWeight: '900' },
        blockText: { color: '#111', fontSize: 12 },
        docTable: { borderWidth: 3, borderColor: '#f57c00' },
        tableHeader: { backgroundColor: '#f57c00' },
        tableHeaderText: { color: '#fff', fontSize: 10, fontWeight: '800' },
        tableCell: { color: '#111', fontSize: 11 },
        docTotals: { borderWidth: 3, borderColor: '#f57c00', borderRadius: 8 },
        totalsRowLast: { backgroundColor: '#f57c00' },
        totalsLabelLast: { color: '#fff' },
        totalsValueLast: { color: '#fff', fontSize: 18 },
        selectButton: { backgroundColor: '#f57c00' },
      };

    case 'architecte':
      return {
        ...base,
        bgColor: '#fff',
        docHeader: { borderBottomWidth: 1, borderBottomColor: '#e0e0e0', paddingBottom: 20 },
        companyName: { color: '#111', fontSize: 16, fontWeight: '400', letterSpacing: 0.5 },
        companyInfo: { color: '#666', fontSize: 11 },
        docTitle: { color: '#111', fontSize: 20, fontWeight: '300', letterSpacing: 3 },
        docBlock: { borderColor: '#e0e0e0', backgroundColor: '#fff' },
        blockTitle: { color: '#111', fontSize: 11, fontWeight: '400', letterSpacing: 2 },
        blockText: { color: '#111', fontSize: 12 },
        docTable: { borderColor: '#e0e0e0' },
        tableHeader: { backgroundColor: '#fafafa' },
        tableHeaderText: { color: '#111', fontSize: 10, fontWeight: '400' },
        tableCell: { color: '#111', fontSize: 11 },
        docTotals: { borderColor: '#e0e0e0' },
        totalsRowLast: { backgroundColor: '#fafafa' },
        totalsLabelLast: { color: '#111', fontSize: 14, fontWeight: '400' },
        totalsValueLast: { color: '#111', fontSize: 14, fontWeight: '400' },
        selectButton: { backgroundColor: '#111' },
      };

    case 'filigraneLogo':
      return {
        ...base,
        bgColor: '#fff',
        docHeader: { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 16 },
        companyName: { color: '#111', fontSize: 18, fontWeight: '700' },
        docTitle: { color: '#111', fontSize: 22, fontWeight: '800' },
        docBlock: { borderColor: '#e5e7eb', backgroundColor: '#f9fafb' },
        blockTitle: { color: '#374151', fontSize: 12, fontWeight: '700' },
        blockText: { color: '#111', fontSize: 12 },
        docTable: { borderColor: '#e5e7eb', backgroundColor: '#f9fafb', opacity: 0.95 },
        tableHeader: { backgroundColor: '#f3f4f6' },
        tableHeaderText: { color: '#111', fontSize: 10, fontWeight: '700' },
        tableCell: { color: '#111', fontSize: 11 },
        docTotals: { borderColor: '#e5e7eb', borderRadius: 8 },
        totalsRowLast: { backgroundColor: '#f3f4f6' },
        totalsLabelLast: { color: '#111', fontSize: 16, fontWeight: '800' },
        totalsValueLast: { color: '#111', fontSize: 18, fontWeight: '800' },
        selectButton: { backgroundColor: '#374151' },
      };

    case 'classique':
    default:
      return {
        ...base,
        docHeader: { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 16 },
        docTitle: { color: '#1D4ED8', fontSize: 20, fontWeight: '800' },
        docBlock: { borderColor: '#e5e7eb', backgroundColor: '#f9fafb' },
        docTable: { borderColor: '#e5e7eb' },
        tableHeader: { backgroundColor: '#f3f4f6' },
        tableHeaderText: { color: '#111' },
        docTotals: { borderColor: '#e5e7eb' },
        selectButton: { backgroundColor: '#1D4ED8' },
      };
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  container: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerLeft: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    opacity: 0.8,
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  documentPreview: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    minHeight: 600,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  docHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  docHeaderLeft: {
    flex: 1,
  },
  docHeaderRight: {
    alignItems: 'flex-end',
  },
  companyName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  companyInfo: {
    fontSize: 11,
    marginBottom: 2,
  },
  docTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  docNumber: {
    fontSize: 12,
    marginBottom: 2,
  },
  docDate: {
    fontSize: 12,
  },
  docBlocks: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  docBlock: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
  },
  blockTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  blockText: {
    fontSize: 12,
    marginBottom: 4,
  },
  docTable: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  tableCell: {
    flex: 1,
    fontSize: 11,
  },
  docTotals: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'flex-end',
    minWidth: 280,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  totalsRowLast: {
    borderBottomWidth: 0,
  },
  totalsLabel: {
    fontSize: 12,
  },
  totalsValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  totalsLabelLast: {
    fontSize: 14,
    fontWeight: '700',
  },
  totalsValueLast: {
    fontSize: 16,
    fontWeight: '900',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D4ED8',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

