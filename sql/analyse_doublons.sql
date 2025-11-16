-- ============================================
-- ANALYSE DOUBLONS
-- ============================================

-- Doublons clients (même nom + même téléphone)
SELECT 
  '⚠️ DOUBLONS CLIENTS' as type,
  name,
  phone,
  COUNT(*) as nombre_doublons,
  array_agg(id) as ids,
  array_agg(user_id) as user_ids,
  array_agg(created_at) as dates_creation
FROM clients
WHERE name IS NOT NULL AND phone IS NOT NULL
GROUP BY name, phone
HAVING COUNT(*) > 1
ORDER BY nombre_doublons DESC;

