#!/usr/bin/env ts-node

/**
 * Script para cambiar la contraseña del usuario admin
 * Uso: npm run reset-admin-password
 */

import dotenv from 'dotenv';
// Cargar variables de entorno
dotenv.config();

import { findUserByEmail, updateUserPassword } from '../lib/auth/airtable-service';
import { hashPassword } from '../lib/auth/password';

async function resetAdminPassword() {
  try {
    console.log('🔄 Buscando usuario admin...');
    
    // Email del admin (ajusta si usas otro)
    const adminEmail = 'admin@facturas.com';
    
    // Buscar el usuario admin
    const adminUser = await findUserByEmail(adminEmail);
    
    if (!adminUser) {
      console.error('❌ Usuario admin no encontrado con email:', adminEmail);
      console.log('💡 Verifica que el email sea correcto en Airtable');
      return;
    }
    
    console.log('✅ Usuario admin encontrado:', {
      id: adminUser.id,
      email: adminUser.email,
      nombre: adminUser.nombre,
      rol: adminUser.rol
    });
    
    // Nueva contraseña
    const newPassword = 'Admin123@New2024!';
    
    console.log('🔄 Actualizando contraseña...');
    
    // Actualizar contraseña
    const success = await updateUserPassword(adminUser.id, newPassword);
    
    if (success) {
      console.log('✅ Contraseña actualizada exitosamente!');
      console.log('');
      console.log('📝 NUEVAS CREDENCIALES:');
      console.log('   Email:', adminEmail);
      console.log('   Contraseña:', newPassword);
      console.log('');
      console.log('🔐 Recuerda cambiar esta contraseña después del primer login');
    } else {
      console.error('❌ Error al actualizar la contraseña');
    }
    
  } catch (error) {
    console.error('❌ Error en el script:', error);
  }
}

// Ejecutar el script
resetAdminPassword(); 