import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface BranchAuthContextType {
  branchUser: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const BranchAuthContext = createContext<BranchAuthContextType | undefined>(undefined);

// Hardcoded single credential
const VALID_USERNAME = 'bachupally';
const VALID_PASSWORD = 'branch1';

const STORAGE_KEY = 'branchAuthUser';

export function BranchAuthProvider({ children }: { children: ReactNode }) {
  const [branchUser, setBranchUser] = useState<string | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setBranchUser(stored);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    // Normalize inputs: trim both, compare username case-insensitively, password exactly
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (normalizedUsername === VALID_USERNAME.toLowerCase() && normalizedPassword === VALID_PASSWORD) {
      // Store the canonical username
      setBranchUser(VALID_USERNAME);
      localStorage.setItem(STORAGE_KEY, VALID_USERNAME);
      return true;
    }
    return false;
  };

  const logout = () => {
    setBranchUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const isAuthenticated = branchUser !== null;

  return (
    <BranchAuthContext.Provider value={{ branchUser, login, logout, isAuthenticated }}>
      {children}
    </BranchAuthContext.Provider>
  );
}

export function useBranchAuth() {
  const context = useContext(BranchAuthContext);
  if (!context) {
    throw new Error('useBranchAuth must be used within BranchAuthProvider');
  }
  return context;
}
