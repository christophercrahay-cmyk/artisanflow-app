/**
 * Styles centralisés pour toutes les modales ArtisanFlow
 * Thème dark premium cohérent avec le design system
 */

import { StyleSheet } from 'react-native';
import { COLORS } from './colors';

export const modalStyles = StyleSheet.create({
  container: {
    backgroundColor: "#0F172A",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#F1F5F9",
  },
  body: {
    fontSize: 15,
    color: "#CBD5E1",
    marginTop: 12,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 24,
  },
  cancelText: {
    fontWeight: "600",
    color: "#CBD5E1",
    marginRight: 32,
  },
  confirmText: {
    fontWeight: "700",
    color: "#3B82F6",
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.55)",
  },
});

/**
 * Styles pour les modales React Native Modal
 */
export const modalComponentStyles = {
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    backgroundColor: "#0F172A",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1E293B",
    width: "100%",
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#F1F5F9",
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: "#CBD5E1",
    lineHeight: 22,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 24,
    gap: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonCancel: {
    marginRight: 16,
  },
  buttonTextCancel: {
    fontWeight: "600",
    color: "#CBD5E1",
    fontSize: 15,
  },
  buttonTextConfirm: {
    fontWeight: "700",
    color: "#3B82F6",
    fontSize: 15,
  },
  buttonTextDanger: {
    fontWeight: "700",
    color: COLORS.danger,
    fontSize: 15,
  },
};

