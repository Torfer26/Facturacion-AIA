import { NextResponse } from 'next/server';
import Airtable from 'airtable';
import { IssuedInvoice } from '@/lib/types/issuedInvoice';

// Helper function to get ISO timestamp
function getNormalizedTimestamp(): string {
  return new Date().toISOString();
}

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
export async function GET() {
  try {
    const table = getAirtableBase();

    const records = await table.select({
      view: 'Grid view',
      sort: [{ field: 'facturaID', direction: 'desc' }]
    }).all();

    console.log('Registros desde Airtable:', records.map(r => ({
      id: r.id,
      total: r.get('total'),
      tipoTotal: typeof r.get('total'),
      fecha: r.get('CreationDate'),
      tipoFecha: typeof r.get('CreationDate')
    })));

    const invoices = records.map(record => ({
      id: record.id,
      facturaID: record.get('facturaID') as string,
      CreationDate: record.get('CreationDate') as string,
      Fechavencimiento: record.get('Fechavencimiento') as string,
      Nombrecliente: record.get('Nombrecliente') as string,
      CIFcliente: record.get('CIFcliente') as string,
      direccioncliente: record.get('direccioncliente') as string,
      Productofactura: (() => {
        const rawValue = record.get('Productofactura');
        if (!rawValue) return '';
        if (typeof rawValue === 'object') return JSON.stringify(rawValue);
        try {
          return JSON.parse(rawValue as string);
        } catch (e) {
          console.log(`Unable to parse productofactura as JSON: ${rawValue}`);
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

    console.log('Facturas procesadas:', invoices.map(i => ({
      id: i.id,
      total: i.total,
      tipoTotal: typeof i.total,
      fecha: i.CreationDate,
      tipoFecha: typeof i.CreationDate
    })));
    

    return NextResponse.json({
      success: true,
      invoices,
      metadata: {
        count: invoices.length,
        timestamp: getNormalizedTimestamp()
      }
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: getNormalizedTimestamp()
    }, { status: 500 });
  }
}

// ✅ POST para crear una nueva factura emitida
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('API Route: Received invoice data:', body);

    const table = getAirtableBase();

    const fields = {
      CreationDate: body.CreationDate,
      Fechavencimiento: body.Fechavencimiento,
      Nombrecliente: body.Nombrecliente,
      CIFcliente: body.CIFcliente,
      direccioncliente: body.direccioncliente,
      Productofactura: body.Productofactura,
      cantidadproducto: body.cantidadproducto,
      subtotal: body.subtotal,
      tipoiva: body.tipoiva,
      total: body.total,
      estadofactura: body.estadofactura,
      datosbancarios: body.datosbancarios,
    };

    const created = await table.create([{ fields }]);
    const createdId = created[0].id;

    return NextResponse.json({
      success: true,
      invoiceId: createdId,
      timestamp: getNormalizedTimestamp()
    });
  } catch (error) {
    console.error('POST error:', error);
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
    const id = params.id;
    const data = await request.json();
    const table = getAirtableBase();

    const updated = await table.update([
      {
        id,
        fields: {
          CreationDate: data.CreationDate,
          Fechavencimiento: data.Fechavencimiento,
          Nombrecliente: data.Nombrecliente,
          CIFcliente: data.CIFcliente,
          direccioncliente: data.direccioncliente,
          Productofactura: data.Productofactura,
          cantidadproducto: data.cantidadproducto,
          subtotal: data.subtotal,
          tipoiva: data.tipoiva,
          total: data.total,
          estadofactura: data.estadofactura,
          datosbancarios: data.datosbancarios,
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      invoice: updated[0],
      timestamp: getNormalizedTimestamp()
    });
  } catch (error) {
    console.error('PUT error:', error);
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
    const id = params.id;
    const table = getAirtableBase();

    await table.destroy(id);

    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully',
      timestamp: getNormalizedTimestamp()
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error deleting invoice',
      timestamp: getNormalizedTimestamp()
    }, { status: 500 });
  }
}
