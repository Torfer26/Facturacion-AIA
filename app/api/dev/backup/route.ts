import { NextRequest, NextResponse } from 'next/server';
import { backupLocal } from '@/lib/local/backup-simple';

/**
 * API para backup en desarrollo local
 */

// GET: Listar backups existentes
export async function GET() {
  try {
    const backups = await backupLocal.listarBackups();
    
    return NextResponse.json({
      success: true,
      message: `${backups.length} backups encontrados`,
      backups,
      ruta: './backups-local/'
    });
    
  } catch (error) {
    console.error('[BACKUP API] Error listando:', error);
    return NextResponse.json({
      success: false,
      error: 'Error obteniendo lista de backups'
    }, { status: 500 });
  }
}

// POST: Crear nuevo backup
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json().catch(() => ({ action: 'create' }));

    if (action === 'create') {
      console.log('[BACKUP API] Creando backup de desarrollo...');
      
      // Crear backup
      const backup = await backupLocal.crearBackup();
      
      // Guardar localmente
      const rutaArchivo = await backupLocal.guardarLocal(backup);
      
      return NextResponse.json({
        success: true,
        message: 'Backup creado exitosamente',
        datos: {
          archivo: rutaArchivo,
          timestamp: backup.timestamp,
          total_registros: backup.total_registros,
          tablas: Object.keys(backup.tablas).map(tabla => ({
            nombre: tabla,
            registros: backup.tablas[tabla].length
          }))
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Acción no válida. Usa: {"action": "create"}'
    }, { status: 400 });

  } catch (error) {
    console.error('[BACKUP API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Error creando backup: ' + (error as Error).message
    }, { status: 500 });
  }
} 