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
    const n8nApiKey = process.env.N8N_API_KEY;
    
    // DEBUGGING LOGS
    console.log('[N8N DEBUG] URL configurada:', n8nWebhookUrl || 'NOT_SET');
    console.log('[N8N DEBUG] API Key configurada:', n8nApiKey ? `SET (${n8nApiKey.length} chars)` : 'NOT_SET');
    console.log('[N8N DEBUG] API Key value:', n8nApiKey ? `${n8nApiKey.substring(0, 10)}...` : 'NOT_SET');
    
    if (!n8nWebhookUrl) {
      throw new Error('URL del webhook de n8n no configurada');
    }

    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': n8nApiKey || '',
    };

    const payload = {
      invoiceId,
      fileUrl,
      empresaId,
      tipo,
      timestamp: new Date().toISOString(),
    };

    console.log('[N8N DEBUG] Enviando a URL:', n8nWebhookUrl);
    console.log('[N8N DEBUG] Headers:', JSON.stringify(headers, null, 2));
    console.log('[N8N DEBUG] Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    console.log('[N8N DEBUG] Response status:', response.status);
    console.log('[N8N DEBUG] Response statusText:', response.statusText);

    if (!response.ok) {
      const responseText = await response.text();
      console.log('[N8N DEBUG] Response body:', responseText);
      throw new Error(`Error al enviar a n8n: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    
    return {
      success: true,
      message: 'Factura enviada a procesar',
      jobId: responseData.jobId,
    };
  } catch (error) {
    console.error('[N8N DEBUG] Error completo:', error);
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
    return false;
  }
  
  return apiKey === expectedApiKey;
}

export async function processInvoice(fileId: string) {
  const response = await fetch('/api/tasks/process-status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fileId }),
  })

  const data = await response.json()

  if (!data.success) {
    throw new Error(data.error || 'Error al procesar la factura')
  }

  return data
} 