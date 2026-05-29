import React, { createContext } from 'react';
import { darkTheme } from '../styles/theme';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  return (
    <ThemeContext.Provider value={{ theme: darkTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
