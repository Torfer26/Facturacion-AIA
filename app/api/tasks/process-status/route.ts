import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/services/db';

export async function GET(req: NextRequest) {
  try {
    // Obtener parámetros de consulta
    const searchParams = req.nextUrl.searchParams;
    const empresaId = searchParams.get('empresaId');
    const facturaId = searchParams.get('facturaId');
    const estado = searchParams.get('estado');
    
    // Validar que al menos hay un parámetro de búsqueda
    if (!empresaId && !facturaId && !estado) {
      return NextResponse.json(
        { error: 'Se requiere al menos un parámetro de búsqueda: empresaId, facturaId o estado' },
        { status: 400 }
      );
    }

    // Construir el objeto de consulta para Prisma
    const where: any = {};
    
    if (empresaId) {
      where.empresaId = empresaId;
    }
    
    if (facturaId) {
      where.id = facturaId;
    }
    
    if (estado) {
      where.estado = estado;
    }

    // Buscar las facturas
    const facturas = await prisma.factura.findMany({
      where,
      select: {
        id: true,
        numero: true,
        tipo: true,
        estado: true,
        fecha: true,
        importe: true,
        clienteId: true,
        proveedorId: true,
        empresaId: true,
        createdAt: true,
        updatedAt: true,
        // Seleccionar clientes y proveedores relacionados
        cliente: {
          select: {
            id: true,
            nombre: true,
            nif: true,
          },
        },
        proveedor: {
          select: {
            id: true,
            nombre: true,
            nif: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 50, // Limitar la cantidad de resultados
    });

    return NextResponse.json({
      success: true,
      data: facturas,
      count: facturas.length,
    });
  } catch (error) {
    console.error('Error al consultar estado de procesamiento:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        message: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
} 