/**
 * Script para crear el usuario administrador inicial
 * EJECUTAR SOLO UNA VEZ después de la migración
 */

import { config } from 'dotenv';
import { createInitialAdmin } from '../lib/auth/setup-admin';

// Cargar variables de entorno - primero .env, luego .env.local
config({ path: '.env' });
config({ path: '.env.local' });

async function main() {
  try {
    console.log('🚀 Configurando primer usuario administrador...\n');
    
    // Verificar variables de entorno
    const requiredVars = [
      'AIRTABLE_API_KEY',
      'AIRTABLE_BASE_ID', 
      'JWT_SECRET'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Faltan variables de entorno:');
      missingVars.forEach(varName => {
        console.error(`   - ${varName}`);
      });
      console.error('\n💡 Verifica tu archivo .env o .env.local\n');
      
      // Debug: mostrar qué variables sí encontró
      console.log('🔍 Variables encontradas:');
      requiredVars.forEach(varName => {
        const value = process.env[varName];
        console.log(`   ${varName}: ${value ? '✅ Configurada' : '❌ Faltante'}`);
      });
      
      process.exit(1);
    }
    
    // Datos del administrador (personalizar según necesidades)
    const adminData = {
      email: process.env.ADMIN_EMAIL || 'admin@tuempresa.com',
      nombre: process.env.ADMIN_NOMBRE || 'Administrador',
      password: process.env.ADMIN_PASSWORD || 'Admin123@Seguro'
    };
    
    console.log('📧 Email:', adminData.email);
    console.log('👤 Nombre:', adminData.nombre);
    console.log('🔒 Contraseña:', '***redacted***');
    console.log('🔑 Rol: ADMIN\n');
    
    // Crear administrador
    await createInitialAdmin(adminData);
    
    console.log('\n✅ ¡Configuración completada exitosamente!');
    console.log('🔗 Ahora puedes hacer login en: http://localhost:3000/login');
    console.log('📧 Email:', adminData.email);
    console.log('🔒 Contraseña:', adminData.password);
    
  } catch (error) {
    console.error('\n❌ Error durante la configuración:');
    
    if (error instanceof Error) {
      if (error.message.includes('ya está registrado')) {
        console.error('   El usuario administrador ya existe.');
        console.error('   Si necesitas cambiar la contraseña, hazlo directamente en Airtable.');
      } else if (error.message.includes('Missing Airtable configuration')) {
        console.error('   Verifica las variables de entorno de Airtable.');
      } else if (error.message.includes('tabla')) {
        console.error('   Verifica que la tabla "Usuarios" exista en Airtable.');
      } else {
        console.error('  ', error.message);
      }
    } else {
      console.error('   Error desconocido:', error);
    }
    
    console.error('\n💡 Pasos de verificación:');
    console.error('1. ✅ Tabla "Usuarios" creada en Airtable');
    console.error('2. ✅ Variables de entorno en .env o .env.local');
    console.error('3. ✅ Acceso a internet para conectar con Airtable');
    
    process.exit(1);
  }
}

// Ejecutar script
main();