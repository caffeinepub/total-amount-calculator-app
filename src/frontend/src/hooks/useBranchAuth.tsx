import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface BranchAuthContextType {
  branchUser: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const BranchAuthContext = createContext<BranchAuthContextType | undefined>(undefined);

const BRANCH_CREDENTIALS = [
  { username: 'Bachupally', password: 'branch 1' },
  { username: 'Van', password: 'branch 2' },
];

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
    const match = BRANCH_CREDENTIALS.find(
      (cred) => cred.username === username && cred.password === password
    );
    if (match) {
      setBranchUser(match.username);
      localStorage.setItem(STORAGE_KEY, match.username);
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
