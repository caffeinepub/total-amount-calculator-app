/**
 * Internet Identity Provider URL Shim
 * 
 * Ensures a safe default Internet Identity provider URL is available.
 * This shim sets process.env.II_URL from import.meta.env.VITE_II_URL if available,
 * or falls back to the production Internet Identity URL.
 */

// Safe default for production Internet Identity
const DEFAULT_II_PROVIDER = 'https://identity.ic0.app';

// Check if we have a Vite environment variable
const viteIIUrl = import.meta.env.VITE_II_URL;

// Set process.env.II_URL if not already set
if (typeof process !== 'undefined' && !process.env.II_URL) {
  process.env.II_URL = viteIIUrl || DEFAULT_II_PROVIDER;
}

// Also export for direct use if needed
export const II_PROVIDER_URL = viteIIUrl || DEFAULT_II_PROVIDER;
