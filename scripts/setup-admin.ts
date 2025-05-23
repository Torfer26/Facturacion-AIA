/**
 * Script para crear el usuario administrador inicial
 * EJECUTAR SOLO UNA VEZ después de la migración
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth-v2/password';
import logger from '../lib/logger/server';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@facturas.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123@Facturas';
    const adminName = process.env.ADMIN_NAME || 'Administrador Principal';

    // Verificar si ya existe un admin
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      console.log('✅ Ya existe un usuario administrador');
      return;
    }

    // Hash de la contraseña
    const hashedPassword = await hashPassword(adminPassword);

    // Crear usuario admin
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      },
    });

    console.log('✅ Usuario administrador creado exitosamente');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Contraseña: ${adminPassword}`);
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login');    
    logger.info(`Admin user created: ${admin.email}`);
  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error);
    logger.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  createAdminUser();
}

export { createAdminUser };