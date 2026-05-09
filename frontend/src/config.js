/**
 * Centralized API Configuration
 * Uses VITE_API_URL environment variable in production,
 * falls back to localhost:8000 for local development.
 */
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
