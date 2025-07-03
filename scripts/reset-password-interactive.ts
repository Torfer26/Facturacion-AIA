#!/usr/bin/env ts-node

/**
 * Script interactivo para cambiar contraseñas de usuarios
 * Uso: 
 *   npm run reset-password admin@facturas.com nueva-contraseña
 *   npm run reset-password usuario@example.com password123
 */

import dotenv from 'dotenv';
// Cargar variables de entorno
dotenv.config();

import { findUserByEmail, updateUserPassword } from '../lib/auth/airtable-service';
import { generateSecurePassword } from '../lib/auth/password';

async function resetUserPassword() {
  try {
    // Obtener argumentos del comando
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log('');
      console.log('🔐 RESET DE CONTRASEÑA - FacturacionAIA');
      console.log('');
      console.log('Uso:');
      console.log('  npm run reset-password <email> [nueva-contraseña]');
      console.log('');
      console.log('Ejemplos:');
      console.log('  npm run reset-password admin@facturas.com');
      console.log('  npm run reset-password admin@facturas.com MiNuevaPassword123@');
      console.log('');
      console.log('Si no especificas contraseña, se generará una automáticamente.');
      return;
    }
    
    const userEmail = args[0];
    const newPassword = args[1] || generateSecurePassword(16);
    
    console.log('🔄 Buscando usuario:', userEmail);
    
    // Buscar el usuario
    const user = await findUserByEmail(userEmail);
    
    if (!user) {
      console.error('❌ Usuario no encontrado con email:', userEmail);
      console.log('');
      console.log('💡 Sugerencias:');
      console.log('   - Verifica que el email sea correcto');
      console.log('   - Revisa la tabla "Usuarios" en Airtable');
      console.log('   - Asegúrate de que las variables de entorno están configuradas');
      return;
    }
    
    console.log('✅ Usuario encontrado:', {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
      activo: user.activo
    });
    
    if (!user.activo) {
      console.log('⚠️  ADVERTENCIA: El usuario está inactivo');
    }
    
    console.log('🔄 Actualizando contraseña...');
    
    // Actualizar contraseña
    const success = await updateUserPassword(user.id, newPassword);
    
    if (success) {
      console.log('✅ Contraseña actualizada exitosamente!');
      console.log('');
      console.log('📝 CREDENCIALES ACTUALIZADAS:');
      console.log('   Email:', userEmail);
      console.log('   Contraseña:', newPassword);
      console.log('   Rol:', user.rol);
      console.log('');
      console.log('🔐 Guarda estas credenciales en un lugar seguro');
      
      if (args.length === 1) {
        console.log('⚠️  Esta contraseña fue generada automáticamente');
      }
    } else {
      console.error('❌ Error al actualizar la contraseña');
      console.log('');
      console.log('💡 Posibles causas:');
      console.log('   - Error de conexión con Airtable');
      console.log('   - Permisos insuficientes en la API');
      console.log('   - ID de usuario inválido');
    }
    
  } catch (error) {
    console.error('❌ Error en el script:', error);
    console.log('');
    console.log('🔧 Verifica:');
    console.log('   - Variables de entorno (.env)');
    console.log('   - Conexión a Airtable');
    console.log('   - Permisos de la API key');
  }
}

// Ejecutar el script
resetUserPassword(); 