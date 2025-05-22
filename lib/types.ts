export interface Invoice {
  id: string
  invoiceNumber: string
  invoiceDate: string
  customerName: string
  supplierVatNumber: string
  supplierAddress: string
  totalPriceExVat: number
  totalPriceIncVat: number
  taxPercentage: number
  taxAmount: number
  supplierName: string
  invoiceDescription: string
  internalId: string | null
  driveUrl: string
  createdAt: string
  updatedAt: string
  paid?: boolean
}

export interface WebhookResponse {
  success: boolean
  message: string
  invoiceId?: string
  status?: 'processed' | 'error'
  data?: any
  extractedData?: any
}

export interface CreateIssuedInvoiceDTO {
  id: string;
  facturaID: string;
  creationDate: string;
  fechavencimiento: string;
  nombrecliente: string;
  cifcliente: string;
  direccioncliente: string;
  subtotal: number;
  total: number;
  tipoiva: number;
  productofactura?: Array<{ descripcion: string; cantidad: number; precioUnitario: number; }>;
  cantidadproducto: number;
  estadofactura: string;
  datosbancarios: string;
} 