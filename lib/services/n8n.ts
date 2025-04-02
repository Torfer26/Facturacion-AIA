/**
 * Servicio para interactuar con n8n para el procesamiento de facturas
 */

export interface N8nProcessInvoiceParams {
  invoiceId: string;
  fileUrl: string;
  empresaId: string;
  tipo: 'EMITIDA' | 'RECIBIDA';
}

export interface N8nProcessResponse {
  success: boolean;
  message: string;
  jobId?: string;
}

/**
 * Solicita a n8n que procese una factura
 */
export async function requestInvoiceProcessing({
  invoiceId,
  fileUrl,
  empresaId,
  tipo
}: N8nProcessInvoiceParams): Promise<N8nProcessResponse> {
  try {
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (!n8nWebhookUrl) {
      throw new Error('URL del webhook de n8n no configurada');
    }

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.N8N_API_KEY || '',
      },
      body: JSON.stringify({
        invoiceId,
        fileUrl,
        empresaId,
        tipo,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Error al enviar a n8n: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    
    return {
      success: true,
      message: 'Factura enviada a procesar',
      jobId: responseData.jobId,
    };
  } catch (error) {
    console.error('Error al solicitar procesamiento de factura:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido al procesar factura',
    };
  }
}

/**
 * Valida la respuesta de webhook de n8n
 */
export function validateWebhookRequest(apiKey: string): boolean {
  const expectedApiKey = process.env.N8N_API_KEY;
  
  if (!expectedApiKey) {
    console.warn('API Key de n8n no configurada');
    return false;
  }
  
  return apiKey === expectedApiKey;
} 