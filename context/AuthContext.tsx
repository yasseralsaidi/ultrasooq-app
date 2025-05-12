"use client";

import { setUserLocale } from "@/src/services/locale";
import { CURRENCIES, LANGUAGES } from "@/utils/constants";
import React, { createContext, startTransition, useContext, useState } from "react";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  tradeRole: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  clearUser: () => void;
  permissions: any[];
  setPermissions: (permissions: any[]) => void;
  applyTranslation: (locale: string) => void;
  selectedLocale: string;
  langDir: string;
  currency: typeof CURRENCIES[0];
  changeCurrency: (code: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{
  user: User | null;
  permissions: any[];
  children: React.ReactNode;
  locale?: string;
}> = ({ user: initialUser, permissions: initialPermissions, children, locale }) => {
  const [user, setUser] = useState<User | null>(initialUser);

  const [permissions, setPermissions] = useState<any[]>(initialPermissions);

  const isAuthenticated = !!user;

  const clearUser = () => {
    setUser(null);
  };

  const [selectedLocale, setSelectedLocale] = useState<string>(locale || 'en');

  const applyTranslation = async (locale: string) => {
    await setUserLocale(locale);
    window.localStorage.setItem('locale', locale);
    startTransition(() => {
      setSelectedLocale(locale);
    });
  };

  const [currency, setCurrency] = useState<typeof CURRENCIES[0]>(CURRENCIES.find(item => item.code == 'USD') || CURRENCIES[0]);

  const changeCurrency = (code: string) => {
    setCurrency(CURRENCIES.find(item => item.code == code) || CURRENCIES[0]);
    startTransition(() => {
      
    })
  };

  let data = { 
    user, 
    setUser, 
    isAuthenticated, 
    clearUser, 
    permissions, 
    setPermissions, 
    applyTranslation, 
    selectedLocale, 
    langDir: LANGUAGES.find(language => language.locale == selectedLocale)?.direction || 'ltr', 
    currency, 
    changeCurrency
  };

  return (
    <AuthContext.Provider value={data}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
