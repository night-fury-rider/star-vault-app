import React, { createContext, useContext, useState } from 'react';
import { Themes, ThemeName, ThemeType, SkyBlueTheme } from './colors';

interface ThemeContextType {
  theme: ThemeType;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
}

// ✅ must have a default value
const ThemeContext = createContext<ThemeContextType>({
  theme: SkyBlueTheme,
  themeName: 'skyblue',
  setTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeName, setThemeName] = useState<ThemeName>('skyblue');

  return (
    <ThemeContext.Provider
      value={{
        theme: Themes[themeName],
        themeName,
        setTheme: setThemeName,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// ✅ guard against null context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
