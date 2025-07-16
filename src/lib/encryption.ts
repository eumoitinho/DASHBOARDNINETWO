/**
 * Encryption utilities for NINETWODASH
 * Handles secure storage of API credentials in MongoDB
 */

import crypto from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Get encryption key from environment variable
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY não está definida nas variáveis de ambiente');
  }
  
  // Se a chave não tem o tamanho correto, usar hash SHA-256
  if (key.length !== KEY_LENGTH * 2) { // hex string deve ter 64 caracteres
    return crypto.createHash('sha256').update(key).digest();
  }
  
  return Buffer.from(key, 'hex');
}

/**
 * Encrypt sensitive data
 */
export function encryptData(text: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    cipher.setAAD(Buffer.from('ninetwodash-credentials', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Combine IV + Tag + Encrypted data
    const combined = iv.toString('hex') + tag.toString('hex') + encrypted;
    return combined;
  } catch (error) {
    console.error('Erro ao criptografar dados:', error);
    throw new Error('Falha na criptografia');
  }
}

/**
 * Decrypt sensitive data
 */
export function decryptData(encryptedData: string): string {
  try {
    const key = getEncryptionKey();
    
    // Extract IV, Tag, and encrypted data
    const iv = Buffer.from(encryptedData.slice(0, IV_LENGTH * 2), 'hex');
    const tag = Buffer.from(encryptedData.slice(IV_LENGTH * 2, (IV_LENGTH + TAG_LENGTH) * 2), 'hex');
    const encrypted = encryptedData.slice((IV_LENGTH + TAG_LENGTH) * 2);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv );
    decipher.setAAD(Buffer.from('ninetwodash-credentials', 'utf8'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Erro ao descriptografar dados:', error);
    throw new Error('Falha na descriptografia');
  }
}

/**
 * Encrypt client credentials object
 */
export function encryptCredentials(credentials: Record<string, any>): string {
  const jsonString = JSON.stringify(credentials);
  return encryptData(jsonString);
}

/**
 * Decrypt client credentials object
 */
export function decryptCredentials(encryptedCredentials: string): Record<string, any> {
  const decryptedString = decryptData(encryptedCredentials);
  return JSON.parse(decryptedString);
}

/**
 * Generate a secure encryption key (for initial setup)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Validate that encryption is working properly
 */
export function testEncryption(): boolean {
  try {
    const testData = 'test-encryption-data-' + Date.now();
    const encrypted = encryptData(testData);
    const decrypted = decryptData(encrypted);
    return testData === decrypted;
  } catch (error) {
    return false;
  }
}