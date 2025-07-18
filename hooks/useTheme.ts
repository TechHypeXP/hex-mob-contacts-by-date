import { useState, useEffect } from 'react';
import { Appearance, ColorSchemeName, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = 'app_theme';

export type ThemeMode = 'light' | 'dark' | 'auto';

export function useTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  const isDark = themeMode === 'dark' || 
    (themeMode === 'auto' && systemColorScheme === 'dark');

  const colors = isDark ? darkColors : lightColors;

  // Load saved theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme) {
          setThemeMode(savedTheme as ThemeMode);
        }
      } catch (err) {
        console.warn('Failed to load theme:', err);
      }
    };

    loadTheme();

    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    // Listen for screen dimension changes
    const dimensionSubscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });
    return () => {
      subscription?.remove();
      dimensionSubscription?.remove();
    };
  }, []);

  const changeTheme = async (mode: ThemeMode) => {
    setThemeMode(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (err) {
      console.warn('Failed to save theme:', err);
    }
  };

  return {
    themeMode,
    isDark,
    colors,
    screenData,
    changeTheme,
  };
}

const lightColors = {
  primary: '#2196F3',
  secondary: '#009688',
  accent: '#FF9800',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',
  onSurface: '#212121',
  onSurfaceVariant: '#757575',
  outline: '#E0E0E0',
  shadow: '#000000',
  text: '#212121',
  textSecondary: '#757575',
  textTertiary: '#9E9E9E',
};

const darkColors = {
  primary: '#64B5F6',
  secondary: '#4DB6AC',
  accent: '#FFB74D',
  success: '#81C784',
  warning: '#FFB74D',
  error: '#E57373',
  background: '#0F0F0F',
  surface: '#1A1A1A',
  surfaceVariant: '#2A2A2A',
  onSurface: '#FFFFFF',
  onSurfaceVariant: '#E0E0E0',
  outline: '#333333',
  shadow: '#000000',
  text: '#FFFFFF',
  textSecondary: '#E0E0E0',
  textTertiary: '#BDBDBD',
};