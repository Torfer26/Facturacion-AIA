import { z } from 'zod';

// Esquemas de validación con Zod
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  nombre: z.string().min(1),
  rol: z.enum(['ADMIN', 'USER', 'VIEWER']),
  activo: z.boolean(),
  fechaCreacion: z.date().optional(),
  ultimaConexion: z.date().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const CreateUserSchema = z.object({
  email: z.string().email('Email inválido'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial'),
  rol: z.enum(['ADMIN', 'USER', 'VIEWER']).default('USER'),
});

// Tipos TypeScript derivados de los esquemas
export type User = z.infer<typeof UserSchema>;
export type LoginCredentials = z.infer<typeof LoginSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;

// Tipo para usuario sin contraseña (para respuestas)
export type SafeUser = Omit<User, 'password'>;

// Respuestas de API
export interface AuthResponse {
  success: boolean;
  user?: SafeUser;
  token?: string;
  error?: string;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  rol: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
} 