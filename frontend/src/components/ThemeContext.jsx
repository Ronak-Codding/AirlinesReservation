import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children, storageKey = 'theme' }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add(storageKey === 'admin-theme' ? 'admin-dark' : 'user-dark');
      document.body.classList.remove(storageKey === 'admin-theme' ? 'admin-light' : 'user-light');
    } else {
      document.body.classList.add(storageKey === 'admin-theme' ? 'admin-light' : 'user-light');
      document.body.classList.remove(storageKey === 'admin-theme' ? 'admin-dark' : 'user-dark');
    }
    localStorage.setItem(storageKey, JSON.stringify(darkMode));
  }, [darkMode, storageKey]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};