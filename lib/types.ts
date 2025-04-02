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
  createdAt: Date
  updatedAt: Date
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