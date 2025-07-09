import { NextResponse } from 'next/server';
import Airtable from 'airtable';
import { IssuedInvoice } from '@/lib/types/issuedInvoice';
import { getUserFromRequest, createUserFilter, addUserToRecordData, canAccessRecord, logDataAccess } from '@/lib/utils/userFilters';
import { 
  getNormalizedTimestamp, 
  createAuthErrorResponse,
  createServerErrorResponse,
  createSuccessResponse
} from '@/lib/utils/api-helpers';

// Airtable connection setup
function getAirtableBase() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME_EMITIDAS;

  if (!apiKey || !baseId || !tableName) {
    throw new Error('Missing Airtable configuration for emitidas');
  }

  const base = new Airtable({ apiKey }).base(baseId);
  return base(tableName);
}

// GET issued invoices
export async function GET(request: Request) {
  try {
    // Extraer información del usuario
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Usuario no autenticado'
      }, { status: 401 });
    }

    logDataAccess(user, 'GET', 'facturas-emitidas');

    const table = getAirtableBase();

    // Aplicar filtros según el rol del usuario
    const userFilter = createUserFilter(user);
    const selectOptions = {
      view: 'Grid view',
      sort: [{ field: 'facturaID', direction: 'desc' as const }],
      ...userFilter
    };

    const records = await table.select(selectOptions).all();

    const invoices = records.map(record => ({
      id: record.id,
      facturaID: record.get('facturaID') as string,
      creationDate: record.get('CreationDate') as string,
      fechavencimiento: record.get('Fechavencimiento') as string,
      nombrecliente: record.get('Nombrecliente') as string,
      cifcliente: record.get('CIFcliente') as string,
      direccioncliente: record.get('direccioncliente') as string,
      productofactura: (() => {
        const rawValue = record.get('Productofactura');
        if (!rawValue) return '';
        if (typeof rawValue === 'object') return JSON.stringify(rawValue);
        try {
          return JSON.parse(rawValue as string);
        } catch (e) {
          // If it's a string that's not valid JSON, just return it as is
          return rawValue;
        }
      })(),
      cantidadproducto: parseFloat(record.get('cantidadproducto') as string) || 0,
      subtotal: parseFloat(record.get('subtotal') as string) || 0,
      tipoiva: parseFloat(record.get('tipoiva') as string) || 21,
      total: parseFloat(record.get('total') as string) || 0,
      estadofactura: record.get('estadofactura') as IssuedInvoice['estadofactura'] || 'registrada',
      datosbancarios: record.get('datosbancarios') as string || '',
    }));

    return NextResponse.json({
      success: true,
      invoices,
      metadata: {
        count: invoices.length,
        timestamp: getNormalizedTimestamp()
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: getNormalizedTimestamp()
    }, { status: 500 });
  }
}

// POST para crear una nueva factura emitida
export async function POST(request: Request) {
  try {
    // Extraer información del usuario
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Usuario no autenticado'
      }, { status: 401 });
    }

    const body = await request.json();
    const table = getAirtableBase();

    logDataAccess(user, 'CREATE', 'facturas-emitidas');

    console.log('🔍 DEBUGGING POST FACTURA:');
    console.log('📦 Body completo recibido:', JSON.stringify(body, null, 2));
    console.log('👤 Usuario creador:', user.email, `(${user.id})`);

    const baseFields = {
      CreationDate: body.CreationDate || body.creationDate,
      Fechavencimiento: body.Fechavencimiento || body.fechavencimiento,
      Nombrecliente: body.Nombrecliente || body.nombrecliente,
      CIFcliente: body.CIFcliente || body.cifcliente,
      direccioncliente: body.direccioncliente,
      Productofactura: body.Productofactura || body.productofactura,
      cantidadproducto: body.cantidadproducto,
      subtotal: body.subtotal,
      tipoiva: body.tipoiva,
      total: body.total,
      estadofactura: body.estadofactura,
      datosbancarios: body.datosbancarios,
    };

    // Añadir información del usuario automáticamente
    const fields = addUserToRecordData(baseFields, user);

    console.log('📝 Fields que se van a guardar en Airtable:', JSON.stringify(fields, null, 2));

    const created = await table.create([{ fields }]);
    const createdId = created[0].id;

    console.log('✅ Factura creada con ID:', createdId);

    return NextResponse.json({
      success: true,
      invoiceId: createdId,
      timestamp: getNormalizedTimestamp()
    });
  } catch (error) {
    console.error('❌ Error creando factura:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Airtable error',
      timestamp: getNormalizedTimestamp()
    }, { status: 500 });
  }
}

// PUT para actualizar
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Extraer información del usuario
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Usuario no autenticado'
      }, { status: 401 });
    }

    const id = params.id;
    const data = await request.json();
    const table = getAirtableBase();

    // Verificar que el usuario puede acceder a este registro
    const existingRecord = await table.find(id);
    if (!canAccessRecord(user, existingRecord.fields)) {
      logDataAccess(user, 'UPDATE_DENIED', 'facturas-emitidas', id);
      return NextResponse.json({
        success: false,
        error: 'No tienes permisos para modificar esta factura'
      }, { status: 403 });
    }

    logDataAccess(user, 'UPDATE', 'facturas-emitidas', id);

    const updated = await table.update([
      {
        id,
        fields: {
          CreationDate: data.creationDate,
          Fechavencimiento: data.fechavencimiento,
          Nombrecliente: data.nombrecliente,
          CIFcliente: data.cifcliente,
          direccioncliente: data.direccioncliente,
          Productofactura: data.productofactura,
          cantidadproducto: data.cantidadproducto,
          subtotal: data.subtotal,
          tipoiva: data.tipoiva,
          total: data.total,
          estadofactura: data.estadofactura,
          datosbancarios: data.datosbancarios,
          // Mantener la información del usuario original
          UserID: existingRecord.get('UserID'),
          UserEmail: existingRecord.get('UserEmail'),
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      invoice: updated[0],
      timestamp: getNormalizedTimestamp()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error updating invoice',
      timestamp: getNormalizedTimestamp()
    }, { status: 500 });
  }
}

// DELETE
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Extraer información del usuario
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Usuario no autenticado'
      }, { status: 401 });
    }

    const id = params.id;
    const table = getAirtableBase();

    // Verificar que el usuario puede acceder a este registro
    const existingRecord = await table.find(id);
    if (!canAccessRecord(user, existingRecord.fields)) {
      logDataAccess(user, 'DELETE_DENIED', 'facturas-emitidas', id);
      return NextResponse.json({
        success: false,
        error: 'No tienes permisos para eliminar esta factura'
      }, { status: 403 });
    }

    logDataAccess(user, 'DELETE', 'facturas-emitidas', id);

    await table.destroy(id);

    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully',
      timestamp: getNormalizedTimestamp()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error deleting invoice',
      timestamp: getNormalizedTimestamp()
    }, { status: 500 });
  }
}
