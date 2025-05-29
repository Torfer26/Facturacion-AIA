const { config } = require('dotenv');
const Airtable = require('airtable');

// Cargar variables de entorno
config({ path: '.env.local' });
config({ path: '.env' });

// Verificar variables de entorno
const requiredEnvVars = {
  AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID
};

console.log('🔍 Verificando configuración de Airtable...\n');

// Verificar que las variables estén definidas
let hasAllVars = true;
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    console.log(`❌ Variable de entorno faltante: ${key}`);
    hasAllVars = false;
  } else {
    console.log(`✅ ${key}: ${value.substring(0, 8)}...`);
  }
});

if (!hasAllVars) {
  console.log('\n❌ Faltan variables de entorno. Crear .env.local con:');
  console.log('AIRTABLE_API_KEY=tu_api_key');
  console.log('AIRTABLE_BASE_ID=tu_base_id');
  process.exit(1);
}

// Configurar Airtable
const airtable = new Airtable({ apiKey: requiredEnvVars.AIRTABLE_API_KEY });
const base = airtable.base(requiredEnvVars.AIRTABLE_BASE_ID);

async function testAirtableConnection() {
  const tablesToTest = [
    'Modelo303',
    'Modelo111', 
    'VencimientosFiscales',
    'ConfiguracionFiscal'
  ];

  console.log('\n🧪 Probando conexión a las tablas...\n');

  for (const tableName of tablesToTest) {
    try {
      console.log(`📋 Probando tabla: ${tableName}`);
      
      const records = await base(tableName).select({
        maxRecords: 1,
        view: 'Grid view'
      }).firstPage();
      
      console.log(`✅ ${tableName}: Conexión exitosa (${records.length} registros encontrados)`);
      
      if (records.length > 0) {
        const fields = Object.keys(records[0].fields);
        console.log(`   📝 Campos disponibles: ${fields.slice(0, 5).join(', ')}${fields.length > 5 ? '...' : ''}`);
      }
      
    } catch (error) {
      console.log(`❌ ${tableName}: Error - ${error.message}`);
      if (error.error === 'NOT_AUTHORIZED') {
        console.log('   💡 Verificar permisos del API token y acceso a la base');
      } else if (error.error === 'TABLE_NOT_FOUND') {
        console.log('   💡 La tabla no existe o el nombre no es correcto');
      }
    }
  }

  console.log('\n🎯 Prueba completada.');
  console.log('\n💡 Si hay errores:');
  console.log('1. Verificar que el API Key tenga permisos de lectura/escritura');
  console.log('2. Verificar que el Base ID sea correcto');
  console.log('3. Verificar que las tablas existan con los nombres exactos');
  console.log('4. Verificar que el token tenga acceso a esta base específica');
}

testAirtableConnection().catch(error => {
  console.error('Error en la prueba:', error.message);
  process.exit(1);
}); 