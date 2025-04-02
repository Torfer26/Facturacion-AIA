import {
  Factura,
  Cliente,
  Proveedor,
  ObligacionFiscal,
  User,
  Empresa,
  TipoFactura,
  EstadoFactura,
  TipoObligacion,
  EstadoObligacion,
  Role
} from '@prisma/client';

// Re-exportar los tipos de Prisma para usar en la aplicación
export type {
  Factura,
  Cliente,
  Proveedor,
  ObligacionFiscal,
  User,
  Empresa,
  TipoFactura,
  EstadoFactura,
  TipoObligacion,
  EstadoObligacion,
  Role
};

// Tipos extendidos

export interface FacturaConRelaciones extends Factura {
  cliente?: Cliente;
  proveedor?: Proveedor;
}

export interface UserWithEmpresa extends User {
  empresa: Empresa;
}

export interface DashboardStats {
  totalFacturasEmitidas: number;
  totalFacturasRecibidas: number;
  importeFacturasEmitidas: number;
  importeFacturasRecibidas: number;
  obligacionesPendientes: number;
  obligacionesProximas: ObligacionFiscal[];
  ultimasFacturas: FacturaConRelaciones[];
}

export interface WebhookResponse {
  invoiceId: string;
  status: 'processed' | 'failed';
  extractedData: Record<string, any>;
  confidence: number;
  processingTime: number;
  errors: string[];
}

export interface FileUploadResponse {
  success: boolean;
  fileId?: string;
  fileUrl?: string;
  error?: string;
}

export interface Invoice {
  id: string
  invoiceDate: string
  invoiceNumber: string
  customerName: string
  supplierVatNumber: string
  supplierAddress: string
  totalPriceExVat: number
  totalPriceIncVat: number
  taxPercentage: number
  taxAmount: number
  supplierName: string
  invoiceDescription: string
  internalId?: number | null
  driveUrl?: string
  createdAt: Date
  updatedAt: Date
} 