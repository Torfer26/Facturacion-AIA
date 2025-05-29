// Tipos base para el sistema fiscal

export interface VencimientoFiscal {
  id: string;
  modelo: string;
  descripcion: string;
  fechaVencimiento: string;
  periodo: string; // "2024-T1", "2024-01", etc.
  estado: 'pendiente' | 'presentado' | 'pagado';
  importe?: number;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
}

// Modelo 303 - IVA Trimestral
export interface Modelo303 {
  id: string;
  ejercicio: number;
  trimestre: 1 | 2 | 3 | 4;
  fechaPresentacion?: string;
  estado: 'borrador' | 'presentado' | 'rectificativa';
  
  // Casillas del modelo
  // IVA Devengado
  ventasExentas: number; // [01]
  ventasGravadas21: number; // [03]
  ivaRepercutido21: number; // [04]
  ventasGravadas10: number; // [05]
  ivaRepercutido10: number; // [06]
  ventasGravadas4: number; // [07]
  ivaRepercutido4: number; // [08]
  totalIvaRepercutido: number; // [12]
  
  // IVA Deducible
  comprasGravadas21: number; // [13]
  ivaSoportado21: number; // [14]
  comprasGravadas10: number; // [15]
  ivaSoportado10: number; // [16]
  comprasGravadas4: number; // [17]
  ivaSoportado4: number; // [18]
  totalIvaSoportado: number; // [22]
  
  // Resultado
  diferenciaIva: number; // [26] = [12] - [22]
  compensacionesAnterior: number; // [27]
  resultadoLiquidacion: number; // [28]
  
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
}

// Modelo 111 - Retenciones Trimestrales
export interface Modelo111 {
  id: string;
  ejercicio: number;
  trimestre: 1 | 2 | 3 | 4;
  fechaPresentacion?: string;
  estado: 'borrador' | 'presentado' | 'rectificativa';
  
  // Rendimientos del trabajo
  numeroPerceptoresTrabajo: number; // [01]
  importeRetribucionesTrabajo: number; // [02]
  retencionesIngresadasTrabajo: number; // [03]
  
  // Rendimientos profesionales
  numeroPerceptoresProfesional: number; // [04]
  importeRetribucionesProfesional: number; // [05]
  retencionesIngresadasProfesional: number; // [06]
  
  // Premios
  numeroPerceptoresPremios: number; // [07]
  importePremios: number; // [08]
  retencionesIngresadasPremios: number; // [09]
  
  // Total a ingresar
  totalRetenciones: number; // [19]
  totalAIngresar: number; // [20]
  
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
}

// Impuesto de Sociedades - Información básica
export interface ImpuestoSociedades {
  id: string;
  ejercicio: number;
  fechaPresentacion?: string;
  estado: 'borrador' | 'presentado';
  
  // Datos básicos
  ingresosBrutos: number;
  gastosDeducibles: number;
  resultadoContable: number;
  baseLiquidable: number;
  cuotaIntegra: number;
  retenciones: number;
  cuotaDiferencial: number;
  
  // Pagos fraccionados
  pagoFraccionado1T: number;
  pagoFraccionado2T: number;
  pagoFraccionado3T: number;
  totalPagosFraccionados: number;
  
  // Resultado final
  importeAIngresar: number;
  importeADevolver: number;
  
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
}

// Dashboard fiscal - métricas
export interface MetricasFiscales {
  ivaAPagar: number;
  ivaADevolver: number;
  retencionesAPagar: number;
  proximosVencimientos: VencimientoFiscal[];
  totalObligacionesPendientes: number;
  totalObligacionesVencidas: number;
  ultimaActualizacion: string;
}

// Configuración fiscal de la empresa
export interface ConfiguracionFiscal {
  id: string;
  cif: string;
  razonSocial: string;
  periodoLiquidacion: 'mensual' | 'trimestral';
  regmenEspecial?: string;
  tipoSociedad: 'anonima' | 'limitada' | 'cooperativa' | 'otros';
  ejercicioFiscal: {
    inicio: string; // "01-01"
    fin: string; // "31-12"
  };
  codigoActividad: string;
  epigrafeIAE: string;
  createdAt: string;
  updatedAt: string;
} 