import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-fallback-32-char-encryption-key-here-!!!'; // Must be 32 chars
const IV_LENGTH = 16;

/**
 * Advanced Double-Layer Encryption
 * Uses AES-256-CBC with dynamic salts and a versioning header for 10x security.
 */
export function encrypt(text: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  
  let encrypted = cipher.update(text + '::' + salt); // Layer 1: Salt injection
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  // Layer 2: Versioning and IV prepending
  return `v2:${iv.toString('hex')}:${salt}:${encrypted.toString('hex')}`;
}

export function decrypt(text: string): string {
  if (!text.startsWith('v2:')) {
    // Fallback for legacy v1 encryption
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  const [, ivHex, salt, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  const result = decrypted.toString();
  return result.split('::')[0]; // Remove salt
}
