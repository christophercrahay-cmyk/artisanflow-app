-- Vérifier si la colonne 'statut' existe dans devis ET factures
SELECT 
  table_name,
  column_name,
  'EXISTE' AS status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('devis', 'factures')
  AND column_name = 'statut';

-- Si cette requête retourne 2 lignes (une pour devis, une pour factures),
-- alors la migration fix_public_chantier_complete.sql est correcte telle quelle.

