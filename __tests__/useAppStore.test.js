import { renderHook, act } from '@testing-library/react-native';
import { useAppStore } from '../store/useAppStore';

describe('useAppStore', () => {
  beforeEach(() => {
    // Réinitialiser le store avant chaque test
    const store = useAppStore.getState();
    store.clearAll();
  });

  it('initialise avec un state vide', () => {
    const { result } = renderHook(() => useAppStore());
    
    expect(result.current.currentClient).toBeNull();
    expect(result.current.currentProject).toBeNull();
    expect(result.current.clients).toEqual([]);
    expect(result.current.projects).toEqual([]);
  });

  it('définit et récupère le client actuel', () => {
    const { result } = renderHook(() => useAppStore());
    
    const testClient = { id: '123', name: 'Test Client' };
    
    act(() => {
      result.current.setCurrentClient(testClient);
    });

    expect(result.current.currentClient).toEqual(testClient);
  });

  it('définit et récupère le projet actuel', () => {
    const { result } = renderHook(() => useAppStore());
    
    const testProject = { id: '456', name: 'Test Project' };
    
    act(() => {
      result.current.setCurrentProject(testProject);
    });

    expect(result.current.currentProject).toEqual(testProject);
  });

  it('nettoie le client', () => {
    const { result } = renderHook(() => useAppStore());
    
    const testClient = { id: '123', name: 'Test Client' };
    
    act(() => {
      result.current.setCurrentClient(testClient);
    });

    expect(result.current.currentClient).toEqual(testClient);

    act(() => {
      result.current.clearClient();
    });

    expect(result.current.currentClient).toBeNull();
  });

  it('lance une erreur si client requis mais non défini', () => {
    const { result } = renderHook(() => useAppStore());

    expect(() => {
      result.current.requireClient();
    }).toThrow('NO_CLIENT_SELECTED');
  });

  it('retourne le client si requireClient est appelé avec un client défini', () => {
    const { result } = renderHook(() => useAppStore());
    
    const testClient = { id: '123', name: 'Test Client' };
    
    act(() => {
      result.current.setCurrentClient(testClient);
    });

    const client = result.current.requireClient();
    expect(client).toEqual(testClient);
  });
});

