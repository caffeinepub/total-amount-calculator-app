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
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        // Validate that stored value is a known branch username
        const isValidBranch = VALID_CREDENTIALS.some(
          cred => cred.username.toLowerCase() === stored.toLowerCase()
        );
        if (isValidBranch) {
          console.log('Hydrating branch user from localStorage:', stored);
          setBranchUser(stored);
          // Trigger migration on hydration
          migrateLegacyDataToBranch(stored);
        } else {
          // Clear invalid stored value
          console.warn('Invalid branch user in localStorage, clearing:', stored);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to hydrate branch auth from localStorage:', error);
      // Clear potentially corrupted data
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error('Failed to clear corrupted localStorage:', e);
      }
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    try {
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
        console.log('Branch login successful:', matchedCredential.username);
        setBranchUser(matchedCredential.username);
        localStorage.setItem(STORAGE_KEY, matchedCredential.username);
        
        // Trigger migration on successful login
        migrateLegacyDataToBranch(matchedCredential.username);
        
        return true;
      }
      
      console.warn('Branch login failed: invalid credentials');
      return false;
    } catch (error) {
      console.error('Branch login error:', error);
      return false;
    }
  };

  const logout = () => {
    try {
      console.log('Branch logout');
      setBranchUser(null);
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Branch logout error:', error);
    }
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
