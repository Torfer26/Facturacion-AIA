import { NextResponse } from 'next/server'
import Airtable from 'airtable'
import { IssuedInvoice } from '@/lib/types/issuedInvoice'

import { getNormalizedTimestamp } from '@/lib/utils/api-helpers';

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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    // Get the Airtable table reference
    const table = getAirtableBase();
    
    // Get the record
    const record = await table.find(id);

    // Transform the record
    const invoice = {
      id: record.id,
      facturaID: record.get('facturaID') as string,
      creationDate: record.get('CreationDate') as string,
      fechavencimiento: record.get('Fechavencimiento') as string,
      nombrecliente: record.get('Nombrecliente') as string,
      cifcliente: record.get('CIFcliente') as string,
      direccioncliente: record.get('direccioncliente') as string,
      productofactura: (() => {
        const rawValue = record.get('Productofactura');
        if (!rawValue) return [];
        if (typeof rawValue === 'object') return rawValue;
        try {
          return JSON.parse(rawValue as string);
        } catch (e) {
          // If it's a string that's not valid JSON, just make it a single product
          return [{
            descripcion: rawValue as string,
            cantidad: 1,
            precioUnitario: 0
          }];
        }
      })(),
      cantidadproducto: parseFloat(record.get('cantidadproducto') as string) || 0,
      subtotal: parseFloat(record.get('subtotal') as string) || 0,
      tipoiva: parseFloat(record.get('tipoiva') as string) || 21,
      total: parseFloat(record.get('total') as string) || 0,
      estadofactura: record.get('estadofactura') as IssuedInvoice['estadofactura'] || 'registrada',
      datosbancarios: record.get('datosbancarios') as string || '',
    };

    return NextResponse.json({
      success: true,
      invoice,
      timestamp: getNormalizedTimestamp()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al obtener la factura emitida',
      timestamp: getNormalizedTimestamp()
    }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
          CIFcliente: data.cifcliente,
          direccioncliente: data.direccioncliente,
          Productofactura: data.productofactura ? JSON.stringify(data.productofactura) : undefined,
          cantidadproducto: data.cantidadproducto,
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
      cifcliente: updatedRecord.get('CIFcliente') as string,
      direccioncliente: updatedRecord.get('direccioncliente') as string,
      productofactura: (() => {
        const rawValue = updatedRecord.get('Productofactura');
        if (!rawValue) return [];
        if (typeof rawValue === 'object') return rawValue;
        try {
          return JSON.parse(rawValue as string);
        } catch (e) {
          // If it's a string that's not valid JSON, just make it a single product
          return [{
            descripcion: rawValue as string,
            cantidad: 1,
            precioUnitario: 0
          }];
        }
      })(),
      cantidadproducto: updatedRecord.get('cantidadproducto') as number,
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
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error updating invoice',
      timestamp: getNormalizedTimestamp()
    }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error deleting invoice',
      timestamp: getNormalizedTimestamp()
    }, { status: 500 });
  }
} 