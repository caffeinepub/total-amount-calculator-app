import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { migrateLegacyDataToBranch } from '@/utils/branchScopedStorage';

interface BranchAuthContextType {
  branchUser: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const BranchAuthContext = createContext<BranchAuthContextType | undefined>(undefined);

// Hardcoded branch credentials
const VALID_CREDENTIALS = [
  { username: 'bachupally', password: 'branch1' },
  { username: 'nezampat', password: 'branch2' },
];

const STORAGE_KEY = 'branchAuthUser';

export function BranchAuthProvider({ children }: { children: ReactNode }) {
  const [branchUser, setBranchUser] = useState<string | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      // Validate that stored value is a known branch username
      const isValidBranch = VALID_CREDENTIALS.some(
        cred => cred.username.toLowerCase() === stored.toLowerCase()
      );
      if (isValidBranch) {
        setBranchUser(stored);
        // Trigger migration on hydration
        migrateLegacyDataToBranch(stored);
      } else {
        // Clear invalid stored value
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    // Normalize inputs: trim both, compare username case-insensitively, password exactly
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedPassword = password.trim();

    // Find matching credential
    const matchedCredential = VALID_CREDENTIALS.find(
      cred =>
        cred.username.toLowerCase() === normalizedUsername &&
        cred.password === normalizedPassword
    );

    if (matchedCredential) {
      // Store the canonical username (preserve original casing)
      setBranchUser(matchedCredential.username);
      localStorage.setItem(STORAGE_KEY, matchedCredential.username);
      
      // Trigger migration on successful login
      migrateLegacyDataToBranch(matchedCredential.username);
      
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
