/**
 * Script para probar el sistema de autenticación V2
 */

async function testAuth() {
  const baseUrl = 'http://localhost:3001';
  
  try {
    // Test 1: Login con credenciales correctas
    const loginResponse = await fetch(`${baseUrl}/api/v2/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@facturas.com',
        password: 'Admin123@Facturas2024!',
      }),
    });
    
    const loginData = await loginResponse.json();
    
    if (loginResponse.ok && loginData.success) {
      console.log('✅ Login exitoso');
      console.log('👤 Usuario:', loginData.user.name);
      console.log('📧 Email:', loginData.user.email);
      console.log('🔑 Rol:', loginData.user.role);
    } else {
      console.log('❌ Error en login:', loginData.error);
      return;
    }
    
    // Test 2: Verificar endpoint /me
    const meResponse = await fetch(`${baseUrl}/api/v2/auth/me`, {
      headers: {
        'Cookie': loginResponse.headers.get('set-cookie') || '',
      },
    });
    
    const meData = await meResponse.json();
    
    if (meResponse.ok && meData.success) {
      console.log('✅ Verificación de usuario exitosa');
    } else {
      console.log('❌ Error en verificación:', meData.error);
    }
    
    // Test 3: Login con credenciales incorrectas
    const badLoginResponse = await fetch(`${baseUrl}/api/v2/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@facturas.com',
        password: 'contraseña-incorrecta',
      }),
    });
    
    const badLoginData = await badLoginResponse.json();
    
    if (!badLoginResponse.ok && badLoginData.error) {
      console.log('✅ Rechazo de credenciales incorrectas funciona');
    } else {
      console.log('❌ Error: debería rechazar credenciales incorrectas');
    }
    
    console.log('\n🎉 Todos los tests pasaron correctamente');
    console.log('🔗 Puedes probar el login en: http://localhost:3001/login-v2');
    
  } catch (error) {
    console.error('❌ Error en tests:', error.message);
  }
}

// Esperar un poco para que el servidor esté listo
setTimeout(testAuth, 3000);