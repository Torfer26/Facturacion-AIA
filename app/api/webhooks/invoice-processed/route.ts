import { NextRequest, NextResponse } from 'next/server';
import { updateIssuedInvoice } from '@/lib/services/issuedInvoices';
import { validateWebhookRequest } from '@/lib/services/n8n';
import { WebhookResponse } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    // Validar la API key en los headers
    const apiKey = req.headers.get('x-api-key');
    
    if (!apiKey || !validateWebhookRequest(apiKey)) {
      return NextResponse.json(
        { error: 'API Key inválida o no proporcionada' },
        { status: 401 }
      );
    }

    // Obtener y validar los datos
    const data = await req.json() as WebhookResponse;
    
    if (!data.invoiceId || !data.status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Mapear el estado del webhook al estado de la factura
    const estadoFactura = data.status === 'processed' ? 'pdfgenerado' : 'registrada';

    await updateIssuedInvoice(data.invoiceId, { estadofactura: estadoFactura });

    return NextResponse.json({
      success: true,
      message: 'Invoice status updated successfully'
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 