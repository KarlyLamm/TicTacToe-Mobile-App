import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

type ThemeContextType = {
  colorScheme: 'light' | 'dark';
  setColorScheme: (scheme: 'light' | 'dark') => void;
  isDarkMode: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  colorScheme: 'light',
  setColorScheme: () => {},
  isDarkMode: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useRNColorScheme();
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    const loadSavedPreference = async () => {
      try {
        const savedScheme = await AsyncStorage.getItem('colorScheme');
        if (savedScheme) {
          setColorScheme(savedScheme as 'light' | 'dark');
          setIsDarkMode(savedScheme === 'dark');
        } else {
          const scheme = systemColorScheme ?? 'light';
          setColorScheme(scheme);
          setIsDarkMode(scheme === 'dark');
        }
      } catch (error) {
        console.error('Error loading color scheme preference:', error);
      }
    };
    loadSavedPreference();
  }, [systemColorScheme]);

  const updateColorScheme = async (scheme: 'light' | 'dark') => {
    try {
      await AsyncStorage.setItem('colorScheme', scheme);
      setColorScheme(scheme);
      setIsDarkMode(scheme === 'dark');
    } catch (error) {
      console.error('Error saving color scheme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      colorScheme, 
      setColorScheme: updateColorScheme,
      isDarkMode 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 