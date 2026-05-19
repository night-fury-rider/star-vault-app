import React, { createContext, useContext, useState } from 'react';
import { Themes, ThemeName, ThemeType, SkyBlueTheme } from './colors';
import StorageService from '../services/StorageService';
import LoggerService from '../services/LoggerService';

const THEME_KEY = 'starvault_theme';

interface ThemeContextType {
  theme: ThemeType;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: SkyBlueTheme,
  themeName: 'skyblue',
  setTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    try {
      const saved = StorageService.get(THEME_KEY);
      if (saved && saved in Themes) {
        return saved as ThemeName;
      }
    } catch (e) {
      LoggerService.error('❌ Failed to load theme:', e);
    }
    return 'skyblue';
  });

  const setTheme = (name: ThemeName) => {
    try {
      setThemeName(name);
      StorageService.set(THEME_KEY, name);
    } catch (e) {
      LoggerService.error('❌ Failed to save theme:', e);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: Themes[themeName],
        themeName,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
