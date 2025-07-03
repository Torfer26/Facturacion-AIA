import Airtable from 'airtable';

interface SimpleBackup {
  timestamp: string;
  tablas: Record<string, any[]>;
  total_registros: number;
}

/**
 * Sistema simple de backup para desarrollo local
 */
export class BackupLocal {
  private airtable: Airtable;
  private baseId: string;

  constructor() {
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      throw new Error('Faltan variables de Airtable para backup');
    }

    this.airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY });
    this.baseId = process.env.AIRTABLE_BASE_ID;
  }

  /**
   * Exporta una tabla específica
   */
  async exportarTabla(nombreTabla: string): Promise<any[]> {
    console.log(`[BACKUP LOCAL] Exportando: ${nombreTabla}`);
    const base = this.airtable.base(this.baseId);
    const registros: any[] = [];

    try {
      await base(nombreTabla).select().eachPage((records, fetchNextPage) => {
        records.forEach(record => {
          registros.push({
            id: record.id,
            campos: record.fields,
            fecha_creacion: record.get('createdTime') || new Date().toISOString()
          });
        });
        fetchNextPage();
      });

      console.log(`[BACKUP LOCAL] ${nombreTabla}: ${registros.length} registros`);
      return registros;
    } catch (error) {
      console.error(`[BACKUP LOCAL] Error en ${nombreTabla}:`, error);
      return [];
    }
  }

  /**
   * Crea backup completo
   */
  async crearBackup(): Promise<SimpleBackup> {
    console.log('[BACKUP LOCAL] Iniciando backup completo...');
    
    const tablasConfig = [
      'Usuarios',
      'Clientes',
      'Facturas Emitidas',
      'Facturas Recibidas',
      'Empresa'
    ];

    const backup: SimpleBackup = {
      timestamp: new Date().toISOString(),
      tablas: {},
      total_registros: 0
    };

    // Exportar cada tabla
    for (const tabla of tablasConfig) {
      const datos = await this.exportarTabla(tabla);
      backup.tablas[tabla] = datos;
      backup.total_registros += datos.length;
    }

    console.log(`[BACKUP LOCAL] Backup completado: ${backup.total_registros} registros total`);
    return backup;
  }

  /**
   * Guarda backup en archivo local
   */
  async guardarLocal(backup: SimpleBackup): Promise<string> {
    const fs = require('fs').promises;
    const path = require('path');

    // Crear directorio si no existe
    const backupDir = path.join(process.cwd(), 'backups-local');
    await fs.mkdir(backupDir, { recursive: true });

    // Generar nombre de archivo
    const fecha = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const hora = new Date().toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    const nombreArchivo = `backup-${fecha}-${hora}.json`;
    const rutaCompleta = path.join(backupDir, nombreArchivo);

    // Guardar archivo
    await fs.writeFile(rutaCompleta, JSON.stringify(backup, null, 2));
    
    console.log(`[BACKUP LOCAL] Guardado en: ${rutaCompleta}`);
    return rutaCompleta;
  }

  /**
   * Lista backups existentes
   */
  async listarBackups(): Promise<string[]> {
    const fs = require('fs').promises;
    const path = require('path');

    const backupDir = path.join(process.cwd(), 'backups-local');
    
    try {
      const archivos = await fs.readdir(backupDir);
      return archivos
        .filter(archivo => archivo.startsWith('backup-') && archivo.endsWith('.json'))
        .sort()
        .reverse(); // Más recientes primero
    } catch (error) {
      return [];
    }
  }
}

// Export singleton
export const backupLocal = new BackupLocal(); 