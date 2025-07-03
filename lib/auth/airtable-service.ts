import Airtable from 'airtable';
import { User, SafeUser, LoginCredentials, CreateUserInput } from './types';
import { hashPassword, verifyPassword } from './password';

// Configuración de Airtable
function getAirtableConfig() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_USUARIOS || 'Usuarios';

  if (!apiKey || !baseId) {
    throw new Error('Missing Airtable configuration for users');
  }

  return { apiKey, baseId, tableName };
}

function getAirtableBase() {
  const { apiKey, baseId, tableName } = getAirtableConfig();
  const base = new Airtable({ apiKey }).base(baseId);
  return base(tableName);
}

/**
 * Convertir registro de Airtable a tipo User
 */
function airtableToUser(record: any): User {
  return {
    id: record.id,
    email: record.get('Email') || '',
    nombre: record.get('Nombre') || '',
    rol: (record.get('Rol') || 'USER') as 'ADMIN' | 'USER' | 'VIEWER',
    activo: record.get('Activo') || false,
    fechaCreacion: record.get('FechaCreacion') ? new Date(record.get('FechaCreacion')) : new Date(),
    ultimaConexion: record.get('UltimaConexion') ? new Date(record.get('UltimaConexion')) : undefined,
  };
}

/**
 * Convertir tipo User a campos de Airtable
 */
function userToAirtable(user: Partial<User>) {
  const fields: any = {};
  
  if (user.email) fields.Email = user.email;
  if (user.nombre) fields.Nombre = user.nombre;
  if (user.rol) fields.Rol = user.rol;
  if (user.activo !== undefined) fields.Activo = user.activo;
  if (user.fechaCreacion) fields.FechaCreacion = user.fechaCreacion.toISOString();
  if (user.ultimaConexion) fields.UltimaConexion = user.ultimaConexion.toISOString();
  
  return fields;
}

/**
 * Buscar usuario por email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const table = getAirtableBase();
    
    const records = await table.select({
      filterByFormula: `{Email} = '${email}'`,
      maxRecords: 1
    }).all();
    
    if (records.length === 0) {
      return null;
    }
    
    return airtableToUser(records[0]);
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw new Error('Error al buscar usuario');
  }
}

/**
 * Buscar usuario por ID
 */
export async function findUserById(id: string): Promise<User | null> {
  try {
    const table = getAirtableBase();
    const record = await table.find(id);
    return airtableToUser(record);
  } catch (error) {
    console.error('Error finding user by ID:', error);
    return null;
  }
}

/**
 * Crear nuevo usuario
 */
export async function createUser(userData: CreateUserInput & { password: string }): Promise<User> {
  try {
    const table = getAirtableBase();
    
    // Verificar que el email no exista
    const existingUser = await findUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }
    
    // Hashear la contraseña
    const hashedPassword = await hashPassword(userData.password);
    
    // Crear el registro
    const record = await table.create({
      Email: userData.email,
      Nombre: userData.nombre,
      Password: hashedPassword,
      Rol: userData.rol || 'USER',
      Activo: true,
      FechaCreacion: new Date().toISOString()
    });
    
    return airtableToUser(record);
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Error al crear usuario');
  }
}

/**
 * Verificar credenciales de login
 */
export async function authenticateUser(credentials: LoginCredentials): Promise<SafeUser | null> {
  try {
    console.log('[AUTH DEBUG] Intentando login para:', credentials.email);
    const table = getAirtableBase();
    
    // Buscar usuario por email
    const records = await table.select({
      filterByFormula: `{Email} = '${credentials.email}'`,
      maxRecords: 1
    }).all();
    
    console.log('[AUTH DEBUG] Registros encontrados:', records.length);
    
    if (records.length === 0) {
      console.log('[AUTH DEBUG] Usuario no encontrado en Airtable');
      return null;
    }
    
    const record = records[0];
    const user = airtableToUser(record);
    
    console.log('[AUTH DEBUG] Usuario encontrado:', {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
      activo: user.activo
    });
    
    // Verificar que el usuario esté activo
    if (!user.activo) {
      console.log('[AUTH DEBUG] Usuario inactivo');
      return null;
    }
    
    // Verificar contraseña
    const storedPassword = record.get('Password');
    console.log('[AUTH DEBUG] Password field exists:', !!storedPassword);
    console.log('[AUTH DEBUG] Password field length:', storedPassword ? storedPassword.length : 0);
    
    if (!storedPassword) {
      console.log('[AUTH DEBUG] No hay contraseña almacenada');
      return null;
    }
    
    console.log('[AUTH DEBUG] Verificando contraseña...');
    const isValidPassword = await verifyPassword(credentials.password, storedPassword);
    console.log('[AUTH DEBUG] Contraseña válida:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('[AUTH DEBUG] Contraseña incorrecta');
      return null;
    }
    
    // Actualizar última conexión
    await table.update(record.id, {
      UltimaConexion: new Date().toISOString()
    });
    
    console.log('[AUTH DEBUG] Login exitoso para:', user.email);
    
    // Retornar usuario sin contraseña
    const { ...safeUser } = user;
    return safeUser as SafeUser;
  } catch (error) {
    console.error('[AUTH DEBUG] Error authenticating user:', error);
    return null;
  }
}

/**
 * Actualizar contraseña de usuario
 */
export async function updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
  try {
    const table = getAirtableBase();
    const hashedPassword = await hashPassword(newPassword);
    
    await table.update(userId, {
      Password: hashedPassword
    });
    
    return true;
  } catch (error) {
    console.error('Error updating password:', error);
    return false;
  }
} 