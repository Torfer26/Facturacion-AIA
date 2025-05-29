import { NextResponse } from 'next/server'
import { getModelos303, getModelos111, getVencimientosFiscales, getConfiguracionFiscal } from '@/lib/services/airtable-fiscal'
import { verifyToken } from '@/lib/auth'
import { verifyToken as verifyJWT } from '@/lib/auth-v2/jwt'
import { MetricasFiscales } from '@/lib/types/fiscal'

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
      .filter(m => m.estado !== 'pagado' && m.resultadoLiquidacion > 0)
      .reduce((sum, m) => sum + m.resultadoLiquidacion, 0);
    
    // IVA a devolver (suma de resultados negativos)
    const ivaADevolver = Math.abs(modelos303Actuales
      .filter(m => m.resultadoLiquidacion < 0)
      .reduce((sum, m) => sum + m.resultadoLiquidacion, 0));

    // Calcular métricas de retenciones
    const modelos111Actuales = modelos111.filter(m => m.ejercicio === ejercicioActual);
    const retencionesAPagar = modelos111Actuales
      .filter(m => m.estado !== 'pagado')
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

    return NextResponse.json({
      success: true,
      metricas,
      detalles: {
        modelos303Count: modelos303.length,
        modelos111Count: modelos111.length,
        vencimientosCount: vencimientos.length,
        configuracionExiste: !!configuracion,
        ejercicioActual
      },
      timestamp: getNormalizedTimestamp()
    });
    
  } catch (error) {
    console.error('Error getting métricas fiscales:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al obtener las métricas fiscales',
      timestamp: getNormalizedTimestamp()
    }, { status: 500 });
  }
} 