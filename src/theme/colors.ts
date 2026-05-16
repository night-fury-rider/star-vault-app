export const PinkTheme = {
  primary: '#E91E8C',
  primaryDark: '#C2185B',
  primaryLight: '#F48FB1',
  secondary: '#FF6D9D',
  background: '#FFF0F6',
  surface: '#FFFFFF',
  card: '#FFE4F0',
  border: '#F8BBD9',
  text: {
    primary: '#2D1B24',
    secondary: '#6D4C5E',
    muted: '#B08090',
    inverse: '#FFFFFF',
  },
  tabBar: {
    active: '#E91E8C',
    inactive: '#B08090',
    background: '#FFFFFF',
    border: '#F8BBD9',
  },
  header: {
    background: '#E91E8C',
    text: '#FFFFFF',
  },
  status: {
    success: '#4CAF50',
    error: '#E53935',
    warning: '#FF9800',
  },
};

export const SkyBlueTheme = {
  primary: '#0288D1',
  primaryDark: '#01579B',
  primaryLight: '#81D4FA',
  secondary: '#29B6F6',
  background: '#F0F8FF',
  surface: '#FFFFFF',
  card: '#E1F5FE',
  border: '#B3E5FC',
  text: {
    primary: '#1A2D3D',
    secondary: '#4C6E82',
    muted: '#7A9DB0',
    inverse: '#FFFFFF',
  },
  tabBar: {
    active: '#0288D1',
    inactive: '#7A9DB0',
    background: '#FFFFFF',
    border: '#B3E5FC',
  },
  header: {
    background: '#0288D1',
    text: '#FFFFFF',
  },
  status: {
    success: '#4CAF50',
    error: '#E53935',
    warning: '#FF9800',
  },
};

export const FaintOrangeTheme = {
  primary: '#F57C00',
  primaryDark: '#E65100',
  primaryLight: '#FFCC80',
  secondary: '#FFA726',
  background: '#FFF8F0',
  surface: '#FFFFFF',
  card: '#FFF3E0',
  border: '#FFE0B2',
  text: {
    primary: '#2D1F0E',
    secondary: '#6D4C1E',
    muted: '#B08050',
    inverse: '#FFFFFF',
  },
  tabBar: {
    active: '#F57C00',
    inactive: '#B08050',
    background: '#FFFFFF',
    border: '#FFE0B2',
  },
  header: {
    background: '#F57C00',
    text: '#FFFFFF',
  },
  status: {
    success: '#4CAF50',
    error: '#E53935',
    warning: '#FF9800',
  },
};

export type ThemeType = typeof PinkTheme;
export type ThemeName = 'pink' | 'skyblue' | 'orange';

export const Themes: Record<ThemeName, ThemeType> = {
  pink: PinkTheme,
  skyblue: SkyBlueTheme,
  orange: FaintOrangeTheme,
};
