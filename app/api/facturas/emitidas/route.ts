import { NextResponse } from 'next/server'
import Airtable from 'airtable'
import { IssuedInvoice } from '@/lib/types/issuedInvoice'

// Helper function to ensure date is current year
function getNormalizedTimestamp(): string {
  const now = new Date();
  return now.toISOString();
}

// Airtable configuration
function getAirtableBase() {
  const apiKey = process.env.AIRTABLE_API_KEY
  const baseId = process.env.AIRTABLE_BASE_ID
  const tableName = process.env.AIRTABLE_TABLE_NAME_EMITIDAS
  if (!apiKey || !baseId || !tableName) {
    throw new Error('Missing Airtable configuration for emitidas');
  }
  const base = new Airtable({ apiKey }).base(baseId);
  return base(tableName);
}

export async function GET() {
  try {
    console.log('API Route: Starting request for issued invoices')
    
    // Verificar que todas las variables de entorno necesarias estén definidas
    const requiredEnvVars = {
      AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
      AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID
    }

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key)

    if (missingVars.length > 0) {
      console.error('API Route: Missing environment variables:', missingVars)
      return NextResponse.json({
        success: false,
        error: `Missing required environment variables: ${missingVars.join(', ')}`,
        timestamp: getNormalizedTimestamp()
      }, { status: 500 })
    }

    // Get the Airtable table reference
    const table = getAirtableBase();
    
    // Get the records
    const records = await table.select({
      view: 'Grid view',
      sort: [{ field: 'facturaID', direction: 'desc' }]
    }).all();

    // Transform the records
    const invoices = records.map(record => ({
      id: record.id,
      facturaID: record.get('facturaID') as string,
      creationDate: record.get('CreationDate') as string,
      fechavencimiento: record.get('Fechavencimiento') as string,
      nombrecliente: record.get('Nombrecliente') as string,
      CIFcliente: record.get('CIFcliente') as string,
      direccioncliente: record.get('direccioncliente') as string,
      productofactura: JSON.parse((record.get('Productofactura') as string) || '[]'),
      catidadproducto: record.get('catidadproducto') as number,
      subtotal: record.get('subtotal') as number,
      tipoiva: record.get('tipoiva') as number,
      total: record.get('total') as number,
      estadofactura: record.get('estadofactura') as IssuedInvoice['estadofactura'],
      datosbancarios: record.get('datosbancarios') as string,
    }));

    console.log('API Route: Successfully fetched issued invoices:', {
      count: invoices.length,
      timestamp: getNormalizedTimestamp()
    })

    return NextResponse.json({
      success: true,
      invoices,
      metadata: {
        count: invoices.length,
        timestamp: getNormalizedTimestamp()
      }
    })
  } catch (error) {
    console.error('API Route: Error fetching issued invoices:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al obtener las facturas emitidas',
      timestamp: getNormalizedTimestamp()
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  // Create a redirect to the main facturas endpoint
  const url = new URL(request.url);
  const redirectUrl = new URL('/api/facturas', url.origin);
  
  return NextResponse.redirect(redirectUrl.toString(), { status: 307 });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const data = await request.json();
    const table = getAirtableBase();
    
    const records = await table.update([
      {
        id,
        fields: {
          CreationDate: data.creationDate,
          Fechavencimiento: data.fechavencimiento,
          Nombrecliente: data.nombrecliente,
          CIFcliente: data.CIFcliente,
          direccioncliente: data.direccioncliente,
          Productofactura: data.productofactura ? JSON.stringify(data.productofactura) : undefined,
          catidadproducto: data.catidadproducto,
          subtotal: data.subtotal,
          tipoiva: data.tipoiva,
          total: data.total,
          estadofactura: data.estadofactura,
          datosbancarios: data.datosbancarios,
        }
      }
    ]);

    const updatedRecord = records[0];
    const invoice = {
      id: updatedRecord.id,
      facturaID: updatedRecord.get('facturaID') as string,
      creationDate: updatedRecord.get('CreationDate') as string,
      fechavencimiento: updatedRecord.get('Fechavencimiento') as string,
      nombrecliente: updatedRecord.get('Nombrecliente') as string,
      CIFcliente: updatedRecord.get('CIFcliente') as string,
      direccioncliente: updatedRecord.get('direccioncliente') as string,
      productofactura: JSON.parse((updatedRecord.get('Productofactura') as string) || '[]'),
      catidadproducto: updatedRecord.get('catidadproducto') as number,
      subtotal: updatedRecord.get('subtotal') as number,
      tipoiva: updatedRecord.get('tipoiva') as number,
      total: updatedRecord.get('total') as number,
      estadofactura: updatedRecord.get('estadofactura') as IssuedInvoice['estadofactura'],
      datosbancarios: updatedRecord.get('datosbancarios') as string,
    };

    return NextResponse.json({
      success: true,
      invoice,
      timestamp: getNormalizedTimestamp()
    });
  } catch (error) {
    console.error('API Route: Error updating issued invoice:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error updating invoice',
      timestamp: getNormalizedTimestamp()
    }, { status: 500 });
  }
}

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
    console.error('API Route: Error deleting issued invoice:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error deleting invoice',
      timestamp: getNormalizedTimestamp()
    }, { status: 500 });
  }
} 