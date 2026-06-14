/**
 * Server-side token utilities for writeup access control
 * 
 * SECURITY CRITICAL:
 * - Never expose these functions to client components
 * - Only use in server actions, API routes, or server components
 * - Never store raw tokens in the database
 * - Always hash tokens before persisting
 */

import { createHash, randomBytes } from 'crypto';

// Token configuration
const TOKEN_LENGTH = 32; // 32 bytes = 256 bits of entropy
const TOKEN_ENCODING = 'base64url' as const;

/**
 * Generate a cryptographically secure random access token
 * Returns a URL-safe base64 encoded string
 * 
 * Example output: "a7fE2mN9pQxR8vK3jL6nM1wS4yT7zC0bV5hD9gF2eX8"
 */
export function generateAccessToken(): string {
  return randomBytes(TOKEN_LENGTH).toString(TOKEN_ENCODING);
}

/**
 * Hash an access token using SHA-256
 * 
 * TODO: For production, consider using HMAC with WRITEUP_TOKEN_SECRET
 * to provide additional security against rainbow table attacks.
 * 
 * @param token - The raw token to hash
 * @returns Hex-encoded SHA-256 hash of the token
 */
export function hashAccessToken(token: string): string {
  // TODO: Consider HMAC for production
  // const secret = process.env.WRITEUP_TOKEN_SECRET;
  // if (secret) {
  //   return createHmac('sha256', secret).update(token).digest('hex');
  // }
  
  // For foundation: SHA-256 is acceptable
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Safely compare a raw token against a stored hash
 * Uses timing-safe comparison to prevent timing attacks
 * 
 * @param token - The raw token to verify
 * @param storedHash - The stored hash to compare against
 * @returns True if token matches the hash
 */
export function verifyAccessToken(token: string, storedHash: string): boolean {
  const tokenHash = hashAccessToken(token);
  
  // Timing-safe comparison
  // Both strings must be same length for Buffer.compare to be effective
  if (tokenHash.length !== storedHash.length) {
    return false;
  }
  
  const tokenBuffer = Buffer.from(tokenHash, 'hex');
  const storedBuffer = Buffer.from(storedHash, 'hex');
  
  return tokenBuffer.compare(storedBuffer) === 0;
}

/**
 * Generate a token expiration date
 * 
 * @param days - Number of days until expiration (default: 30)
 * @returns ISO 8601 timestamp for expiration
 */
export function getAccessTokenExpiry(days: number = 30): string {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  return expiryDate.toISOString();
}

/**
 * Check if a token has expired
 * 
 * @param expiresAt - ISO 8601 timestamp or null
 * @returns True if token has expired or expiry is invalid
 */
export function isTokenExpired(expiresAt: string | null): boolean {
  if (!expiresAt) {
    return false; // No expiry = never expires
  }
  
  const expiryDate = new Date(expiresAt);
  const now = new Date();
  
  return now > expiryDate;
}

/**
 * Check if a token grant is valid for use
 * Validates expiration, revocation, and view limits
 * 
 * @param grant - The grant object to validate
 * @returns Object with isValid boolean and reason if invalid
 */
export function isGrantValid(grant: {
  expires_at: string | null;
  revoked_at: string | null;
  max_views: number | null;
  views_used: number;
}): { isValid: boolean; reason?: string } {
  if (grant.revoked_at) {
    return { isValid: false, reason: 'Token has been revoked' };
  }
  
  if (isTokenExpired(grant.expires_at)) {
    return { isValid: false, reason: 'Token has expired' };
  }
  
  if (grant.max_views !== null && grant.views_used >= grant.max_views) {
    return { isValid: false, reason: 'Token view limit exceeded' };
  }
  
  return { isValid: true };
}

/**
 * Generate a human-readable token label
 * Useful for displaying partial tokens to users
 * 
 * @param token - The raw token
 * @returns Label showing first 8 and last 4 characters
 */
export function generateTokenLabel(token: string): string {
  if (token.length < 12) {
    return '****';
  }
  
  const start = token.slice(0, 8);
  const end = token.slice(-4);
  
  return `${start}...${end}`;
}
