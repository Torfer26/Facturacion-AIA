import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/services/db';
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
    
    if (!data.invoiceId) {
      return NextResponse.json(
        { error: 'ID de factura no proporcionado' },
        { status: 400 }
      );
    }

    // Buscar la factura en la base de datos
    const factura = await prisma.factura.findUnique({
      where: { id: data.invoiceId },
    });

    if (!factura) {
      return NextResponse.json(
        { error: `Factura con ID ${data.invoiceId} no encontrada` },
        { status: 404 }
      );
    }

    // Actualizar el estado de la factura en función del resultado del procesamiento
    const estadoActualizado = data.status === 'processed' ? 'PROCESADA' : 'ERROR';
    
    // Actualizar la factura en la base de datos
    const facturaActualizada = await prisma.factura.update({
      where: { id: data.invoiceId },
      data: {
        estado: estadoActualizado,
        datosJson: data.extractedData || null,
      },
    });

    // Registrar la actividad en el log
    await prisma.log.create({
      data: {
        accion: `Factura ${data.status === 'processed' ? 'procesada' : 'con error de procesamiento'}`,
        entidad: 'Factura',
        userId: 'sistema',
        payload: {
          facturaId: data.invoiceId,
          status: data.status,
          extractedData: data.extractedData,
          errors: data.status === 'error' ? data.message : undefined
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Factura ${data.invoiceId} actualizada correctamente`,
      data: facturaActualizada,
    });
  } catch (error) {
    console.error('Error al procesar webhook:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        message: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
} 