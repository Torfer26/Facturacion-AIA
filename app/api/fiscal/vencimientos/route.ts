import { NextResponse } from 'next/server'
import { getVencimientosFiscales } from '@/lib/services/airtable-fiscal'
import { verifyToken } from '@/lib/auth'


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
      const jwtUser = await verifyToken(token);
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

    const vencimientos = await getVencimientosFiscales();

    // Filtrar por fecha si se proporciona el parámetro
    const url = new URL(request.url);
    const proximosOnly = url.searchParams.get('proximos');
    const diasLimite = parseInt(url.searchParams.get('dias') || '30');

    let vencimientosFiltrados = vencimientos;

    if (proximosOnly === 'true') {
      const hoy = new Date();
      const fechaLimite = new Date(hoy.getTime() + (diasLimite * 24 * 60 * 60 * 1000));
      
      vencimientosFiltrados = vencimientos.filter(v => {
        const fechaVencimiento = new Date(v.fechaVencimiento);
        return fechaVencimiento >= hoy && fechaVencimiento <= fechaLimite;
      });
    }

    return NextResponse.json({
      success: true,
      vencimientos: vencimientosFiltrados,
      metadata: {
        count: vencimientosFiltrados.length,
        totalCount: vencimientos.length,
        timestamp: getNormalizedTimestamp()
      }
    });
  } catch (error) {
    console.error('Error getting vencimientos fiscales:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al obtener los vencimientos fiscales',
      timestamp: getNormalizedTimestamp()
    }, { status: 500 });
  }
} 