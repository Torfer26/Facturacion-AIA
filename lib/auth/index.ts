// Sistema de Autenticación V3 - Híbrido con Airtable
// Combina la seguridad del V2 con el backend de Airtable

export { authenticateUser, verifyAuthToken, createAuthToken } from './auth-service';
export { hashPassword, verifyPassword } from './password';
export { createToken, verifyToken } from './jwt';
export type { User, LoginCredentials, AuthResponse } from './types'; 