import { useState } from 'react';
import { validate } from '../validation/schemas';

/**
 * Hook personnalisé pour la validation de formulaires
 * @param {object} schema - Schéma Zod
 * @returns {object} État et fonctions de validation
 */
export function useValidation(schema) {
  const [errors, setErrors] = useState({});

  /**
   * Valide les données
   * @param {object} data - Données à valider
   * @returns {boolean} true si valide, false sinon
   */
  const validateData = (data) => {
    const result = validate(schema, data);
    
    if (result.success) {
      setErrors({});
      return true;
    } else {
      setErrors(result.errors);
      return false;
    }
  };

  /**
   * Valide un champ spécifique
   * @param {string} field - Nom du champ
   * @param {any} value - Valeur du champ
   * @returns {boolean} true si valide, false sinon
   */
  const validateField = (field, value) => {
    const fieldSchema = schema.shape[field];
    
    if (!fieldSchema) {
      return true;
    }

    try {
      fieldSchema.parse(value);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return true;
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [field]: error.errors[0]?.message || 'Erreur de validation',
      }));
      return false;
    }
  };

  /**
   * Réinitialise les erreurs
   */
  const clearErrors = () => {
    setErrors({});
  };

  /**
   * Définit une erreur manuellement
   */
  const setError = (field, message) => {
    setErrors(prev => ({
      ...prev,
      [field]: message,
    }));
  };

  /**
   * Obtient l'erreur d'un champ
   */
  const getError = (field) => {
    return errors[field];
  };

  /**
   * Vérifie si un champ a une erreur
   */
  const hasError = (field) => {
    return Boolean(errors[field]);
  };

  return {
    errors,
    validateData,
    validateField,
    clearErrors,
    setError,
    getError,
    hasError,
  };
}

