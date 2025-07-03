import bcrypt from 'bcryptjs';

/**
 * Hash de contraseña con bcrypt
 * Usa saltRounds 12 para mayor seguridad
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const saltRounds = 12; // Más seguro que el default de 10
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Error al procesar la contraseña');
  }
}

/**
 * Verificar contraseña contra hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Error verifying password:', error);
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