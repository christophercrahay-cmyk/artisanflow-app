/**
 * Composant d'aperçu visuel d'un template PDF
 * Affiche une miniature stylisée représentant le design du template
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * Génère une vignette visuelle pour un template
 * @param {string} templateId - ID du template
 * @param {object} style - Styles additionnels
 */
export function TemplatePreview({ templateId, style }) {
  const previewStyles = getTemplatePreviewStyles(templateId);
  
  return (
    <View style={[styles.container, previewStyles.container, style]}>
      {/* Header */}
      <View style={[styles.header, previewStyles.header]}>
        <View style={styles.headerContent}>
          <View style={[styles.headerBar, previewStyles.headerBar]} />
          <View style={[styles.headerTitle, previewStyles.headerTitle]} />
        </View>
      </View>
      
      {/* Body */}
      <View style={styles.body}>
        <View style={[styles.bodyLine, previewStyles.bodyLine]} />
        <View style={[styles.bodyLine, previewStyles.bodyLine, { width: '60%' }]} />
      </View>
      
      {/* Table preview */}
      <View style={[styles.table, previewStyles.table]}>
        <View style={[styles.tableHeader, previewStyles.tableHeader]} />
        <View style={styles.tableRows}>
          <View style={[styles.tableRow, previewStyles.tableRow]} />
          <View style={[styles.tableRow, previewStyles.tableRow]} />
        </View>
      </View>
      
      {/* Footer */}
      <View style={[styles.footer, previewStyles.footer]}>
        <View style={[styles.footerBar, previewStyles.footerBar]} />
      </View>
    </View>
  );
}

/**
 * Retourne les styles visuels spécifiques à chaque template
 */
function getTemplatePreviewStyles(templateId) {
  const base = {
    container: { backgroundColor: '#fff' },
    header: { backgroundColor: '#f5f5f5' },
    headerBar: { backgroundColor: '#ddd' },
    headerTitle: { backgroundColor: '#999' },
    bodyLine: { backgroundColor: '#e0e0e0' },
    table: { borderColor: '#ddd' },
    tableHeader: { backgroundColor: '#f0f0f0' },
    tableRow: { backgroundColor: '#fff' },
    footer: { backgroundColor: '#f5f5f5' },
    footerBar: { backgroundColor: '#ddd' },
  };

  switch (templateId) {
    case 'minimal':
      return {
        container: { backgroundColor: '#fff', borderColor: '#000', borderWidth: 2 },
        header: { backgroundColor: '#fff', borderBottomWidth: 3, borderBottomColor: '#000' },
        headerBar: { backgroundColor: '#000', height: 3 },
        headerTitle: { backgroundColor: '#000' },
        bodyLine: { backgroundColor: '#000' },
        table: { borderColor: '#000', borderWidth: 2 },
        tableHeader: { backgroundColor: '#000' },
        tableRow: { backgroundColor: '#fff', borderColor: '#ddd' },
        footer: { backgroundColor: '#fff' },
        footerBar: { backgroundColor: '#000', height: 3 },
      };

    case 'classique':
      return {
        container: { backgroundColor: '#fff' },
        header: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
        headerBar: { backgroundColor: '#1D4ED8', height: 2 },
        headerTitle: { backgroundColor: '#1D4ED8' },
        bodyLine: { backgroundColor: '#e5e7eb' },
        table: { borderColor: '#e5e7eb' },
        tableHeader: { backgroundColor: '#f3f4f6' },
        tableRow: { backgroundColor: '#fff' },
        footer: { backgroundColor: '#f3f4f6' },
        footerBar: { backgroundColor: '#1D4ED8', height: 2 },
      };

    case 'bandeBleue':
      return {
        container: { backgroundColor: '#f8f9fa' },
        header: { backgroundColor: '#1D4ED8', borderRadius: 8 },
        headerBar: { backgroundColor: '#3B82F6', height: 4 },
        headerTitle: { backgroundColor: '#fff' },
        bodyLine: { backgroundColor: '#e5e7eb' },
        table: { borderColor: '#1D4ED8', borderRadius: 6 },
        tableHeader: { backgroundColor: '#1D4ED8' },
        tableRow: { backgroundColor: '#fff' },
        footer: { backgroundColor: '#f0f4ff' },
        footerBar: { backgroundColor: '#1D4ED8', height: 4 },
      };

    case 'premiumNoirOr':
      return {
        container: { backgroundColor: '#fff' },
        header: { backgroundColor: '#000000' },
        headerBar: { backgroundColor: '#f4c159', height: 3 },
        headerTitle: { backgroundColor: '#f4c159' },
        bodyLine: { backgroundColor: '#e0e0e0' },
        table: { borderColor: '#e0e0e0' },
        tableHeader: { backgroundColor: '#000000' },
        tableRow: { backgroundColor: '#fff' },
        footer: { backgroundColor: '#f9fafb' },
        footerBar: { backgroundColor: '#f4c159', height: 3 },
      };

    case 'bleuElectrique':
      return {
        container: { backgroundColor: '#fff' },
        header: { backgroundColor: '#0066ff', borderRadius: 8 },
        headerBar: { backgroundColor: '#0052cc', height: 4 },
        headerTitle: { backgroundColor: '#fff' },
        bodyLine: { backgroundColor: '#e5e7eb' },
        table: { borderColor: '#0066ff', borderRadius: 6, borderWidth: 2 },
        tableHeader: { backgroundColor: '#0066ff' },
        tableRow: { backgroundColor: '#fff' },
        footer: { backgroundColor: '#e6f2ff' },
        footerBar: { backgroundColor: '#0066ff', height: 4 },
      };

    case 'graphite':
      return {
        container: { backgroundColor: '#fff' },
        header: { backgroundColor: '#222222' },
        headerBar: { backgroundColor: '#555555', height: 2 },
        headerTitle: { backgroundColor: '#fff' },
        bodyLine: { backgroundColor: '#555555' },
        table: { borderColor: '#555555' },
        tableHeader: { backgroundColor: '#222222' },
        tableRow: { backgroundColor: '#fff', borderColor: '#555555' },
        footer: { backgroundColor: '#f9fafb' },
        footerBar: { backgroundColor: '#222222', height: 2 },
      };

    case 'ecoVert':
      return {
        container: { backgroundColor: '#fff' },
        header: { backgroundColor: '#fff', borderBottomWidth: 3, borderBottomColor: '#2e7d32' },
        headerBar: { backgroundColor: '#2e7d32', height: 3 },
        headerTitle: { backgroundColor: '#2e7d32' },
        bodyLine: { backgroundColor: '#c8e6c9' },
        table: { borderColor: '#2e7d32' },
        tableHeader: { backgroundColor: '#2e7d32' },
        tableRow: { backgroundColor: '#fff', borderColor: '#c8e6c9' },
        footer: { backgroundColor: '#f1f8f4' },
        footerBar: { backgroundColor: '#2e7d32', height: 3 },
      };

    case 'chantierOrange':
      return {
        container: { backgroundColor: '#fff' },
        header: { backgroundColor: '#fff', borderBottomWidth: 4, borderBottomColor: '#f57c00' },
        headerBar: { backgroundColor: '#f57c00', height: 4 },
        headerTitle: { backgroundColor: '#f57c00' },
        bodyLine: { backgroundColor: '#ffb74d' },
        table: { borderColor: '#f57c00', borderWidth: 3 },
        tableHeader: { backgroundColor: '#f57c00' },
        tableRow: { backgroundColor: '#fff', borderColor: '#ffb74d' },
        footer: { backgroundColor: '#fff8f0' },
        footerBar: { backgroundColor: '#f57c00', height: 4 },
      };

    case 'architecte':
      return {
        container: { backgroundColor: '#fff' },
        header: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
        headerBar: { backgroundColor: '#e0e0e0', height: 1 },
        headerTitle: { backgroundColor: '#111' },
        bodyLine: { backgroundColor: '#f0f0f0' },
        table: { borderColor: '#e0e0e0' },
        tableHeader: { backgroundColor: '#fafafa' },
        tableRow: { backgroundColor: '#fff', borderColor: '#f0f0f0' },
        footer: { backgroundColor: '#fff' },
        footerBar: { backgroundColor: '#e0e0e0', height: 1 },
      };

    case 'filigraneLogo':
      return {
        container: { backgroundColor: '#fff' },
        header: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
        headerBar: { backgroundColor: '#e5e7eb', height: 1 },
        headerTitle: { backgroundColor: '#111' },
        bodyLine: { backgroundColor: '#e5e7eb' },
        table: { borderColor: '#e5e7eb', backgroundColor: '#f9fafb', opacity: 0.95 },
        tableHeader: { backgroundColor: '#f3f4f6' },
        tableRow: { backgroundColor: '#fff', borderColor: '#e5e7eb' },
        footer: { backgroundColor: '#f9fafb' },
        footerBar: { backgroundColor: '#e5e7eb', height: 1 },
      };

    default:
      return base;
  }
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 100,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  header: {
    height: 20,
    paddingHorizontal: 4,
    paddingTop: 2,
  },
  headerContent: {
    flex: 1,
  },
  headerBar: {
    height: 2,
    borderRadius: 1,
    marginBottom: 2,
  },
  headerTitle: {
    height: 6,
    borderRadius: 1,
    width: '40%',
    alignSelf: 'flex-end',
  },
  body: {
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  bodyLine: {
    height: 2,
    borderRadius: 1,
    marginBottom: 2,
    width: '80%',
  },
  table: {
    marginHorizontal: 4,
    marginTop: 2,
    borderWidth: 1,
    borderRadius: 2,
    overflow: 'hidden',
  },
  tableHeader: {
    height: 6,
    width: '100%',
  },
  tableRows: {
    padding: 1,
  },
  tableRow: {
    height: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 1,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 4,
    paddingBottom: 2,
  },
  footerBar: {
    height: 2,
    borderRadius: 1,
    width: '60%',
    alignSelf: 'flex-end',
  },
});

