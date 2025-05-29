import { NextResponse } from 'next/server';
import Airtable from 'airtable';
import { EmpresaProfile } from '@/lib/types/empresa';

// Configuración de Airtable para empresa
function getAirtableBase() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_CONFIGURACION || 'ConfiguracionEmpresa';

  if (!apiKey || !baseId) {
    throw new Error('Missing Airtable configuration for empresa');
  }

  const base = new Airtable({ apiKey }).base(baseId);
  return base(tableName);
}

// GET - Obtener perfil de empresa
export async function GET() {
  try {
    const table = getAirtableBase();
    
    console.log('🔍 Iniciando GET de perfil de empresa...');
    console.log('📋 Tabla configurada:', process.env.AIRTABLE_TABLE_CONFIGURACION || 'ConfiguracionEmpresa');
    
    // Obtener TODOS los registros para ver qué hay
    const allRecords = await table.select({}).all();
    
    console.log('📊 Total de registros en la tabla:', allRecords.length);
    
    if (allRecords.length === 0) {
      console.log('❌ No hay registros en la tabla');
      return NextResponse.json({
        success: true,
        empresa: null,
        message: 'No hay perfil de empresa configurado'
      });
    }

    // Buscar el primer registro que tenga campos
    let recordWithData = null;
    for (const record of allRecords) {
      const fieldNames = Object.keys(record.fields);
      if (fieldNames.length > 0) {
        recordWithData = record;
        console.log('✅ Encontrado registro con datos:', record.id);
        break;
      }
    }

    if (!recordWithData) {
      console.log('❌ No se encontró ningún registro con datos');
      return NextResponse.json({
        success: true,
        empresa: null,
        message: 'No hay datos de empresa configurados'
      });
    }

    const record = recordWithData;
    
    // Crear el objeto empresa con los nombres de campos reales
    const empresa: EmpresaProfile = {
      id: record.id,
      nombre: record.get('Nombre') as string || '',
      cif: record.get('CIF') as string || '',
      razonSocial: record.get('RazonSocial') as string || '',
      direccion: record.get('Direccion') as string || '',
      codigoPostal: record.get('CodigoPostal') as string || '',
      ciudad: record.get('Ciudad') as string || '',
      provincia: record.get('Provincia') as string || '',
      pais: record.get('Pais') as string || 'España',
      telefono: record.get('Telefono') as string,
      email: record.get('Email') as string,
      web: record.get('Web') as string,
      datosBancarios: {
        banco: record.get('Banco') as string || '',
        iban: record.get('IBAN') as string || '',
        swift: record.get('SWIFT') as string,
        titular: record.get('TitularCuenta') as string || '',
      },
      logo: record.get('Logo') as string,
      colorPrimario: record.get('ColorPrimario') as string,
      colorSecundario: record.get('ColorSecundario') as string,
      tipoSociedad: (record.get('TipoSociedad') as any) || 'limitada',
      periodoLiquidacion: (record.get('PeriodoLiquidacion') as any) || 'trimestral',
      regimenEspecial: record.get('RegimenEspecial') as string,
      codigoActividad: record.get('CodigoActividad') as string || '',
      epigrafeIAE: record.get('EpigrafeIAE') as string || '',
      ejercicioFiscal: {
        inicio: record.get('EjercicioInicio') as string || '01-01',
        fin: record.get('EjercicioFin') as string || '31-12'
      },
      numeracionFacturas: {
        prefijo: record.get('PrefijoFacturas') as string || 'F',
        siguienteNumero: parseInt(record.get('SiguienteNumeroFactura') as string) || 1,
        digitos: parseInt(record.get('DigitosFactura') as string) || 4
      },
      createdAt: record.createdTime,
      updatedAt: record.createdTime
    };

    console.log('✅ Empresa procesada para frontend:', {
      nombre: empresa.nombre,
      cif: empresa.cif,
      ciudad: empresa.ciudad
    });

    return NextResponse.json({
      success: true,
      empresa
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo perfil empresa:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// POST/PUT - Crear o actualizar perfil de empresa
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const table = getAirtableBase();
    
    console.log('🔍 Iniciando POST de perfil de empresa...');
    
    // Verificar si ya existe un perfil
    const existingRecords = await table.select({ maxRecords: 1 }).all();
    
    console.log('📊 Registros existentes:', existingRecords.length);
    
    // 🔍 DEBUGGING: Si existe un registro, mostrar sus campos
    if (existingRecords.length > 0) {
      console.log('🔍 DEBUGGING - Campos existentes en la tabla:');
      const fields = existingRecords[0].fields;
      const fieldNames = Object.keys(fields);
      
      if (fieldNames.length === 0) {
        console.log('⚠️ La tabla existe pero NO tiene campos definidos');
        console.log('💡 Solución: Crear los campos básicos primero');
      } else {
        fieldNames.forEach(fieldName => {
          console.log(`   - Campo disponible: "${fieldName}"`);
        });
      }
    }
    
    // Crear solo los campos básicos primero si la tabla está vacía
    const fieldsBasicos = {
      Nombre: data.nombre || 'Mi Empresa',
      CIF: data.cif || 'B12345678',
      Direccion: data.direccion || 'Dirección pendiente',
      Ciudad: data.ciudad || 'Madrid',
      Telefono: data.telefono || '',
      Email: data.email || ''
    };
    
    console.log('🔍 DEBUGGING - Intentando guardar campos básicos:', Object.keys(fieldsBasicos));

    let result;
    
    try {
      if (existingRecords.length > 0) {
        // Actualizar registro existente con campos básicos
        const recordId = existingRecords[0].id;
        console.log('🔄 Actualizando registro existente:', recordId);
        
        const updated = await table.update([{
          id: recordId,
          fields: fieldsBasicos
        }]);
        result = updated[0];
        
        console.log('✅ Registro actualizado exitosamente');
        
      } else {
        // Crear nuevo registro con campos básicos
        console.log('➕ Creando nuevo registro...');
        
        const created = await table.create([{ fields: fieldsBasicos }]);
        result = created[0];
        
        console.log('✅ Nuevo registro creado exitosamente');
      }

      return NextResponse.json({
        success: true,
        empresa: {
          id: result.id,
          nombre: data.nombre,
          cif: data.cif,
          direccion: data.direccion,
          ciudad: data.ciudad,
          telefono: data.telefono,
          email: data.email,
          // Campos por defecto para los demás
          razonSocial: data.razonSocial || '',
          codigoPostal: data.codigoPostal || '',
          provincia: data.provincia || '',
          pais: 'España',
          web: data.web || '',
          datosBancarios: {
            banco: '',
            iban: '',
            swift: '',
            titular: ''
          },
          tipoSociedad: 'limitada',
          periodoLiquidacion: 'trimestral',
          regimenEspecial: '',
          codigoActividad: '',
          epigrafeIAE: '',
          ejercicioFiscal: {
            inicio: '01-01',
            fin: '31-12'
          },
          numeracionFacturas: {
            prefijo: 'F',
            siguienteNumero: 1,
            digitos: 4
          },
          createdAt: result.createdTime || new Date().toISOString(),
          updatedAt: result.createdTime || new Date().toISOString()
        },
        message: existingRecords.length > 0 ? 'Perfil actualizado con campos básicos' : 'Perfil creado con campos básicos'
      });
      
    } catch (updateError) {
      console.error('❌ Error en update/create:', updateError);
      
      // Si falla, devolver un error más informativo
      return NextResponse.json({
        success: false,
        error: 'No se pudieron crear los campos en Airtable. Necesitas crear manualmente las columnas en tu tabla.',
        details: updateError instanceof Error ? updateError.message : 'Error desconocido',
        solution: 'Ve a tu tabla ConfiguracionEmpresa en Airtable y crea las columnas: Nombre, CIF, Direccion, Ciudad, Telefono, Email'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Error general guardando perfil empresa:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
} 