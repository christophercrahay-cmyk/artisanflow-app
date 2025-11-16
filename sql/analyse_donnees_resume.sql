-- ============================================
-- ANALYSE DONNÉES - RÉSUMÉ COMPLET
-- ============================================
-- Une seule requête qui donne tous les chiffres
-- ============================================

SELECT 
  '📊 RÉSUMÉ ANALYSE DONNÉES' as titre,
  
  -- CLIENTS
  (SELECT COUNT(*) FROM clients) as total_clients,
  (SELECT COUNT(*) FROM clients WHERE user_id IS NULL) as clients_sans_user_id,
  (SELECT COUNT(*) FROM clients WHERE name IS NULL OR TRIM(name) = '') as clients_sans_nom,
  
  -- PROJECTS
  (SELECT COUNT(*) FROM projects) as total_projects,
  (SELECT COUNT(*) FROM projects WHERE user_id IS NULL) as projects_sans_user_id,
  (SELECT COUNT(*) FROM projects p LEFT JOIN clients c ON c.id = p.client_id WHERE p.client_id IS NULL OR c.id IS NULL) as projects_orphelins,
  (SELECT COUNT(*) FROM projects WHERE name IS NULL OR TRIM(name) = '') as projects_sans_nom,
  
  -- NOTES
  (SELECT COUNT(*) FROM notes) as total_notes,
  (SELECT COUNT(*) FROM notes n LEFT JOIN projects p ON p.id = n.project_id WHERE n.project_id IS NULL OR p.id IS NULL) as notes_orphelines,
  (SELECT COUNT(*) FROM notes WHERE type = 'voice' AND (transcription IS NULL OR TRIM(transcription) = '')) as notes_vocales_sans_transcription,
  
  -- PHOTOS PROJET
  (SELECT COUNT(*) FROM project_photos) as total_photos_projet,
  (SELECT COUNT(*) FROM project_photos ph LEFT JOIN projects p ON p.id = ph.project_id WHERE ph.project_id IS NULL OR p.id IS NULL) as photos_projet_orphelines,
  
  -- PHOTOS CLIENT
  (SELECT COUNT(*) FROM client_photos) as total_photos_client,
  (SELECT COUNT(*) FROM client_photos ph LEFT JOIN clients c ON c.id = ph.client_id WHERE ph.client_id IS NULL OR c.id IS NULL) as photos_client_orphelines,
  
  -- DEVIS
  (SELECT COUNT(*) FROM devis) as total_devis,
  (SELECT COUNT(*) FROM devis d LEFT JOIN projects p ON p.id = d.project_id WHERE d.project_id IS NULL OR p.id IS NULL) as devis_orphelins,
  (SELECT COUNT(*) FROM devis d LEFT JOIN devis_lignes dl ON dl.devis_id = d.id WHERE dl.id IS NULL) as devis_sans_lignes,
  
  -- FACTURES
  (SELECT COUNT(*) FROM factures) as total_factures,
  (SELECT COUNT(*) FROM factures f LEFT JOIN projects p ON p.id = f.project_id WHERE f.project_id IS NULL OR p.id IS NULL) as factures_orphelines;

