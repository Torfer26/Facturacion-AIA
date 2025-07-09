import { NextRequest, NextResponse } from 'next/server';
import { updateIssuedInvoice } from '@/lib/services/issuedInvoices';
import { validateWebhookRequest } from '@/lib/services/n8n';
import { WebhookResponse } from '@/lib/types';
import Airtable from 'airtable';
import { 
  createServerErrorResponse, 
  createSuccessResponse,
  validateAirtableEnv 
} from '@/lib/utils/api-helpers';

// Airtable configuration for received invoices
function getAirtableBase() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME_RECIBIDAS;
  
  if (!apiKey || !baseId || !tableName) {
    throw new Error('Missing Airtable configuration for received invoices');
  }
  
  const base = new Airtable({ apiKey }).base(baseId);
  return base(tableName);
}

export async function POST(req: NextRequest) {
  try {
    // Debug: mostrar todos los headers recibidos
    console.log('[WEBHOOK] Headers recibidos:');
    req.headers.forEach((value, key) => {
      if (key.toLowerCase().includes('api') || key.toLowerCase().includes('auth')) {
        console.log(`[WEBHOOK] Header: ${key} = ${value}`);
      }
    });
    
    // Validar la API key en los headers (case-insensitive)
    const apiKey = req.headers.get('x-api-key') || req.headers.get('X-API-Key');
    
    console.log('[WEBHOOK] API Key extraída:', apiKey ? `"${apiKey}"` : 'NULL');
    console.log('[WEBHOOK] API Key esperada:', process.env.N8N_API_KEY ? `"${process.env.N8N_API_KEY}"` : 'NULL');
    
    if (!apiKey || !validateWebhookRequest(apiKey)) {
      console.log('[WEBHOOK] ❌ Autenticación fallida. API Key recibida:', apiKey ? 'SET' : 'NOT_SET');
      return NextResponse.json(
        { error: 'API Key inválida o no proporcionada' },
        { status: 401 }
      );
    }

    console.log('[WEBHOOK] ✅ Autenticación exitosa');
    console.log('[WEBHOOK] Procesando webhook de factura procesada...');

    // Obtener y validar los datos
    const data = await req.json() as WebhookResponse & {
      tipo?: 'EMITIDA' | 'RECIBIDA';
      userEmail?: string; // 👤 UserEmail viene directamente del webhook de n8n
      extractedData?: {
        customerName?: string;
        supplierName?: string;
        supplierVat?: string;
        supplierAddress?: string;
        invoiceDate?: string;
        invoiceNumber?: string;
        totalWithoutVat?: number;
        totalWithVat?: number;
        vatPercentage?: number;
        vatAmount?: number;
        description?: string;
        userId?: string;
        userEmail?: string;
      };
      fileUrl?: string;
      empresaId?: string;
    };
    
    console.log('[WEBHOOK] Datos recibidos:', JSON.stringify(data, null, 2));
    
    if (!data.invoiceId || !data.status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Si es una factura EMITIDA, usar el flujo original
    if (data.tipo === 'EMITIDA') {
      console.log('[WEBHOOK] Procesando factura EMITIDA...');
      const estadoFactura = data.status === 'processed' ? 'pdfgenerado' : 'registrada';
      await updateIssuedInvoice(data.invoiceId, { estadofactura: estadoFactura });
      
      return NextResponse.json({
        success: true,
        message: 'Invoice status updated successfully'
      });
    }

    // Si es una factura RECIBIDA, crear el registro en Airtable
    if (data.tipo === 'RECIBIDA' && data.status === 'processed' && data.extractedData) {
      console.log('[WEBHOOK] Procesando factura RECIBIDA, creando registro...');
      
      try {
        // Validar entorno de Airtable
        const envValidation = validateAirtableEnv();
        if (!envValidation.valid) {
          return envValidation.response!;
        }

        const table = getAirtableBase();
        const extracted = data.extractedData;
        
        // Preparar datos para Airtable
        const invoiceData = {
          'InvoiceDate': extracted.invoiceDate || new Date().toISOString(),
          'Invoice Number': extracted.invoiceNumber || data.invoiceId,
          'Customer Name': extracted.customerName || 'Cliente procesado automáticamente',
          'Supplier name': extracted.supplierName || '',
          'Supplier VAT Identification Number': extracted.supplierVat || '',
          'Supplier Address': extracted.supplierAddress || '',
          'Total Price excluding VAT': extracted.totalWithoutVat || 0,
          'Total Price including VAT': extracted.totalWithVat || 0,
          'Tax percentage': extracted.vatPercentage || 21,
          'Tax amount': extracted.vatAmount || 0,
          'Invoice description': extracted.description || 'Factura procesada automáticamente',
          'URL Google Drive': data.fileUrl || '',
          'InternalID': data.invoiceId,
          // Añadir información del usuario si está disponible
          ...(data.empresaId && { 'UserID': data.empresaId }),
          ...(data.userEmail && { 'UserEmail': data.userEmail })
        };

        console.log('[WEBHOOK] Datos a guardar en Airtable:', JSON.stringify(invoiceData, null, 2));

        // Crear el registro en Airtable
        const createdRecord = await table.create([{ fields: invoiceData }]);
        
        console.log('[WEBHOOK] ✅ Registro creado en Airtable:', createdRecord[0].id);

        return NextResponse.json({
          success: true,
          message: 'Factura recibida procesada y guardada exitosamente',
          airtableId: createdRecord[0].id,
          invoiceId: data.invoiceId
        });

      } catch (airtableError) {
        console.error('[WEBHOOK] ❌ Error al crear registro en Airtable:', airtableError);
        
        return NextResponse.json({
          success: false,
          error: 'Error al guardar la factura en Airtable',
          details: airtableError instanceof Error ? airtableError.message : 'Error desconocido',
          invoiceId: data.invoiceId
        }, { status: 500 });
      }
    }

    // Si el procesamiento falló
    if (data.status === 'failed') {
      console.log('[WEBHOOK] ❌ Procesamiento de factura falló:', data.invoiceId);
      
      return NextResponse.json({
        success: false,
        message: 'Processing failed',
        invoiceId: data.invoiceId,
        errors: data.errors || []
      });
    }

    // Caso por defecto
    return NextResponse.json({
      success: true,
      message: 'Webhook received but no action taken',
      invoiceId: data.invoiceId
    });

  } catch (error) {
    console.error('[WEBHOOK] ❌ Error general en webhook:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
} 