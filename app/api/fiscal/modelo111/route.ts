import { NextResponse } from 'next/server'
import { getModelos111, createModelo111 } from '@/lib/services/airtable-fiscal'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'
import { 
  getNormalizedTimestamp, 
  createAuthErrorResponse,
  createServerErrorResponse,
  createSuccessResponse,
  checkAuth
} from '@/lib/utils/api-helpers'

// Schema de validación para crear un modelo 111
const Modelo111Schema = z.object({
  ejercicio: z.number().min(2020).max(2030),
  trimestre: z.number().min(1).max(4),
  estado: z.enum(['borrador', 'presentado', 'rectificativa']).optional(),
  
  // Rendimientos del trabajo
  numeroPerceptoresTrabajo: z.number().optional(),
  importeRetribucionesTrabajo: z.number().optional(),
  retencionesIngresadasTrabajo: z.number().optional(),
  
  // Rendimientos profesionales
  numeroPerceptoresProfesional: z.number().optional(),
  importeRetribucionesProfesional: z.number().optional(),
  retencionesIngresadasProfesional: z.number().optional(),
  
  // Premios
  numeroPerceptoresPremios: z.number().optional(),
  importePremios: z.number().optional(),
  retencionesIngresadasPremios: z.number().optional(),
  
  observaciones: z.string().optional(),
  fechaPresentacion: z.string().optional()
});

export async function GET(request: Request) {
  try {
    // Check authentication
    const auth = await checkAuth(request);
    if (!auth.authenticated) {
      return createAuthErrorResponse(auth.error);
    }

    const modelos = await getModelos111();

    return createSuccessResponse(
      { modelos },
      { count: modelos.length }
    );
  } catch (error) {
    console.error('Error getting modelos 111:', error);
    return createServerErrorResponse(
      error instanceof Error ? error.message : 'Error desconocido al obtener los modelos 111'
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const auth = await checkAuth(request);
    if (!auth.authenticated) {
      return createAuthErrorResponse(auth.error);
    }

    const data = await request.json();
    
    // Validate the request data
    const validationResult = Modelo111Schema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Datos del modelo 111 inválidos',
        details: validationResult.error.flatten()
      }, { status: 400 });
    }

    const modeloData = validationResult.data;
    
    // Calcular totales automáticamente
    const totalRetenciones = (modeloData.retencionesIngresadasTrabajo || 0) + 
                            (modeloData.retencionesIngresadasProfesional || 0) + 
                            (modeloData.retencionesIngresadasPremios || 0);

    const nuevoModelo = await createModelo111({
      ...modeloData,
      trimestre: modeloData.trimestre as 1 | 2 | 3 | 4,
      estado: modeloData.estado || 'borrador',
      numeroPerceptoresTrabajo: modeloData.numeroPerceptoresTrabajo || 0,
      importeRetribucionesTrabajo: modeloData.importeRetribucionesTrabajo || 0,
      retencionesIngresadasTrabajo: modeloData.retencionesIngresadasTrabajo || 0,
      numeroPerceptoresProfesional: modeloData.numeroPerceptoresProfesional || 0,
      importeRetribucionesProfesional: modeloData.importeRetribucionesProfesional || 0,
      retencionesIngresadasProfesional: modeloData.retencionesIngresadasProfesional || 0,
      numeroPerceptoresPremios: modeloData.numeroPerceptoresPremios || 0,
      importePremios: modeloData.importePremios || 0,
      retencionesIngresadasPremios: modeloData.retencionesIngresadasPremios || 0,
      totalRetenciones,
      totalAIngresar: totalRetenciones, // En principio es lo mismo, pero puede haber ajustes
      observaciones: modeloData.observaciones || '',
      fechaPresentacion: modeloData.fechaPresentacion || ''
    });

    return NextResponse.json({
      success: true,
      modelo: nuevoModelo,
      timestamp: getNormalizedTimestamp()
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating modelo 111:', error);
    return createServerErrorResponse(
      error instanceof Error ? error.message : 'Error desconocido al crear el modelo 111'
    );
  }
} 