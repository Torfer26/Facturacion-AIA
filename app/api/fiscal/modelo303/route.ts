import { NextResponse } from 'next/server'
import { getModelos303, createModelo303 } from '@/lib/services/airtable-fiscal'
import { verifyToken } from '@/lib/auth'
import { verifyToken as verifyJWT } from '@/lib/auth-v2/jwt'
import { z } from 'zod'

// Helper function to ensure date is current year
function getNormalizedTimestamp(): string {
  const now = new Date();
  return now.toISOString();
}

// Check authentication helper
async function checkAuth(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(cookie => {
      const [name, value] = cookie.trim().split('=');
      return [name, value];
    })
  );
  
  const token = cookies['auth-token'];
  
  if (!token) {
    return { authenticated: false, error: 'No authentication token provided' };
  }
  
  // Try to verify token with both systems
  let user = await verifyToken(token); // V1 system
  
  if (!user) {
    // Try V2 system (JWT)
    try {
      const jwtUser = await verifyJWT(token);
      if (jwtUser) {
        user = {
          id: jwtUser.id,
          email: jwtUser.email,
          name: jwtUser.name || jwtUser.email,
          role: jwtUser.role.toLowerCase()
        };
      }
    } catch (error) {
      // JWT verification failed, user remains null
    }
  }
  
  if (!user) {
    return { authenticated: false, error: 'Invalid authentication token' };
  }
  
  return { authenticated: true, user };
}

// Schema de validación para crear un modelo 303
const Modelo303Schema = z.object({
  ejercicio: z.number().min(2020).max(2030),
  trimestre: z.number().min(1).max(4),
  estado: z.enum(['borrador', 'presentado', 'rectificativa']).optional(),
  
  // Ventas exentas
  ventasExentas: z.number().optional(),
  
  // IVA Repercutido
  ventasGravadas21: z.number().optional(),
  ivaRepercutido21: z.number().optional(),
  ventasGravadas10: z.number().optional(),
  ivaRepercutido10: z.number().optional(),
  ventasGravadas4: z.number().optional(),
  ivaRepercutido4: z.number().optional(),
  
  // IVA Soportado  
  comprasGravadas21: z.number().optional(),
  ivaSoportado21: z.number().optional(),
  comprasGravadas10: z.number().optional(),
  ivaSoportado10: z.number().optional(),
  comprasGravadas4: z.number().optional(),
  ivaSoportado4: z.number().optional(),
  
  // Otros campos
  compensacionesAnterior: z.number().optional(),
  observaciones: z.string().optional(),
  fechaPresentacion: z.string().optional()
});

export async function GET(request: Request) {
  try {
    // Check authentication
    const auth = await checkAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({
        success: false,
        error: auth.error
      }, { status: 401 });
    }

    const modelos = await getModelos303();

    return NextResponse.json({
      success: true,
      modelos,
      metadata: {
        count: modelos.length,
        timestamp: getNormalizedTimestamp()
      }
    });
  } catch (error) {
    console.error('Error getting modelos 303:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al obtener los modelos 303',
      timestamp: getNormalizedTimestamp()
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const auth = await checkAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({
        success: false,
        error: auth.error
      }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate the request data
    const validationResult = Modelo303Schema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Datos del modelo 303 inválidos',
        details: validationResult.error.flatten()
      }, { status: 400 });
    }

    const modeloData = validationResult.data;
    
    // Calcular totales automáticamente
    const totalIvaRepercutido = (modeloData.ivaRepercutido21 || 0) + 
                               (modeloData.ivaRepercutido10 || 0) + 
                               (modeloData.ivaRepercutido4 || 0);
    
    const totalIvaSoportado = (modeloData.ivaSoportado21 || 0) + 
                             (modeloData.ivaSoportado10 || 0) + 
                             (modeloData.ivaSoportado4 || 0);
    
    const diferenciaIva = totalIvaRepercutido - totalIvaSoportado;
    const resultadoLiquidacion = diferenciaIva - (modeloData.compensacionesAnterior || 0);

    const nuevoModelo = await createModelo303({
      ...modeloData,
      estado: modeloData.estado || 'borrador',
      ventasExentas: modeloData.ventasExentas || 0,
      ventasGravadas21: modeloData.ventasGravadas21 || 0,
      ivaRepercutido21: modeloData.ivaRepercutido21 || 0,
      ventasGravadas10: modeloData.ventasGravadas10 || 0,
      ivaRepercutido10: modeloData.ivaRepercutido10 || 0,
      ventasGravadas4: modeloData.ventasGravadas4 || 0,
      ivaRepercutido4: modeloData.ivaRepercutido4 || 0,
      totalIvaRepercutido,
      comprasGravadas21: modeloData.comprasGravadas21 || 0,
      ivaSoportado21: modeloData.ivaSoportado21 || 0,
      comprasGravadas10: modeloData.comprasGravadas10 || 0,
      ivaSoportado10: modeloData.ivaSoportado10 || 0,
      comprasGravadas4: modeloData.comprasGravadas4 || 0,
      ivaSoportado4: modeloData.ivaSoportado4 || 0,
      totalIvaSoportado,
      diferenciaIva,
      compensacionesAnterior: modeloData.compensacionesAnterior || 0,
      resultadoLiquidacion,
      observaciones: modeloData.observaciones || '',
      fechaPresentacion: modeloData.fechaPresentacion || ''
    });

    return NextResponse.json({
      success: true,
      modelo: nuevoModelo,
      timestamp: getNormalizedTimestamp()
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating modelo 303:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al crear el modelo 303',
      timestamp: getNormalizedTimestamp()
    }, { status: 500 });
  }
} 