// client/src/context/NavigationContext.jsx
import React, { createContext, useState, useContext } from 'react';

// Initialize the context engine instance
const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <NavigationContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </NavigationContext.Provider>
  );
};

// Custom utility hook so we don't have to import both useContext and NavigationContext every time
export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be utilized within a NavigationProvider');
  }
  return context;
};