import { prisma } from './database';
import { hashPassword, verifyPassword } from './password';
import { createToken } from './jwt';
import { LoginSchema, CreateUserSchema, type LoginInput, type CreateUserInput, type SafeUser, type AuthResponse } from './types';
import logger from '@/lib/logger/server';

/**
 * Servicio de autenticación principal
 */
export class AuthService {
  /**
   * Autenticar usuario
   */
  static async login(input: LoginInput): Promise<AuthResponse> {
    try {
      // Validar entrada
      const validatedInput = LoginSchema.parse(input);
      
      // Buscar usuario
      const user = await prisma.user.findUnique({
        where: { email: validatedInput.email },
      });
      
      if (!user || !user.isActive) {
        logger.warn(`Failed login attempt for email: ${validatedInput.email}`);
        return {
          success: false,
          error: 'Credenciales inválidas',
        };
      }
      
      // Verificar contraseña
      const isValidPassword = await verifyPassword(validatedInput.password, user.password);
      
      if (!isValidPassword) {
        logger.warn(`Invalid password for user: ${user.email}`);
        return {
          success: false,
          error: 'Credenciales inválidas',
        };
      }      
      // Crear usuario seguro (sin contraseña)
      const safeUser: SafeUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
      
      // Crear token
      const token = await createToken(safeUser);
      
      logger.info(`Successful login for user: ${user.email}`);
      
      return {
        success: true,
        user: safeUser,
        token,
      };
    } catch (error) {
      logger.error('Login error:', error);
      return {
        success: false,
        error: 'Error interno del servidor',
      };
    }
  }  /**
   * Crear nuevo usuario (solo ADMIN puede crear usuarios)
   */
  static async createUser(input: CreateUserInput, createdBy: SafeUser): Promise<AuthResponse> {
    try {
      // Solo ADMIN puede crear usuarios
      if (createdBy.role !== 'ADMIN') {
        return {
          success: false,
          error: 'No tienes permisos para crear usuarios',
        };
      }
      
      // Validar entrada
      const validatedInput = CreateUserSchema.parse(input);
      
      // Verificar si el email ya existe
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedInput.email },
      });
      
      if (existingUser) {
        return {
          success: false,
          error: 'El email ya está registrado',
        };
      }
      
      // Hash de la contraseña
      const hashedPassword = await hashPassword(validatedInput.password);
      
      // Crear usuario
      const newUser = await prisma.user.create({
        data: {
          email: validatedInput.email,
          name: validatedInput.name,
          password: hashedPassword,
          role: validatedInput.role,
        },
      });
      
      // Crear usuario seguro para respuesta
      const safeUser: SafeUser = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      };
      
      logger.info(`New user created: ${newUser.email} by ${createdBy.email}`);
      
      return {
        success: true,
        user: safeUser,
      };
    } catch (error) {
      logger.error('Create user error:', error);
      return {
        success: false,
        error: 'Error al crear el usuario',
      };
    }
  }
}