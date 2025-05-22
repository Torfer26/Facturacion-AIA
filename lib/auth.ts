// Archivo de autenticación básica
// Esto es solo para propósitos de demostración

import { jwtVerify, SignJWT } from 'jose';

// Esta sería nuestra "base de datos" de usuarios (para demostración)
const USERS = [
  { id: '1', username: 'admin', password: 'admin', name: 'Administrador' }
];

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'facturacion-aia-secret-key');
const TOKEN_KEY = 'auth-token';

export type User = {
  id: string;
  username: string;
  name: string;
};

// Función para verificar credenciales
export async function authenticate(username: string, password: string): Promise<User | null> {
  // Buscar el usuario
  const user = USERS.find(
    (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );

  if (!user) return null;

  // Crear el objeto usuario sin la contraseña
  const authenticatedUser: User = {
    id: user.id,
    username: user.username,
    name: user.name
  };

  return authenticatedUser;
}

// Función para crear un token JWT
export async function createToken(user: User): Promise<string> {
  const token = await new SignJWT({ id: user.id, username: user.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(JWT_SECRET);

  return token;
}

// Función para verificar un token
export async function verifyToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.id as string;
    
    const user = USERS.find(u => u.id === userId);
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      name: user.name
    };
  } catch (error) {
    console.error('Error verificando token:', error);
    return null;
  }
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