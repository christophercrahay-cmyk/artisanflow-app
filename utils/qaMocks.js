// utils/qaMocks.js
// Données mockées pour les tests QA

/**
 * Génère un fichier audio mock (base64 d'un fichier audio minimal)
 * Pour les tests sans Whisper réel
 */
export const generateMockAudioUri = () => {
  // Génère un URI factice pour le test
  // Dans un vrai environnement, on utiliserait expo-file-system pour créer un fichier réel
  return `file://mock_audio_${Date.now()}.wav`;
};

/**
 * Transcription mockée pour les tests IA
 */
export const MOCK_TRANSCRIPTION = `
Remplacer 8 prises électriques Schneider
Installer 2 interrupteurs va-et-vient
Prévoir 6 heures de main d'œuvre
Fournitures comprises
`;

/**
 * Génère une image mock (1x1 pixel PNG base64)
 */
export const generateMockImageBase64 = () => {
  // PNG minimal 1x1 transparent
  return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
};

/**
 * Génère un nom unique pour les tests
 */
export const generateTestName = (prefix) => {
  const timestamp = Date.now();
  return `${prefix}_${timestamp}`;
};

/**
 * Crée un objet client mock
 */
export const createMockClient = () => ({
  name: generateTestName('QA_TestClient'),
  phone: '0123456789',
  email: `qa_test_${Date.now()}@artisanflow.com`,
  address: '123 Rue QA Test',
});

/**
 * Crée un objet projet mock
 */
export const createMockProject = (clientId) => ({
  name: generateTestName('QA_TestProject'),
  address: '456 Avenue Test',
  client_id: clientId,
  status: 'active',
  status_text: 'active',
});

