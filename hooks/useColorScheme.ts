import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

// Shared state to track the current color scheme
let currentColorScheme: 'light' | 'dark' | null = null;
const listeners = new Set<() => void>();

export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [storedScheme, setStoredScheme] = useState<'light' | 'dark' | null>(null);
  const systemScheme = useRNColorScheme();

  const loadStoredPreference = async () => {
    try {
      const stored = await AsyncStorage.getItem('colorScheme');
      if (stored && stored !== currentColorScheme) {
        currentColorScheme = stored as 'light' | 'dark';
        setStoredScheme(currentColorScheme);
        // Notify all listeners of the change
        listeners.forEach(listener => listener());
      }
    } catch (error) {
      console.error('Error loading color scheme preference:', error);
    }
  };

  useEffect(() => {
    loadStoredPreference();
    setHasHydrated(true);

    // Add this component as a listener
    const listener = () => {
      loadStoredPreference();
    };
    listeners.add(listener);

    // Cleanup
    return () => {
      listeners.delete(listener);
    };
  }, []);

  if (hasHydrated) {
    return storedScheme ?? systemScheme ?? 'light';
  }

  return 'light';
}
