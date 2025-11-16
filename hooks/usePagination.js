import { useState, useCallback } from 'react';
import logger from '../utils/logger';

/**
 * Hook personnalisé pour la pagination
 * @param {Function} fetchFunction - Fonction qui charge les données
 * @param {number} pageSize - Nombre d'éléments par page
 * @returns {object} État et fonctions de pagination
 */
export function usePagination(fetchFunction, pageSize = 20) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [error, setError] = useState(null);

  /**
   * Charge la première page
   */
  const loadInitial = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setPage(0);
      
      logger.info('Pagination', 'Chargement initial');
      
      const result = await fetchFunction(0, pageSize);
      
      setData(result);
      setHasMore(result.length >= pageSize);
      setPage(1);
      
      logger.success('Pagination', `${result.length} éléments chargés`);
    } catch (err) {
      logger.error('Pagination', 'Erreur chargement initial', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, pageSize]);

  /**
   * Recharge depuis le début (pull-to-refresh)
   */
  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      logger.info('Pagination', 'Rafraîchissement');
      
      const result = await fetchFunction(0, pageSize);
      
      setData(result);
      setHasMore(result.length >= pageSize);
      setPage(1);
      
      logger.success('Pagination', `${result.length} éléments rafraîchis`);
    } catch (err) {
      logger.error('Pagination', 'Erreur rafraîchissement', err);
      setError(err);
    } finally {
      setRefreshing(false);
    }
  }, [fetchFunction, pageSize]);

  /**
   * Charge la page suivante
   */
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) {return;}
    
    try {
      setLoading(true);
      setError(null);
      
      logger.info('Pagination', `Chargement page ${page + 1}`);
      
      const result = await fetchFunction(page, pageSize);
      
      if (result.length === 0) {
        setHasMore(false);
        logger.info('Pagination', 'Fin des données');
      } else {
        setData(prev => [...prev, ...result]);
        setHasMore(result.length >= pageSize);
        setPage(prev => prev + 1);
        
        logger.success('Pagination', `${result.length} éléments supplémentaires chargés`);
      }
    } catch (err) {
      logger.error('Pagination', 'Erreur chargement page suivante', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, pageSize, page, loading, hasMore]);

  /**
   * Réinitialise tout
   */
  const reset = useCallback(() => {
    setData([]);
    setPage(0);
    setHasMore(true);
    setError(null);
    setLoading(false);
    setRefreshing(false);
  }, []);

  return {
    data,
    loading,
    refreshing,
    hasMore,
    error,
    loadInitial,
    loadMore,
    refresh,
    reset,
  };
}

