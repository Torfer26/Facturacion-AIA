import { z } from 'zod';

// Esquemas de validación con Zod
export const UserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['ADMIN', 'USER', 'VIEWER']),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export const CreateUserSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(1, 'El nombre es requerido'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial'),
  role: z.enum(['ADMIN', 'USER', 'VIEWER']).default('USER'),
});

export const SessionSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  token: z.string(),
  expiresAt: z.date(),
  createdAt: z.date(),
});

// Tipos TypeScript derivados de los esquemas
export type User = z.infer<typeof UserSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type Session = z.infer<typeof SessionSchema>;// Tipo para usuario sin contraseña (para respuestas)
export type SafeUser = Omit<User, 'password'>;

// Respuestas de API
export interface AuthResponse {
  success: boolean;
  user?: SafeUser;
  token?: string;
  error?: string;
}