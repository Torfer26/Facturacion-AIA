import bcrypt from 'bcryptjs';
import logger from '@/lib/logger/server';

/**
 * Hash de contraseña con bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const saltRounds = 12; // Más seguro que el default de 10
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw new Error('Error al procesar la contraseña');
  }
}

/**
 * Verificar contraseña
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    logger.error('Error verifying password:', error);
    return false;
  }
}

/**
 * Generar contraseña temporal segura
 */
export function generateSecurePassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&';
  let password = '';
  
  // Asegurar que tenga al menos uno de cada tipo
  password += 'A'; // Mayúscula
  password += 'a'; // Minúscula
  password += '1'; // Número
  password += '@'; // Especial
  
  // Completar el resto
  for (let i = 4; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  // Mezclar los caracteres
  return password.split('').sort(() => Math.random() - 0.5).join('');
}