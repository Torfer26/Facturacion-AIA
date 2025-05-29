import { NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { FacturaPDF } from '@/lib/pdf/factura-template';
import { IssuedInvoice } from '@/lib/types/issuedInvoice';
import Airtable from 'airtable';

// Función para obtener la configuración correcta de Airtable para facturas emitidas
function getAirtableBase() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME_EMITIDAS;

  console.log('🔍 Verificando configuración de Airtable para PDF:');
  console.log('- API Key presente:', !!apiKey);
  console.log('- Base ID presente:', !!baseId);
  console.log('- Tabla emitidas presente:', !!tableName);
  console.log('- Nombre de tabla:', tableName);

  if (!apiKey) {
    throw new Error('❌ Falta AIRTABLE_API_KEY en las variables de entorno');
  }
  if (!baseId) {
    throw new Error('❌ Falta AIRTABLE_BASE_ID en las variables de entorno');
  }
  if (!tableName) {
    throw new Error('❌ Falta AIRTABLE_TABLE_NAME_EMITIDAS en las variables de entorno. Necesitas agregar esta variable a tu archivo .env.local');
  }

  const base = new Airtable({ apiKey }).base(baseId);
  return base(tableName);
}

// Función para obtener la configuración de empresa
async function getEmpresaConfig() {
  try {
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const configTable = process.env.AIRTABLE_TABLE_CONFIGURACION || 'ConfiguracionEmpresa';

    console.log('🔍 Configuración para tabla de empresa:');
    console.log('- API Key presente:', !!apiKey);
    console.log('- Base ID presente:', !!baseId);
    console.log('- Tabla configuración:', configTable);
    console.log('- Variable AIRTABLE_TABLE_CONFIGURACION:', process.env.AIRTABLE_TABLE_CONFIGURACION);

    if (!apiKey || !baseId) {
      console.warn('⚠️ No se pudo obtener configuración de empresa, usando valores por defecto');
      return null;
    }

    const base = new Airtable({ apiKey }).base(baseId);
    const table = base(configTable);
    
    console.log('🔍 Consultando tabla de empresa...');
    const records = await table.select({ maxRecords: 1 }).all();
    
    console.log('📊 Registros encontrados en ConfiguracionEmpresa:', records.length);
    
    if (records.length === 0) {
      console.warn('⚠️ No hay configuración de empresa en Airtable');
      console.warn('   Necesitas crear un registro en la tabla:', configTable);
      return null;
    }

    const record = records[0];
    
    // Logging detallado de campos
    console.log('📋 Campos disponibles en el registro:');
    console.log('- Nombre:', record.get('Nombre'));
    console.log('- RazonSocial:', record.get('RazonSocial'));
    console.log('- CIF:', record.get('CIF'));
    console.log('- Direccion:', record.get('Direccion'));
    console.log('- Ciudad:', record.get('Ciudad'));
    console.log('- Banco:', record.get('Banco'));
    console.log('- IBAN:', record.get('IBAN'));
    
    const empresaData = {
      nombre: record.get('Nombre') as string || record.get('RazonSocial') as string || 'Tu Empresa S.L.',
      cif: record.get('CIF') as string || 'B12345678',
      direccion: (() => {
        const dir = record.get('Direccion') as string || 'Calle Ejemplo, 123';
        const cp = record.get('CodigoPostal') as string || '28001';
        const ciudad = record.get('Ciudad') as string || 'Madrid';
        const provincia = record.get('Provincia') as string || 'Madrid';
        return `${dir}\n${cp} ${ciudad}, ${provincia}`;
      })(),
      telefono: record.get('Telefono') as string,
      email: record.get('Email') as string,
      web: record.get('Web') as string,
      datosBancarios: (() => {
        const banco = record.get('Banco') as string;
        const iban = record.get('IBAN') as string;
        const titular = record.get('TitularCuenta') as string;
        
        if (!banco && !iban) return '';
        
        let datos = '';
        if (banco) datos += `${banco}\n`;
        if (iban) datos += `IBAN: ${iban}\n`;
        if (titular) datos += `Titular: ${titular}`;
        
        return datos.trim();
      })(),
      logo: record.get('Logo') as string
    };
    
    console.log('✅ Datos de empresa procesados:', empresaData);
    return empresaData;
    
  } catch (error) {
    console.error('❌ Error obteniendo configuración de empresa:', error);
    
    // Log más detallado del error
    if (error instanceof Error) {
      console.error('   Tipo de error:', error.name);
      console.error('   Mensaje:', error.message);
      console.error('   Stack:', error.stack);
    }
    
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const url = new URL(request.url);
    const isPreview = url.searchParams.get('preview') === 'true';
    
    console.log('📄 Generando PDF para factura ID:', id);
    
    // Obtener la factura desde Airtable
    const table = getAirtableBase();
    const record = await table.find(id);

    // Transformar el registro a IssuedInvoice
    const factura: IssuedInvoice = {
      id: record.id,
      facturaID: record.get('facturaID') as string,
      creationDate: record.get('CreationDate') as string,
      fechavencimiento: record.get('Fechavencimiento') as string,
      nombrecliente: record.get('Nombrecliente') as string,
      cifcliente: record.get('CIFcliente') as string,
      direccioncliente: record.get('direccioncliente') as string,
      productofactura: (() => {
        const rawValue = record.get('Productofactura');
        
        console.log('🔍 DEBUGGING PRODUCTOS:');
        console.log('   Valor raw de Productofactura:', rawValue);
        console.log('   Tipo:', typeof rawValue);
        console.log('   Es array:', Array.isArray(rawValue));
        
        if (!rawValue) {
          console.log('   ❌ No hay productos - valor vacío');
          return [];
        }
        
        if (typeof rawValue === 'object') {
          console.log('   ✅ Productos como objeto:', rawValue);
          return rawValue;
        }
        
        try {
          const parsed = JSON.parse(rawValue as string);
          console.log('   ✅ Productos parseados desde JSON:', parsed);
          return parsed;
        } catch (e) {
          console.log('   ⚠️ No es JSON válido, devolviendo como string:', rawValue);
          return rawValue as string;
        }
      })(),
      cantidadproducto: parseFloat(record.get('cantidadproducto') as string) || 0,
      subtotal: parseFloat(record.get('subtotal') as string) || 0,
      tipoiva: parseFloat(record.get('tipoiva') as string) || 21,
      total: parseFloat(record.get('total') as string) || 0,
      estadofactura: record.get('estadofactura') as IssuedInvoice['estadofactura'] || 'registrada',
      datosbancarios: record.get('datosbancarios') as string || '',
    };

    console.log('✅ Factura obtenida correctamente:', factura.facturaID);
    console.log('📦 Productos procesados:', {
      productos: factura.productofactura,
      cantidadTotal: factura.cantidadproducto,
      subtotal: factura.subtotal,
      total: factura.total
    });

    // Obtener información de la empresa (datos reales o por defecto)
    const empresaConfig = await getEmpresaConfig();
    const empresaInfo = empresaConfig || {
      nombre: "Tu Empresa S.L.",
      cif: "B12345678",
      direccion: "Calle Ejemplo, 123\n28001 Madrid, España",
      telefono: "+34 900 000 000",
      email: "contacto@tuempresa.com",
      web: "www.tuempresa.com",
      datosBancarios: "",
      logo: undefined
    };

    console.log('🏢 Información de empresa:', {
      nombre: empresaInfo.nombre,
      configurada: !!empresaConfig
    });

    // Si no hay datos bancarios en la factura, usar los de la empresa
    if (!factura.datosbancarios && empresaInfo.datosBancarios) {
      factura.datosbancarios = empresaInfo.datosBancarios;
    }

    // Generar el PDF
    const stream = await renderToStream(
      FacturaPDF({ factura, empresaInfo })
    );

    // Convertir el stream a buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);

    console.log('📄 PDF generado exitosamente, tamaño:', pdfBuffer.length, 'bytes');

    // Preparar headers según si es vista previa o descarga
    const headers: Record<string, string> = {
      'Content-Type': 'application/pdf',
      'Cache-Control': 'no-cache',
    };

    if (isPreview) {
      headers['Content-Disposition'] = `inline; filename="Factura_${factura.facturaID}.pdf"`;
    } else {
      headers['Content-Disposition'] = `attachment; filename="Factura_${factura.facturaID}.pdf"`;
    }

    // Retornar el PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    
    // Dar información más específica según el tipo de error
    let errorMessage = 'Error desconocido al generar PDF';
    
    if (error instanceof Error) {
      if (error.message.includes('AIRTABLE_TABLE_NAME_EMITIDAS')) {
        errorMessage = 'Configuración incompleta: falta definir la tabla de facturas emitidas en Airtable. Revisar variables de entorno.';
      } else if (error.message.includes('NOT_AUTHORIZED')) {
        errorMessage = 'Sin permisos para acceder a la tabla de facturas en Airtable. Verificar permisos del API key.';
      } else if (error.message.includes('NOT_FOUND')) {
        errorMessage = 'Factura no encontrada en Airtable. Verificar que el ID sea correcto.';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
} 