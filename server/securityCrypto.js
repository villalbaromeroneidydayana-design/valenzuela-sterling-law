import crypto from 'crypto';

/**
 * Módulo de Criptografía de Alta Seguridad (scrypt + timingSafeEqual)
 * Utiliza scrypt con parámetros estándar OWASP (N=16384, r=8, p=1, keylen=64)
 * Resistente a ataques de GPU/ASIC y Timing Attacks.
 */

const SCRYPT_PARAMS = {
  N: 16384,
  r: 8,
  p: 1,
  maxmem: 32 * 1024 * 1024
};

/**
 * Genera un hash scrypt seguro con salt aleatorio de 16 bytes.
 * Formato devuelto: scrypt$<salt_hex>$<hash_hex>
 */
export function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('La contraseña debe ser una cadena válida.');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64, SCRYPT_PARAMS);
  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

/**
 * Valida una contraseña contra un hash almacenado (formato scrypt$<salt>$<hash>).
 * Compara en tiempo constante para prevenir Timing Attacks.
 */
export function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;

  try {
    const parts = storedHash.split('$');
    if (parts.length !== 3 || parts[0] !== 'scrypt') {
      // Fallback a comparación SHA-512 si es hash legado
      const legacySalt = process.env.ADMIN_SALT || 'vs_law_salt_v2_2026';
      const computed = crypto.createHash('sha512').update(password + legacySalt).digest('hex');
      return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(storedHash, 'hex'));
    }

    const salt = parts[1];
    const originalHash = Buffer.from(parts[2], 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64, SCRYPT_PARAMS);

    if (derivedKey.length !== originalHash.length) return false;
    return crypto.timingSafeEqual(derivedKey, originalHash);
  } catch (err) {
    console.error('Error verificando contraseña con scrypt:', err);
    return false;
  }
}

/**
 * Genera un digesto SHA-256 de integridad para archivos y documentos.
 */
export function computeSha256(bufferOrString) {
  return crypto.createHash('sha256').update(bufferOrString).digest('hex');
}

