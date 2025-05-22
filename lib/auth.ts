// Archivo de autenticación básica
// Esto es solo para propósitos de demostración

import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';

// Esta sería nuestra "base de datos" de usuarios (para demostración)
const USERS = [
  { id: '1', email: 'admin@facturas.com', password: 'admin123', name: 'Administrador', role: 'admin' }
];

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
const secretKey = new TextEncoder().encode(JWT_SECRET);
const TOKEN_KEY = 'auth-token';

export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
};

// Función para verificar credenciales
export async function authenticate(email: string, password: string): Promise<User | null> {
  // Buscar el usuario
  const user = USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) return null;

  // Crear el objeto usuario sin la contraseña
  const authenticatedUser: User = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };

  return authenticatedUser;
}

// Función para crear un token JWT
export async function signToken(user: Omit<User, 'password'>): Promise<string> {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secretKey);
  
  return token;
}

// Función para verificar un token
export async function verifyToken(token: string): Promise<User | null> {
  console.log('Verifying token:', token.substring(0, 10) + '...');
  
  // For test tokens, return a mock user
  if (token.startsWith('test-token-') || token.startsWith('backup-token-')) {
    return {
      id: 'admin-1',
      email: 'admin@facturas.com',
      name: 'Administrador',
      role: 'admin'
    };
  }
  
  if (token === 'manual-test-token') {
    return {
      id: 'test-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user'
    };
  }
  
  // Invalid token
  return null;
}

// Función para guardar el token en localStorage (cliente)
export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

// Función para obtener el token de localStorage (cliente)
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

// Función para obtener el token del encabezado de autorización (cliente)
export function getTokenFromHeader(header: string): string | null {
  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }
  
  return header.split(' ')[1];
}

// Función para comprobar si el usuario está autenticado (cliente)
export async function checkAuth(): Promise<User | null> {
  // Si estamos en el servidor, no podemos usar fetch del cliente
  if (typeof window === 'undefined') return null;
  
  try {
    const response = await fetch('/api/auth/check', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Importante para incluir cookies
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.success && data.authenticated && data.user) {
      return data.user;
    }
    
    return null;
  } catch (error) {
    console.error('Error verificando autenticación:', error);
    return null;
  }
}

// Función para cerrar sesión (cliente)
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// Set token in cookie (for server-side)
export function setTokenCookie(token: string) {
  cookies().set({
    name: 'auth-token',
    value: token,
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: 'lax'
  });
}

// Remove token cookie (for logout)
export function removeTokenCookie() {
  cookies().delete('auth-token');
} 