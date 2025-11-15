# Plan de Refactoring - Fichiers > 500 lignes

**Date** : 13 novembre 2025  
**Objectif** : Découper les gros fichiers en composants et hooks réutilisables

---

## 📊 Fichiers à refactorer

| Fichier | Lignes | Responsabilités | Priorité |
|---------|--------|----------------|----------|
| `VoiceRecorder.js` | 811 | Enregistrement + transcription + lecture + édition | 🔴 Haute |
| `CaptureHubScreen2.js` | 888 | Capture photo/vocal/note + upload + linking | 🔴 Haute |
| `DocumentsScreen2.js` | 866 | Liste devis/factures + filtrage + partage PDF | 🟠 Moyenne |
| `DevisFactures.js` | 721 | Formulaire devis/factures + vocal | 🟢 Basse |

---

## 🎯 VoiceRecorder.js (811 lignes)

### Responsabilités actuelles

1. **Enregistrement audio** (lignes 114-202)
   - Permission micro
   - Audio.Recording
   - Upload Supabase Storage
   - Transcription Whisper
   - Analyse GPT

2. **Gestion liste notes** (lignes 70-96)
   - loadNotes()
   - Filtrage par projectId

3. **Lecture audio** (lignes 426-463)
   - play()
   - Audio.Sound
   - Gestion état playingId

4. **Édition transcription** (lignes 465-480)
   - saveEdit()
   - TextInput inline

5. **Suppression note** (lignes 483-534)
   - deleteNote()
   - Alert confirmation

6. **Composant Item** (lignes 536-707)
   - Animations (opacityAnim, translateYAnim, scaleAnim)
   - UI complexe (badge analyse, boutons actions)

7. **Génération devis IA** (lignes 708-770)
   - handleGenerateQuote()
   - Appel service IA

### Découpage proposé

#### 1. Hook `useVoiceRecorder`

```typescript
// hooks/useVoiceRecorder.ts
export function useVoiceRecorder(projectId: string) {
  const [recording, setRecording] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [transcription, setTranscription] = useState('');
  
  const startRecording = async () => { /* ... */ };
  const stopRecording = async () => { /* ... */ };
  const uploadAndSave = async () => { /* ... */ };
  
  return {
    recording,
    uploading,
    transcription,
    startRecording,
    stopRecording,
  };
}
```

**Lignes extraites** : 114-202 (~90 lignes)

---

#### 2. Hook `useNotesList`

```typescript
// hooks/useNotesList.ts
export function useNotesList(projectId: string) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const loadNotes = async () => { /* ... */ };
  const deleteNote = async (noteId, storagePath) => { /* ... */ };
  
  return {
    notes,
    loading,
    loadNotes,
    deleteNote,
  };
}
```

**Lignes extraites** : 70-534 (~70 lignes)

---

#### 3. Composant `VoiceNoteItem`

```typescript
// components/notes/VoiceNoteItem.tsx
export function VoiceNoteItem({
  note,
  index,
  isEditing,
  playingId,
  onPlay,
  onEdit,
  onSave,
  onDelete,
  onGenerateQuote,
}) {
  // Animations
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  return (
    <Animated.View>
      {/* UI item */}
    </Animated.View>
  );
}
```

**Lignes extraites** : 536-707 (~170 lignes)

---

#### 4. Hook `useAudioPlayer`

```typescript
// hooks/useAudioPlayer.ts
export function useAudioPlayer() {
  const [playingId, setPlayingId] = useState(null);
  const soundRef = useRef(null);
  
  const play = async (noteId, path) => { /* ... */ };
  const stop = async () => { /* ... */ };
  
  return { playingId, play, stop };
}
```

**Lignes extraites** : 426-463 (~40 lignes)

---

#### 5. Fichier final `VoiceRecorder.js`

```typescript
// VoiceRecorder.js (NEW - ~200 lignes)
export default function VoiceRecorder({ projectId }) {
  const { recording, transcription, startRecording, stopRecording } = useVoiceRecorder(projectId);
  const { notes, loading, loadNotes, deleteNote } = useNotesList(projectId);
  const { playingId, play } = useAudioPlayer();
  const [editingId, setEditingId] = useState(null);
  
  return (
    <View>
      <RecordingControls
        recording={recording}
        onStart={startRecording}
        onStop={stopRecording}
      />
      
      <FlatList
        data={notes}
        renderItem={({ item, index }) => (
          <VoiceNoteItem
            note={item}
            index={index}
            isEditing={editingId === item.id}
            playingId={playingId}
            onPlay={play}
            onDelete={deleteNote}
          />
        )}
      />
    </View>
  );
}
```

**Lignes finales** : ~200 lignes (-75%)

---

## 🎯 CaptureHubScreen2.js (888 lignes)

### Découpage proposé

#### 1. Hook `useCaptureUpload`

```typescript
// hooks/useCaptureUpload.ts
export function useCaptureUpload() {
  const [uploading, setUploading] = useState(false);
  
  const uploadPhoto = async (uri) => { /* ... */ };
  const uploadAudio = async (uri) => { /* ... */ };
  const uploadNote = async (text) => { /* ... */ };
  
  return { uploading, uploadPhoto, uploadAudio, uploadNote };
}
```

**Lignes extraites** : ~150 lignes

---

#### 2. Composant `CaptureCard`

```typescript
// components/capture/CaptureCard.tsx
export function CaptureCard({ icon, label, onPress, disabled }) {
  const scale = useRef(new Animated.Value(1)).current;
  
  const handlePress = () => {
    Animated.spring(scale, { toValue: 0.95 }).start(() => {
      scale.setValue(1);
      onPress();
    });
  };
  
  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Text>{icon}</Text>
        <Text>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}
```

**Lignes extraites** : ~80 lignes

---

#### 3. Fichier final

**Lignes finales** : ~400 lignes (-55%)

---

## 🎯 DocumentsScreen2.js (866 lignes)

### Découpage proposé

#### 1. Hook `useDocumentsFilter`

```typescript
// hooks/useDocumentsFilter.ts
export function useDocumentsFilter(documents) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('tous');
  const [sortBy, setSortBy] = useState('date_desc');
  
  const filteredDocuments = useMemo(() => {
    /* Logique filtrage */
  }, [documents, searchQuery, statusFilter, sortBy]);
  
  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    filteredDocuments,
  };
}
```

**Lignes extraites** : ~100 lignes

---

#### 2. Composant `DocumentCard`

```typescript
// components/documents/DocumentCard.tsx
export function DocumentCard({ document, onShare, onView, onDelete }) {
  return (
    <AppCard>
      <View style={styles.header}>
        <Text>{document.type === 'devis' ? '📄' : '💰'}</Text>
        <Text>{document.number}</Text>
      </View>
      {/* ... */}
    </AppCard>
  );
}
```

**Lignes extraites** : ~120 lignes

---

#### 3. Composant `DocumentFilters`

```typescript
// components/documents/DocumentFilters.tsx
export function DocumentFilters({ filter, onFilterChange, statusFilter, onStatusChange }) {
  return (
    <View>
      <SegmentedControl value={filter} onChange={onFilterChange} />
      <StatusFilterButtons value={statusFilter} onChange={onStatusChange} />
    </View>
  );
}
```

**Lignes extraites** : ~80 lignes

---

#### 4. Fichier final

**Lignes finales** : ~450 lignes (-48%)

---

## 🎯 DevisFactures.js (721 lignes)

### Découpage proposé

#### 1. Hook `useDevisForm`

```typescript
// hooks/useDevisForm.ts
export function useDevisForm(initialValues) {
  const [numero, setNumero] = useState('');
  const [montant, setMontant] = useState('');
  const [tva, setTva] = useState('20');
  
  const calculateMontantTTC = () => { /* ... */ };
  const resetForm = () => { /* ... */ };
  const saveItem = async () => { /* ... */ };
  
  return {
    numero,
    setNumero,
    montant,
    setMontant,
    tva,
    setTva,
    calculateMontantTTC,
    resetForm,
    saveItem,
  };
}
```

**Lignes extraites** : ~150 lignes

---

#### 2. Composant `DevisFormModal`

```typescript
// components/devis/DevisFormModal.tsx
export function DevisFormModal({ visible, onClose, onSave, initialValues }) {
  const form = useDevisForm(initialValues);
  
  return (
    <Modal visible={visible}>
      <TextInput value={form.numero} onChangeText={form.setNumero} />
      <TextInput value={form.montant} onChangeText={form.setMontant} />
      <Button title="Enregistrer" onPress={form.saveItem} />
    </Modal>
  );
}
```

**Lignes extraites** : ~200 lignes

---

#### 3. Fichier final

**Lignes finales** : ~350 lignes (-51%)

---

## 📋 Plan d'exécution

### Phase 1 : Créer hooks (2-3h)

1. `hooks/useVoiceRecorder.ts`
2. `hooks/useNotesList.ts`
3. `hooks/useAudioPlayer.ts`
4. `hooks/useCaptureUpload.ts`
5. `hooks/useDocumentsFilter.ts`
6. `hooks/useDevisForm.ts`

### Phase 2 : Créer composants (3-4h)

1. `components/notes/VoiceNoteItem.tsx`
2. `components/notes/RecordingControls.tsx`
3. `components/capture/CaptureCard.tsx`
4. `components/documents/DocumentCard.tsx`
5. `components/documents/DocumentFilters.tsx`
6. `components/devis/DevisFormModal.tsx`

### Phase 3 : Refactoring fichiers principaux (2-3h)

1. Refactor `VoiceRecorder.js`
2. Refactor `CaptureHubScreen2.js`
3. Refactor `DocumentsScreen2.js`
4. Refactor `DevisFactures.js`

### Phase 4 : Tests (1-2h)

1. Tester chaque écran après refactoring
2. Vérifier aucune régression
3. Tests unitaires sur hooks

**Total estimé** : 8-12h

---

## ✅ Avantages

- ✅ Maintenabilité : fichiers < 500 lignes
- ✅ Réutilisabilité : hooks partagés
- ✅ Testabilité : isolation logique métier
- ✅ Lisibilité : responsabilités claires
- ✅ Performance : re-renders optimisés (hooks isolés)

---

## ⚠️ Risques

- Bugs de régression si refactoring trop rapide
- Tests incomplets → recommencer les tests manuels
- Conflits git si plusieurs branches

**Mitigation** : Refactoring progressif (1 fichier à la fois) + tests après chaque étape

---

**Prochaine étape** : Commencer par `VoiceRecorder.js` (plus gros impact)

