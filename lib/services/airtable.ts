import { Invoice } from '@/lib/types'

// Helper function to normalize dates that might have incorrect years
function normalizeDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    // If the date is in the future and beyond 1 year from now, adjust it to current year
    if (date.getFullYear() > new Date().getFullYear() + 1) {
      date.setFullYear(new Date().getFullYear()); // Set to current year
      return date.toISOString();
    }
    return dateString;
  } catch (e) {
    return dateString;
  }
}

// Verificar que todas las variables de entorno necesarias estén definidas
const requiredEnvVars = {
  AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
  AIRTABLE_API_URL: process.env.AIRTABLE_API_URL || 'https://api.airtable.com/v0'
}

// Verificar que todas las variables de entorno necesarias estén definidas
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
})

const AIRTABLE_API_KEY = requiredEnvVars.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = requiredEnvVars.AIRTABLE_BASE_ID
const AIRTABLE_API_URL = requiredEnvVars.AIRTABLE_API_URL
const AIRTABLE_TABLE_NAME_RECIBIDAS = process.env.AIRTABLE_TABLE_NAME_RECIBIDAS;

export async function getInvoices(): Promise<Invoice[]> {
  try {
    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME_RECIBIDAS}`
    const headers = {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    }

    const response = await fetch(url, {
      headers,
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Error en la API de Airtable: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    
    if (!data.records || !Array.isArray(data.records)) {
      throw new Error('Respuesta inválida de Airtable: no se encontraron registros')
    }

    const invoices = data.records.map((record: any) => {
      try {
        const invoice: Invoice = {
          id: record.id,
          invoiceDate: normalizeDate(record.fields.InvoiceDate || ''),
          invoiceNumber: record.fields.InvoiceNumber?.toString() || '',
          customerName: record.fields['Customer Name'] || '',
          supplierVatNumber: record.fields['Supplier VAT Identification Number'] || '',
          supplierAddress: record.fields['Supplier Address'] || '',
          totalPriceExVat: parseFloat(record.fields['Total Price excluding VAT']?.toString() || '0'),
          totalPriceIncVat: parseFloat(record.fields['Total Price including VAT']?.toString() || '0'),
          taxPercentage: parseFloat(record.fields['Tax percentage']?.toString() || '0'),
          taxAmount: parseFloat(record.fields['Tax amount']?.toString() || '0'),
          supplierName: record.fields['Supplier name'] || '',
          invoiceDescription: record.fields['Invoice description'] || '',
          internalId: record.fields['InternalID'] || null,
          driveUrl: record.fields['URL Google Drive'] || '',
          createdAt: normalizeDate(record.createdTime),
          updatedAt: normalizeDate(record.createdTime)
        }

        return invoice
      } catch (err) {
        throw err
      }
    })

    return invoices
  } catch (error) {
    throw error
  }
} 