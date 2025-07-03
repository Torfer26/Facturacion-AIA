import { LoginCredentials, AuthResponse, SafeUser } from './types';
import { authenticateUser as airtableAuth } from './airtable-service';
import { createToken } from './jwt';

/**
 * Servicio principal de autenticación
 * Utiliza Airtable como backend
 */
export class AuthService {
  /**
   * Autenticar usuario con email y contraseña
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Validar con Airtable
      const user = await airtableAuth(credentials);
      
      if (!user) {
        return {
          success: false,
          error: 'Credenciales inválidas'
        };
      }
      
      // Crear token JWT
      const token = await createToken(user);
      
      return {
        success: true,
        user,
        token
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Error interno del servidor'
      };
    }
  }
  
  /**
   * Verificar token y obtener usuario
   */
  static async verifyToken(token: string): Promise<SafeUser | null> {
    try {
      const { verifyToken } = await import('./jwt');
      return await verifyToken(token);
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }
}

// Exports de compatibilidad
export const authenticateUser = AuthService.login;
export const verifyAuthToken = AuthService.verifyToken;
export const createAuthToken = createToken; 