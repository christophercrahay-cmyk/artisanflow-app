# Intégration OpenAI Usage Tracker

**Date** : 13 novembre 2025  
**Objectif** : Intégrer le tracking des tokens OpenAI dans le code existant

---

## 📋 Étapes d'intégration

### 1. Exécuter le script SQL

```bash
# Dans Supabase SQL Editor
# Exécuter : sql/create_openai_usage_table.sql
```

**Résultat** :
- ✅ Table `openai_usage` créée
- ✅ Indexes pour performance
- ✅ RLS activé (user_id isolé)
- ✅ Vue `openai_usage_monthly_stats`
- ✅ Fonction `calculate_openai_cost()`

---

### 2. Modifier `services/transcriptionService.js`

**Ligne 49** → Ajouter tracking après transcription réussie

```javascript
// services/transcriptionService.js
import { trackWhisperUsage } from '../utils/openaiUsageTracker';
import { supabase } from '../supabaseClient';

export const transcribeAudio = async (audioUri) => {
  try {
    const startTime = Date.now();
    
    // ... Code existant (lignes 16-49) ...
    
    const data = await response.json();
    const durationMs = Date.now() - startTime;
    
    console.log('[Transcription] Succès:', data.text);
    
    // ✅ NOUVEAU : Tracker l'utilisation Whisper
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Estimer durée audio (1 token ≈ 0.4s d'audio)
        const estimatedAudioDuration = (data.text?.length || 100) * 0.4;
        await trackWhisperUsage(user.id, estimatedAudioDuration);
      }
    } catch (trackError) {
      console.warn('[Transcription] Erreur tracking (non bloquant):', trackError);
    }
    
    return data.text;
    
  } catch (error) {
    // ... Gestion erreur existante ...
  }
};
```

---

### 3. Modifier `services/aiConversationalService.js`

**Fonction `startDevisSession`** → Tracker GPT-4o-mini

```javascript
// services/aiConversationalService.js
import { trackGPT4MiniUsage } from '../utils/openaiUsageTracker';

export async function startDevisSession(transcription, projectId, clientId, userId, notes) {
  try {
    const startTime = Date.now();
    
    // ... Code existant (appel GPT) ...
    
    const response = await fetch(`${OPENAI_CONFIG.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_CONFIG.models.gpt,
        messages: messages,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const durationMs = Date.now() - startTime;
    
    // ✅ NOUVEAU : Tracker l'utilisation GPT-4o-mini
    if (data.usage) {
      try {
        await trackGPT4MiniUsage(
          userId,
          data.usage.prompt_tokens,
          data.usage.completion_tokens,
          projectId,
          null, // devisId pas encore créé
          durationMs
        );
      } catch (trackError) {
        console.warn('[AI] Erreur tracking (non bloquant):', trackError);
      }
    }
    
    // ... Suite du code ...
  } catch (error) {
    // ... Gestion erreur ...
  }
}
```

**Répéter pour** :
- `answerQuestions()`
- `createDevisFromAI()`

---

### 4. Ajouter dashboard dans `screens/SettingsScreen.js`

**Nouveau bloc : Stats OpenAI**

```javascript
// screens/SettingsScreen.js
import { getCurrentMonthUsage, formatUsageStats } from '../utils/openaiUsageTracker';

export default function SettingsScreen({ navigation }) {
  const [openaiStats, setOpenaiStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    loadOpenAIStats();
  }, []);

  const loadOpenAIStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const stats = await getCurrentMonthUsage(user.id);
        setOpenaiStats(stats);
      }
    } catch (error) {
      logger.error('Settings', 'Erreur chargement stats OpenAI', error);
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <ScrollView>
      {/* ... Sections existantes ... */}
      
      {/* ✅ NOUVEAU : Stats OpenAI */}
      <SectionTitle title="Utilisation IA" emoji="🤖" />
      
      <AppCard>
        <View style={styles.statsRow}>
          <Feather name="cpu" size={20} color={theme.colors.primary} />
          <View style={styles.statsContent}>
            <Text style={styles.statsLabel}>Ce mois-ci</Text>
            {loadingStats ? (
              <ActivityIndicator size="small" />
            ) : openaiStats ? (
              <>
                <Text style={styles.statsValue}>
                  {openaiStats.total.calls} appels
                </Text>
                <Text style={styles.statsSubtext}>
                  {(openaiStats.total.cost / 100).toFixed(2)}€ • {(openaiStats.total.tokens / 1000).toFixed(1)}k tokens
                </Text>
              </>
            ) : (
              <Text style={styles.statsValue}>Aucune donnée</Text>
            )}
          </View>
        </View>
        
        {openaiStats && (
          <View style={styles.statsBreakdown}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>🎤 Whisper</Text>
              <Text style={styles.statValue}>{openaiStats.whisper.calls} appels</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>🤖 GPT-4o-mini</Text>
              <Text style={styles.statValue}>{openaiStats['gpt-4o-mini'].calls} appels</Text>
            </View>
          </View>
        )}
      </AppCard>
    </ScrollView>
  );
}
```

---

### 5. Ajouter alertes quota dépassé

**Dans `utils/proAccess.ts`** → Vérifier quota avant appel

```typescript
// utils/proAccess.ts
import { hasExceededQuota } from './openaiUsageTracker';

export async function requireProOrPaywall(
  navigation: NavigationProp<any>,
  featureName?: string
): Promise<boolean> {
  // ... Code existant (vérif abonnement) ...

  // ✅ NOUVEAU : Vérifier quota OpenAI
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const quotaExceeded = await hasExceededQuota(user.id, 1000); // 10€ max/mois
    if (quotaExceeded) {
      Alert.alert(
        '⚠️ Quota IA dépassé',
        'Vous avez atteint le quota mensuel d\'utilisation IA (10€).\n\nContactez le support pour augmenter votre quota.',
        [{ text: 'OK' }]
      );
      return false;
    }
  }

  return true;
}
```

---

## 📊 Dashboard admin (optionnel)

### Créer vue Supabase pour admins

```sql
-- Vue agrégée pour admin (tous utilisateurs)
CREATE OR REPLACE VIEW openai_usage_admin_stats AS
SELECT 
  u.email,
  DATE_TRUNC('month', ou.created_at) AS month,
  ou.service,
  COUNT(*) AS total_calls,
  SUM(ou.total_tokens) AS total_tokens,
  SUM(ou.estimated_cost_cents) AS total_cost_cents
FROM openai_usage ou
JOIN auth.users u ON u.id = ou.user_id
GROUP BY u.email, DATE_TRUNC('month', ou.created_at), ou.service
ORDER BY month DESC, u.email, ou.service;
```

### Exporter CSV depuis Supabase Dashboard

```sql
-- Top 10 utilisateurs les plus consommateurs
SELECT 
  u.email,
  SUM(ou.estimated_cost_cents) / 100.0 AS total_cost_euros,
  SUM(ou.total_tokens) AS total_tokens
FROM openai_usage ou
JOIN auth.users u ON u.id = ou.user_id
WHERE ou.created_at >= DATE_TRUNC('month', NOW())
GROUP BY u.email
ORDER BY total_cost_euros DESC
LIMIT 10;
```

---

## 📋 Tests

### 1. Test tracking Whisper

```javascript
// Test manuel dans VoiceRecorder.js
const testWhisperTracking = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  await trackWhisperUsage(user.id, 30); // 30 secondes
  
  const stats = await getCurrentMonthUsage(user.id);
  console.log('Stats après tracking Whisper:', stats);
};
```

### 2. Test tracking GPT

```javascript
// Test manuel dans DevisAIGenerator2.js
const testGPTTracking = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  await trackGPT4MiniUsage(user.id, 1000, 500); // 1000 input, 500 output
  
  const stats = await getCurrentMonthUsage(user.id);
  console.log('Stats après tracking GPT:', stats);
};
```

### 3. Test quota dépassé

```javascript
// Insérer manuellement beaucoup d'usages
const testQuota = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Simuler 100 appels coûteux
  for (let i = 0; i < 100; i++) {
    await trackGPT4MiniUsage(user.id, 10000, 5000);
  }
  
  const exceeded = await hasExceededQuota(user.id, 1000);
  console.log('Quota dépassé:', exceeded); // Devrait être true
};
```

---

## ✅ Checklist intégration

- [ ] Exécuter `sql/create_openai_usage_table.sql` dans Supabase
- [ ] Modifier `services/transcriptionService.js` (tracking Whisper)
- [ ] Modifier `services/aiConversationalService.js` (tracking GPT)
- [ ] Ajouter stats dans `screens/SettingsScreen.js`
- [ ] Ajouter vérification quota dans `utils/proAccess.ts`
- [ ] Tester tracking manuellement
- [ ] Vérifier données dans Supabase Dashboard

---

## 📊 Métriques à surveiller

### Coûts moyens attendus par user/mois

- **Whisper** : 5-10 transcriptions/jour × 30 jours = 150-300 appels → ~1-2€/mois
- **GPT-4o-mini** : 2-5 devis/jour × 30 jours = 60-150 appels → ~0.50-1€/mois
- **Total** : ~2-3€/user/mois

### Alertes à configurer

- ⚠️ User > 10€/mois → Email warning
- 🚨 User > 50€/mois → Bloquer temporairement + contact support
- 📊 Total platform > 500€/mois → Review architecture / pricing

---

**Temps estimé intégration** : 2-3h  
**Impact** : Visibilité complète sur les coûts IA + prévention abus

