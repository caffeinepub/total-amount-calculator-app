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

// Resolved provider URL
export const II_PROVIDER_URL = viteIIUrl || DEFAULT_II_PROVIDER;

// Log the resolved provider URL for debugging
console.log('Internet Identity Provider URL:', II_PROVIDER_URL);

// Set process.env.II_URL if not already set (for compatibility with existing code)
if (typeof process !== 'undefined' && process.env) {
  if (!process.env.II_URL) {
    process.env.II_URL = II_PROVIDER_URL;
  }
} else {
  console.warn('process.env is not available, using direct export II_PROVIDER_URL');
}
