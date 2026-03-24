import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  updateTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  updateTheme: async () => { },
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const updateTheme = async () => {
    try {
      const prefsJson = await AsyncStorage.getItem('@preferencias_paciente_geriatrico');
      if (prefsJson) {
        const prefs = JSON.parse(prefsJson);
        setIsDarkMode(prefs.modoOscuro || false);
      } else {
        setIsDarkMode(false);
      }
    } catch (error) {
      console.error('Error loading theme preferences:', error);
    }
  };

  useEffect(() => {
    updateTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ isDarkMode, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
