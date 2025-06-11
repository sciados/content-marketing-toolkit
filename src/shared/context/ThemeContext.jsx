// src/context/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const ThemeContext = createContext();

// Available themes
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

/**
 * Context provider for theme settings
 * Provides theme state and methods to all child components
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(THEMES.LIGHT);
  const [systemTheme, setSystemTheme] = useState(THEMES.LIGHT);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || THEMES.LIGHT;
    setTheme(savedTheme);
    
    // Check for system theme preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setSystemTheme(prefersDark ? THEMES.DARK : THEMES.LIGHT);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setSystemTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
    };
    
    // Add listener
    mediaQuery.addEventListener('change', handleChange);
    
    // Clean up
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Update theme and save to localStorage
  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Get the active theme (resolves 'system' to the actual system theme)
  const activeTheme = theme === THEMES.SYSTEM ? systemTheme : theme;

  // Apply theme to the document
  useEffect(() => {
    // Remove any existing theme classes
    document.documentElement.classList.remove(THEMES.LIGHT, THEMES.DARK);
    
    // Add the active theme class
    document.documentElement.classList.add(activeTheme);
    
    // For Tailwind dark mode
    if (activeTheme === THEMES.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [activeTheme]);

  // Value to be provided to consumers
  const value = {
    theme,
    activeTheme,
    THEMES,
    setTheme: updateTheme,
    isDark: activeTheme === THEMES.DARK,
    isLight: activeTheme === THEMES.LIGHT
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};
