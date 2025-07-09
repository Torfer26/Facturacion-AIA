import { createUser } from './airtable-service';
import { CreateUserInput } from './types';

/**
 * Crear el primer usuario administrador
 * Solo usar durante la configuración inicial
 */
export async function createInitialAdmin(adminData: {
  email: string;
  nombre: string;
  password: string;
}): Promise<void> {
  try {
    const userData: CreateUserInput & { password: string } = {
      email: adminData.email,
      nombre: adminData.nombre,
      password: adminData.password,
      rol: 'ADMIN'
    };
    
    const admin = await createUser(userData);
    console.log('✅ Administrador creado exitosamente:', admin.email);
    
  } catch (error) {
    console.error('❌ Error creando administrador:', error);
    throw error;
  }
}

/**
 * Script para ejecutar desde terminal
 * node -e "require('./lib/auth/setup-admin').setupAdminFromEnv()"
 */
export async function setupAdminFromEnv(): Promise<void> {
  const email = process.env.ADMIN_EMAIL || 'admin@tuempresa.com';
  const nombre = process.env.ADMIN_NOMBRE || 'Administrador';
  const password = process.env.ADMIN_PASSWORD || 'Admin123@Seguro';
  
  console.log('🔧 Configurando administrador inicial...');
  console.log('📧 Email:', email);
  console.log('👤 Nombre:', nombre);
  
  await createInitialAdmin({ email, nombre, password });
  
  console.log('✅ Configuración completada');
  console.log('🔗 Ahora puedes hacer login en: http://localhost:3000/');
} 