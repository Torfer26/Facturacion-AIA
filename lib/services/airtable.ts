import { Invoice } from '@/lib/types'

// Verificar que todas las variables de entorno necesarias estén definidas
const requiredEnvVars = {
  AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
  AIRTABLE_TABLE_NAME: process.env.AIRTABLE_TABLE_NAME,
  AIRTABLE_API_URL: process.env.AIRTABLE_API_URL || 'https://api.airtable.com/v0'
}

// Verificar que todas las variables de entorno necesarias estén definidas
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    console.error(`Missing environment variable: ${key}. Available env vars:`, process.env)
    throw new Error(`Missing required environment variable: ${key}`)
  }
})

const AIRTABLE_API_KEY = requiredEnvVars.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = requiredEnvVars.AIRTABLE_BASE_ID
const AIRTABLE_TABLE_NAME = requiredEnvVars.AIRTABLE_TABLE_NAME
const AIRTABLE_API_URL = requiredEnvVars.AIRTABLE_API_URL

export async function getInvoices(): Promise<Invoice[]> {
  try {
    console.log('Airtable Service: Starting request with config:', {
      baseId: AIRTABLE_BASE_ID,
      tableName: AIRTABLE_TABLE_NAME,
      apiUrl: AIRTABLE_API_URL,
      hasApiKey: !!AIRTABLE_API_KEY,
      envVars: process.env
    })

    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`
    console.log('Airtable Service: Request URL:', url)

    const headers = {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    }

    console.log('Airtable Service: Making request with headers:', {
      ...headers,
      'Authorization': headers.Authorization ? 'Bearer [REDACTED]' : undefined
    })

    const response = await fetch(url, {
      headers,
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Airtable Service: API error response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: response.url
      })
      throw new Error(`Error en la API de Airtable: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Airtable Service: Received data:', {
      hasRecords: !!data.records,
      recordCount: data.records?.length,
      firstRecord: data.records?.[0] ? {
        id: data.records[0].id,
        fields: Object.keys(data.records[0].fields)
      } : null
    })
    
    if (!data.records || !Array.isArray(data.records)) {
      console.error('Airtable Service: Invalid response structure:', data)
      throw new Error('Respuesta inválida de Airtable: no se encontraron registros')
    }

    const invoices = data.records.map((record: any) => {
      try {
        console.log('Airtable Service: Processing record:', {
          id: record.id,
          availableFields: Object.keys(record.fields)
        })

        const invoice: Invoice = {
          id: record.id,
          invoiceDate: record.fields.InvoiceDate || '',
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
          createdAt: new Date(record.createdTime),
          updatedAt: new Date(record.createdTime)
        }

        console.log('Airtable Service: Successfully processed record:', {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          customerName: invoice.customerName
        })

        return invoice
      } catch (err) {
        console.error('Airtable Service: Error processing record:', {
          recordId: record.id,
          error: err instanceof Error ? err.message : 'Error desconocido',
          fields: record.fields
        })
        throw err
      }
    })

    console.log('Airtable Service: Successfully processed all records:', {
      totalInvoices: invoices.length
    })

    return invoices
  } catch (error) {
    console.error('Airtable Service: Fatal error:', error)
    throw error
  }
} 