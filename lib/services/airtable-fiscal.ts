import { Modelo303, Modelo111, VencimientoFiscal, ConfiguracionFiscal } from '@/lib/types/fiscal'
import Airtable from 'airtable'

// Helper function to normalize dates
function normalizeDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
}

// Verificar que todas las variables de entorno necesarias estén definidas
const requiredEnvVars = {
  AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
  AIRTABLE_API_URL: process.env.AIRTABLE_API_URL || 'https://api.airtable.com/v0'
}

// Verificar variables de entorno
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
})

const AIRTABLE_API_KEY = requiredEnvVars.AIRTABLE_API_KEY!
const AIRTABLE_BASE_ID = requiredEnvVars.AIRTABLE_BASE_ID!

// Configurar Airtable
const airtable = new Airtable({ apiKey: AIRTABLE_API_KEY })
const base = airtable.base(AIRTABLE_BASE_ID)

// Nombres de las tablas fiscales (configurables via env vars)
const TABLA_MODELO303 = process.env.AIRTABLE_TABLE_MODELO303 || 'Modelo303'
const TABLA_MODELO111 = process.env.AIRTABLE_TABLE_MODELO111 || 'Modelo111'
const TABLA_VENCIMIENTOS = process.env.AIRTABLE_TABLE_VENCIMIENTOS || 'VencimientosFiscales'
const TABLA_CONFIGURACION = process.env.AIRTABLE_TABLE_CONFIGURACION || 'ConfiguracionFiscal'

// ==================== MODELO 303 (IVA) ====================
export async function getModelos303(): Promise<Modelo303[]> {
  try {
    const records = await base(TABLA_MODELO303).select().all()
    
    return records.map((record: any) => ({
      id: record.id,
      ejercicio: parseInt(record.fields.Ejercicio) || new Date().getFullYear(),
      trimestre: (record.fields.Trimestre || 1) as 1 | 2 | 3 | 4,
      fechaPresentacion: record.fields.FechaPresentacion || '',
      estado: record.fields.Estado || 'borrador',
      
      // Ventas exentas
      ventasExentas: parseFloat(record.fields.VentasExentas) || 0,
      
      // IVA Repercutido
      ventasGravadas21: parseFloat(record.fields.VentasGravadas21) || 0,
      ivaRepercutido21: parseFloat(record.fields.IvaRepercutido21) || 0,
      ventasGravadas10: parseFloat(record.fields.VentasGravadas10) || 0,
      ivaRepercutido10: parseFloat(record.fields.IvaRepercutido10) || 0,
      ventasGravadas4: parseFloat(record.fields.VentasGravadas4) || 0,
      ivaRepercutido4: parseFloat(record.fields.IvaRepercutido4) || 0,
      totalIvaRepercutido: parseFloat(record.fields.TotalIvaRepercutido) || 0,
      
      // IVA Soportado
      comprasGravadas21: parseFloat(record.fields.ComprasGravadas21) || 0,
      ivaSoportado21: parseFloat(record.fields.IvaSoportado21) || 0,
      comprasGravadas10: parseFloat(record.fields.ComprasGravadas10) || 0,
      ivaSoportado10: parseFloat(record.fields.IvaSoportado10) || 0,
      comprasGravadas4: parseFloat(record.fields.ComprasGravadas4) || 0,
      ivaSoportado4: parseFloat(record.fields.IvaSoportado4) || 0,
      totalIvaSoportado: parseFloat(record.fields.TotalIvaSoportado) || 0,
      
      // Resultado
      diferenciaIva: parseFloat(record.fields.DiferenciaIva) || 0,
      compensacionesAnterior: parseFloat(record.fields.CompensacionesAnterior) || 0,
      resultadoLiquidacion: parseFloat(record.fields.ResultadoLiquidacion) || 0,
      
      observaciones: record.fields.Observaciones || '',
      createdAt: normalizeDate(record.createdTime),
      updatedAt: normalizeDate(record.createdTime)
    }))
  } catch (error) {
    console.error('Error fetching Modelo 303:', error)
    return []
  }
}

export async function createModelo303(modelo: Omit<Modelo303, 'id' | 'createdAt' | 'updatedAt'>): Promise<Modelo303> {
  const record = await base(TABLA_MODELO303).create({
    Ejercicio: modelo.ejercicio,
    Trimestre: modelo.trimestre,
    Estado: modelo.estado,
    VentasExentas: modelo.ventasExentas,
    VentasGravadas21: modelo.ventasGravadas21,
    IvaRepercutido21: modelo.ivaRepercutido21,
    VentasGravadas10: modelo.ventasGravadas10,
    IvaRepercutido10: modelo.ivaRepercutido10,
    VentasGravadas4: modelo.ventasGravadas4,
    IvaRepercutido4: modelo.ivaRepercutido4,
    TotalIvaRepercutido: modelo.totalIvaRepercutido,
    ComprasGravadas21: modelo.comprasGravadas21,
    IvaSoportado21: modelo.ivaSoportado21,
    ComprasGravadas10: modelo.comprasGravadas10,
    IvaSoportado10: modelo.ivaSoportado10,
    ComprasGravadas4: modelo.comprasGravadas4,
    IvaSoportado4: modelo.ivaSoportado4,
    TotalIvaSoportado: modelo.totalIvaSoportado,
    DiferenciaIva: modelo.diferenciaIva,
    CompensacionesAnterior: modelo.compensacionesAnterior,
    ResultadoLiquidacion: modelo.resultadoLiquidacion,
    Observaciones: modelo.observaciones,
    FechaPresentacion: modelo.fechaPresentacion
  })
  
  return {
    id: record.id,
    ...modelo,
    createdAt: normalizeDate(record.createdTime),
    updatedAt: normalizeDate(record.createdTime)
  }
}

// ==================== MODELO 111 (RETENCIONES) ====================
export async function getModelos111(): Promise<Modelo111[]> {
  try {
    const records = await base(TABLA_MODELO111).select().all()
    
    return records.map((record: any) => ({
      id: record.id,
      ejercicio: parseInt(record.fields.Ejercicio) || new Date().getFullYear(),
      trimestre: (record.fields.Trimestre || 1) as 1 | 2 | 3 | 4,
      fechaPresentacion: record.fields.FechaPresentacion || '',
      estado: record.fields.Estado || 'borrador',
      
      // Rendimientos del trabajo
      numeroPerceptoresTrabajo: parseInt(record.fields.NumeroPerceptoresTrabajo) || 0,
      importeRetribucionesTrabajo: parseFloat(record.fields.ImporteRetribucionesTrabajo) || 0,
      retencionesIngresadasTrabajo: parseFloat(record.fields.RetencionesIngresadasTrabajo) || 0,
      
      // Rendimientos profesionales
      numeroPerceptoresProfesional: parseInt(record.fields.NumeroPerceptoresProfesional) || 0,
      importeRetribucionesProfesional: parseFloat(record.fields.ImporteRetribucionesProfesional) || 0,
      retencionesIngresadasProfesional: parseFloat(record.fields.RetencionesIngresadasProfesional) || 0,
      
      // Premios
      numeroPerceptoresPremios: parseInt(record.fields.NumeroPerceptoresPremios) || 0,
      importePremios: parseFloat(record.fields.ImportePremios) || 0,
      retencionesIngresadasPremios: parseFloat(record.fields.RetencionesIngresadasPremios) || 0,
      
      // Totales
      totalRetenciones: parseFloat(record.fields.TotalRetenciones) || 0,
      totalAIngresar: parseFloat(record.fields.TotalAIngresar) || 0,
      
      observaciones: record.fields.Observaciones || '',
      createdAt: normalizeDate(record.createdTime),
      updatedAt: normalizeDate(record.createdTime)
    }))
  } catch (error) {
    console.error('Error fetching Modelo 111:', error)
    return []
  }
}

export async function createModelo111(modelo: Omit<Modelo111, 'id' | 'createdAt' | 'updatedAt'>): Promise<Modelo111> {
  const record = await base(TABLA_MODELO111).create({
    Ejercicio: modelo.ejercicio,
    Trimestre: modelo.trimestre,
    Estado: modelo.estado,
    NumeroPerceptoresTrabajo: modelo.numeroPerceptoresTrabajo,
    ImporteRetribucionesTrabajo: modelo.importeRetribucionesTrabajo,
    RetencionesIngresadasTrabajo: modelo.retencionesIngresadasTrabajo,
    NumeroPerceptoresProfesional: modelo.numeroPerceptoresProfesional,
    ImporteRetribucionesProfesional: modelo.importeRetribucionesProfesional,
    RetencionesIngresadasProfesional: modelo.retencionesIngresadasProfesional,
    NumeroPerceptoresPremios: modelo.numeroPerceptoresPremios,
    ImportePremios: modelo.importePremios,
    RetencionesIngresadasPremios: modelo.retencionesIngresadasPremios,
    TotalRetenciones: modelo.totalRetenciones,
    TotalAIngresar: modelo.totalAIngresar,
    Observaciones: modelo.observaciones,
    FechaPresentacion: modelo.fechaPresentacion
  })
  
  return {
    id: record.id,
    ...modelo,
    createdAt: normalizeDate(record.createdTime),
    updatedAt: normalizeDate(record.createdTime)
  }
}

// ==================== VENCIMIENTOS FISCALES ====================
export async function getVencimientosFiscales(): Promise<VencimientoFiscal[]> {
  try {
    const records = await base(TABLA_VENCIMIENTOS).select().all()
    
    return records.map((record: any) => ({
      id: record.id,
      modelo: record.fields.Modelo || '',
      descripcion: record.fields.Descripcion || '',
      fechaVencimiento: record.fields.FechaVencimiento || '',
      periodo: record.fields.Periodo || '',
      estado: record.fields.Estado || 'pendiente',
      importe: parseFloat(record.fields.Importe) || undefined,
      observaciones: record.fields.Observaciones || '',
      createdAt: normalizeDate(record.createdTime),
      updatedAt: normalizeDate(record.createdTime)
    }))
  } catch (error) {
    console.error('Error fetching vencimientos fiscales:', error)
    return []
  }
}

// ==================== CONFIGURACIÓN FISCAL ====================
export async function getConfiguracionFiscal(): Promise<ConfiguracionFiscal | null> {
  try {
    const records = await base(TABLA_CONFIGURACION).select().all()
    
    if (records.length === 0) {
      return null
    }
    
    const record = records[0] // Asumimos que solo hay una configuración
    
    return {
      id: record.id,
      cif: record.fields.CIF || '',
      razonSocial: record.fields.RazonSocial || '',
      periodoLiquidacion: record.fields.PeriodoLiquidacion || 'trimestral',
      regmenEspecial: record.fields.RegimenEspecial || '',
      tipoSociedad: record.fields.TipoSociedad || 'limitada',
      ejercicioFiscal: {
        inicio: record.fields.EjercicioInicio || '01-01',
        fin: record.fields.EjercicioFin || '31-12'
      },
      codigoActividad: record.fields.CodigoActividad || '',
      epigrafeIAE: record.fields.EpigrafeIAE || '',
      createdAt: normalizeDate(record.createdTime),
      updatedAt: normalizeDate(record.createdTime)
    }
  } catch (error) {
    console.error('Error fetching configuración fiscal:', error)
    return null
  }
} 