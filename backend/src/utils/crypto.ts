import crypto from 'crypto';

const getEncryptionKey = (): Buffer => {
  const secret = process.env.AUTH_TOKEN_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error('Missing AUTH_TOKEN_ENCRYPTION_KEY');
  }
  return crypto.createHash('sha256').update(secret).digest();
};

export const encryptText = (plainText: string): string => {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
};

export const decryptText = (cipherText: string): string => {
  const key = getEncryptionKey();
  const buffer = Buffer.from(cipherText, 'base64');
  const iv = buffer.subarray(0, 12);
  const authTag = buffer.subarray(12, 28);
  const encrypted = buffer.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
};
