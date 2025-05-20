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

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  OTHER = 'OTHER'
}

export * from './issuedInvoice';
export * from './receivedInvoice'; 