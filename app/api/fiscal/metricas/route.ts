import { NextResponse } from 'next/server'
import { getModelos303, getModelos111, getVencimientosFiscales, getConfiguracionFiscal } from '@/lib/services/airtable-fiscal'
import { verifyToken } from '@/lib/auth'
import { MetricasFiscales } from '@/lib/types/fiscal'
import { 
  getNormalizedTimestamp, 
  validateAirtableEnv, 
  createAuthErrorResponse,
  createServerErrorResponse,
  createSuccessResponse,
  checkAuth
} from '@/lib/utils/api-helpers'



export async function GET(request: Request) {
  try {
    // Check authentication
    const auth = await checkAuth(request);
    if (!auth.authenticated) {
      return createAuthErrorResponse(auth.error);
    }

    // Obtener todos los datos en paralelo
    const [modelos303, modelos111, vencimientos, configuracion] = await Promise.all([
      getModelos303(),
      getModelos111(), 
      getVencimientosFiscales(),
      getConfiguracionFiscal()
    ]);

    // Calcular métricas de IVA
    const ejercicioActual = new Date().getFullYear();
    const modelos303Actuales = modelos303.filter(m => m.ejercicio === ejercicioActual);
    
    // IVA a pagar (suma de resultados positivos pendientes)
    const ivaAPagar = modelos303Actuales
      .filter(m => m.estado !== 'presentado' && m.resultadoLiquidacion > 0)
      .reduce((sum, m) => sum + m.resultadoLiquidacion, 0);
    
    // IVA a devolver (suma de resultados negativos)
    const ivaADevolver = Math.abs(modelos303Actuales
      .filter(m => m.resultadoLiquidacion < 0)
      .reduce((sum, m) => sum + m.resultadoLiquidacion, 0));

    // Calcular métricas de retenciones
    const modelos111Actuales = modelos111.filter(m => m.ejercicio === ejercicioActual);
    const retencionesAPagar = modelos111Actuales
      .filter(m => m.estado !== 'presentado')
      .reduce((sum, m) => sum + m.totalAIngresar, 0);

    // Filtrar vencimientos próximos (30 días)
    const hoy = new Date();
    const fechaLimite = new Date(hoy.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    const proximosVencimientos = vencimientos.filter(v => {
      const fechaVencimiento = new Date(v.fechaVencimiento);
      return fechaVencimiento >= hoy && fechaVencimiento <= fechaLimite && v.estado === 'pendiente';
    }).sort((a, b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime());

    // Calcular obligaciones pendientes
    const totalObligacionesPendientes = vencimientos
      .filter(v => v.estado === 'pendiente' && v.importe)
      .reduce((sum, v) => sum + (v.importe || 0), 0);

    // Calcular obligaciones vencidas
    const totalObligacionesVencidas = vencimientos
      .filter(v => {
        const fechaVencimiento = new Date(v.fechaVencimiento);
        return fechaVencimiento < hoy && v.estado === 'pendiente' && v.importe;
      })
      .reduce((sum, v) => sum + (v.importe || 0), 0);

    const metricas: MetricasFiscales = {
      ivaAPagar,
      ivaADevolver,
      retencionesAPagar,
      proximosVencimientos,
      totalObligacionesPendientes,
      totalObligacionesVencidas,
      ultimaActualizacion: getNormalizedTimestamp()
    };

    return createSuccessResponse(
      { 
        metricas,
        detalles: {
          modelos303Count: modelos303.length,
          modelos111Count: modelos111.length,
          vencimientosCount: vencimientos.length,
          configuracionExiste: !!configuracion,
          ejercicioActual
        }
      }
    );
    
  } catch (error) {
    console.error('Error getting métricas fiscales:', error);
    return createServerErrorResponse(
      error instanceof Error ? error.message : 'Error desconocido al obtener las métricas fiscales'
    );
  }
} 