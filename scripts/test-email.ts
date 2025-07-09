#!/usr/bin/env tsx

import { config } from 'dotenv';

// Cargar variables de entorno desde múltiples fuentes ANTES de importar el EmailService
console.log('🔧 Loading environment variables...');

// Cargar .env.local primero
const localResult = config({ path: '.env.local' });
console.log('.env.local loaded:', localResult.error ? 'FAILED' : 'SUCCESS');

// Cargar .env como fallback
const envResult = config({ path: '.env' });
console.log('.env loaded:', envResult.error ? 'FAILED' : 'SUCCESS');

// Debug: mostrar qué variables encontramos
console.log('\n🔍 Environment Variables Debug:');
console.log('RESEND_API_KEY found:', process.env.RESEND_API_KEY ? 'YES' : 'NO');
console.log('RESEND_API_KEY value:', process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 10)}...` : 'NOT SET');
console.log('RESEND_FROM_EMAIL found:', process.env.RESEND_FROM_EMAIL ? 'YES' : 'NO');
console.log('SMTP_HOST found:', process.env.SMTP_HOST ? 'YES' : 'NO');

// AHORA importar el EmailService después de cargar las variables
import { emailService } from '../lib/services/emailService';

// Re-inicializar el servicio con las nuevas variables de entorno
console.log('\n🔄 Re-initializing email service...');
emailService.reinitialize();

async function testEmailService() {
  console.log('\n🔍 Testing Email Service Configuration...\n');

  // Verificar configuración
  const providerInfo = emailService.getProviderInfo();
  console.log(`📧 Email Provider: ${providerInfo.provider}`);
  console.log(`✅ Service Status: ${providerInfo.status ? 'Available' : 'Not Available'}`);

  if (!providerInfo.status) {
    console.error('\n❌ Email service not configured properly!');
    console.log('\n📋 Required environment variables:');
    console.log('   For Resend API: RESEND_API_KEY');
    console.log('   For SMTP: SMTP_HOST, SMTP_USER, SMTP_PASS');
    console.log('\n💡 Check your .env.local file');
    process.exit(1);
  }

  // Verificar conexión
  console.log('\n🔗 Testing connection...');
  const connectionOk = await emailService.verifyConnection();
  console.log(`Connection Status: ${connectionOk ? '✅ OK' : '❌ Failed'}`);

  if (!connectionOk) {
    console.error('\n❌ Could not establish connection to email service');
    if (providerInfo.provider === 'smtp') {
      console.log('💡 Check your SMTP credentials and network connection');
    } else {
      console.log('💡 Check your Resend API key');
    }
    process.exit(1);
  }

  // Preguntar por email de prueba
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const testEmail = await new Promise<string>((resolve) => {
    rl.question('\n📧 Enter email address to test (or press Enter to skip): ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });

  if (!testEmail) {
    console.log('\n✅ Email service configuration test completed successfully!');
    console.log('💡 To test sending emails, run this script again and provide an email address');
    return;
  }

  // Generar token de prueba
  const testToken = 'test-token-' + Date.now();
  
  console.log(`\n📤 Sending test email to: ${testEmail}`);
  console.log('⏳ This may take a few seconds...');

  try {
    const success = await emailService.sendPasswordResetEmail(testEmail, testToken);
    
    if (success) {
      console.log('\n✅ Test email sent successfully!');
      console.log('📧 Check your inbox for the password reset email');
      console.log('🔗 The test reset link will contain the token:', testToken);
    } else {
      console.log('\n❌ Failed to send test email');
      console.log('💡 Check the console logs above for error details');
    }
  } catch (error) {
    console.error('\n❌ Error sending test email:', error);
  }

  console.log('\n🎉 Email service test completed!');
}

// Ejecutar test
testEmailService().catch((error) => {
  console.error('\n💥 Test failed with error:', error);
  process.exit(1);
}); 