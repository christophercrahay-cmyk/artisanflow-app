# Audit RevenueCat & Paywall

**Date** : 13 novembre 2025  
**Objectif** : Vérifier implémentation et préparation au lancement

---

## ✅ Ce qui est implémenté

### 1. Service RevenueCat (`services/payments/revenuecat.ts`)

- ✅ `initRevenueCat()` : initialise SDK avec API keys iOS/Android
- ✅ `hasProAccess()` : vérifie entitlement `pro_access` avec cache 30s
- ✅ `purchaseMonthly()` : achat abonnement mensuel
- ✅ `purchaseAnnual()` : achat abonnement annuel
- ✅ `restorePurchases()` : restauration achats précédents
- ✅ Listener `CustomerInfo` pour invalidation cache
- ✅ Mode dev (`IAP_ENABLED=false`) : accès libre

### 2. Écran Paywall (`screens/PaywallScreen.tsx`)

- ✅ UI complète avec 2 plans (mensuel/annuel)
- ✅ Badge "Recommandé" sur plan annuel
- ✅ Mention "Essai gratuit 7 jours"
- ✅ Bouton "Restaurer mes achats"
- ✅ Lien "Gérer mon abonnement" (App Store / Play Store)
- ✅ Mentions légales (CGU + Confidentialité)
- ✅ États de chargement/purchasing
- ✅ Gestion erreurs

### 3. Gating centralisé (`utils/proAccess.ts`)

- ✅ `requireProOrPaywall()` : vérifie accès et redirige
- ✅ Utilisé dans : VoiceRecorder, DevisAIGenerator2, ClientsListScreen2

### 4. Initialisation (`App.js`)

- ✅ Ligne 66-73 : `initRevenueCat(session.user.id)` après connexion

---

## ⚠️ Points à corriger AVANT lancement

### 🔴 Critique

1. **Links CGU / Confidentialité en dur**
   - `https://artisanflow.app/cgu` (ligne 329)
   - `https://artisanflow.app/confidentialite` (ligne 336)
   - ❌ Ces pages n'existent pas encore
   - **Action** : Créer les pages légales sur le site web

2. **Pas de fallback si RevenueCat fail à l'init**
   - Si SDK crash → app inutilisable
   - **Action** : Wraper `initRevenueCat()` dans try/catch non-bloquant

3. **Pas d'onboarding essai gratuit**
   - L'utilisateur ne sait pas qu'il a 7 jours gratuits
   - **Action** : Écran onboarding au 1er lancement avec explication

### 🟠 Important

4. **Pas de tracking analytics**
   - Aucun event envoyé (purchase_initiated, subscription_started, etc.)
   - **Action** : Intégrer analytics (Mixpanel, Amplitude, ou RevenueCat Charts)

5. **Pas de gestion des états de subscription**
   - Pas de banner "Essai expire dans 3 jours"
   - Pas de notification "Abonnement expiré"
   - **Action** : Ajouter banners + notifications push

6. **Pas de A/B testing paywall**
   - Prix fixes (29,99€/mois, 299€/an)
   - **Action** : Tester différents prix via RevenueCat Experiments (post-lancement)

### 🟢 Nice-to-have

7. **Pas de deeplink vers features depuis paywall**
   - Cliquer sur "Devis IA illimités" ne montre pas d'exemple
   - **Action** : Ajouter preview/demo des features

8. **Pas de social proof**
   - Aucun témoignage, note, ou "2000+ artisans"
   - **Action** : Ajouter social proof (post-validation concept)

---

## 📋 Checklist pré-lancement

### Configuration RevenueCat Dashboard

- [ ] Créer products dans App Store Connect / Play Console
- [ ] Configurer entitlement `pro_access` dans RevenueCat
- [ ] Créer offerings `default` avec packages `monthly` + `annual`
- [ ] Configurer essai gratuit 7 jours sur les 2 packages
- [ ] Tester sandbox iOS + Android
- [ ] Configurer webhooks RevenueCat → Supabase (tracking abonnements)

### Code

- [ ] Créer pages CGU + Confidentialité sur site web
- [ ] Mettre à jour liens dans PaywallScreen.tsx
- [ ] Ajouter try/catch non-bloquant dans App.js (initRevenueCat)
- [ ] Créer écran onboarding essai gratuit
- [ ] Tester flow complet : install → signup → paywall → purchase → access

### Tests

- [ ] Test purchase iOS sandbox (mensuel + annuel)
- [ ] Test purchase Android sandbox (mensuel + annuel)
- [ ] Test restore purchases (iOS + Android)
- [ ] Test expiration essai 7 jours (sandbox accelerated)
- [ ] Test annulation abonnement
- [ ] Test renouvellement automatique
- [ ] Test user sans abonnement → gating sur features

---

## 🎯 Recommandations architecture

### Amélioration 1 : Webhook Supabase pour sync abonnements

**Pourquoi** : Actuellement, l'app vérifie l'entitlement via SDK. Si le backend doit vérifier (ex: Edge Function), il ne peut pas.

**Solution** : Créer webhook RevenueCat → Edge Function qui met à jour `profiles.subscription_status`

```sql
-- Ajouter colonne dans profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;
```

```typescript
// supabase/functions/revenuecat-webhook/index.ts
export default async (req: Request) => {
  const event = await req.json();
  
  if (event.type === 'INITIAL_PURCHASE' || event.type === 'RENEWAL') {
    await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_expires_at: event.expiration_date
      })
      .eq('id', event.app_user_id);
  }
  
  if (event.type === 'EXPIRATION' || event.type === 'CANCELLATION') {
    await supabase
      .from('profiles')
      .update({ subscription_status: 'expired' })
      .eq('id', event.app_user_id);
  }
  
  return new Response('OK', { status: 200 });
};
```

### Amélioration 2 : Banner "Essai expire bientôt"

```tsx
// components/TrialExpiringBanner.tsx
export function TrialExpiringBanner() {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  
  useEffect(() => {
    checkTrial();
  }, []);
  
  const checkTrial = async () => {
    const customerInfo = await Purchases.getCustomerInfo();
    const expirationDate = customerInfo.entitlements.active['pro_access']?.expirationDate;
    
    if (expirationDate) {
      const now = new Date();
      const expires = new Date(expirationDate);
      const diff = expires.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      
      if (days <= 3 && days > 0) {
        setDaysLeft(days);
      }
    }
  };
  
  if (!daysLeft) return null;
  
  return (
    <View style={styles.banner}>
      <Text>⏰ Essai expire dans {daysLeft} jour{daysLeft > 1 ? 's' : ''}</Text>
      <Button title="Souscrire" onPress={() => {/* navigate to paywall */}} />
    </View>
  );
}
```

---

## 📊 Métriques à suivre (post-lancement)

- **Taux de conversion** : installs → trials (objectif : > 20%)
- **Taux de rétention trial** : trials → paid (objectif : > 40%)
- **Churn mensuel** : abonnements annulés / actifs (objectif : < 10%)
- **LTV (Lifetime Value)** : revenu moyen par user (objectif : > 100€)
- **CAC (Cost Acquisition)** : coût acquisition client (objectif : < 50€)

---

## ✅ Conclusion

**État actuel** : RevenueCat & Paywall fonctionnels, mais **incomplets pour un lancement**.

**Avant janvier 2025** :
1. Créer pages légales (CGU, Confidentialité)
2. Onboarding essai gratuit
3. Fallback si RevenueCat fail
4. Tester flow complet iOS + Android sandbox

**Post-lancement** :
- Webhook Supabase
- Banner essai expirant
- Analytics / tracking
- A/B testing prix

