/**
 * Utilidades para filtrado de datos por usuario
 * Implementa separación multi-tenant en Airtable
 */

export interface UserInfo {
  id: string;
  email: string;
  rol: 'ADMIN' | 'USER' | 'VIEWER';
}

export interface AirtableFilter {
  filterByFormula?: string;
  maxRecords?: number;
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
}

/**
 * Extraer información del usuario desde los headers del request
 * El middleware ya añade esta información a los headers
 */
export function getUserFromRequest(request: Request): UserInfo | null {
  const headers = request.headers;
  
  const userId = headers.get('x-user-id');
  const userEmail = headers.get('x-user-email');
  const userRol = headers.get('x-user-rol') as 'ADMIN' | 'USER' | 'VIEWER';
  
  if (!userId || !userEmail || !userRol) {
    console.warn('🚨 [USER FILTER] Missing user information in headers');
    return null;
  }
  
  return {
    id: userId,
    email: userEmail,
    rol: userRol
  };
}

/**
 * Generar filtros de Airtable basados en el usuario
 * ADMIN ve todos los datos, otros usuarios solo sus propios datos
 */
export function createUserFilter(user: UserInfo): AirtableFilter {
  // Los ADMIN pueden ver todos los datos
  if (user.rol === 'ADMIN') {
    console.log(`🔓 [USER FILTER] ADMIN ${user.email} - Sin filtros (ve todo)`);
    return {}; // Sin filtros
  }
  
  // Otros usuarios solo ven sus propios datos
  const filter = {
    filterByFormula: `{UserID} = '${user.id}'`
  };
  
  console.log(`🔒 [USER FILTER] ${user.rol} ${user.email} - Filtrado por UserID: ${user.id}`);
  return filter;
}

/**
 * Combinar filtros de usuario con filtros adicionales
 */
export function combineFilters(userFilter: AirtableFilter, additionalFilter?: AirtableFilter): AirtableFilter {
  if (!additionalFilter) return userFilter;
  
  let combinedFormula = '';
  
  // Combinar fórmulas si existen ambas
  if (userFilter.filterByFormula && additionalFilter.filterByFormula) {
    combinedFormula = `AND(${userFilter.filterByFormula}, ${additionalFilter.filterByFormula})`;
  } else if (userFilter.filterByFormula) {
    combinedFormula = userFilter.filterByFormula;
  } else if (additionalFilter.filterByFormula) {
    combinedFormula = additionalFilter.filterByFormula;
  }
  
  return {
    ...userFilter,
    ...additionalFilter,
    ...(combinedFormula && { filterByFormula: combinedFormula })
  };
}

/**
 * Preparar datos para creación incluyendo información del usuario
 */
export function addUserToRecordData(data: Record<string, any>, user: UserInfo): Record<string, any> {
  return {
    ...data,
    UserID: user.id,
    UserEmail: user.email
  };
}

/**
 * Verificar si un usuario puede acceder a un registro específico
 */
export function canAccessRecord(user: UserInfo, recordData: any): boolean {
  // Los ADMIN pueden acceder a todo
  if (user.rol === 'ADMIN') {
    return true;
  }
  
  // Otros usuarios solo pueden acceder a sus propios registros
  return recordData.UserID === user.id;
}

/**
 * Helper para logging de seguridad
 */
export function logDataAccess(user: UserInfo, action: string, resourceType: string, resourceId?: string) {
  const timestamp = new Date().toISOString();
  console.log(`🔐 [DATA ACCESS] ${timestamp} - ${user.rol} ${user.email} - ${action} ${resourceType}${resourceId ? ` (${resourceId})` : ''}`);
} 