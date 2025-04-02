import { NextResponse } from 'next/server'
import { getInvoices } from '@/lib/services/airtable'

export async function GET() {
  try {
    console.log('API Route: Starting request for invoices')
    
    // Verificar que todas las variables de entorno necesarias estén definidas
    const requiredEnvVars = {
      AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
      AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
      AIRTABLE_TABLE_NAME: process.env.AIRTABLE_TABLE_NAME,
      AIRTABLE_API_URL: process.env.AIRTABLE_API_URL
    }

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key)

    if (missingVars.length > 0) {
      console.error('API Route: Missing environment variables:', missingVars)
      return NextResponse.json({
        success: false,
        error: `Missing required environment variables: ${missingVars.join(', ')}`,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    console.log('API Route: Fetching invoices from Airtable')
    const invoices = await getInvoices()
    console.log('API Route: Successfully fetched invoices:', {
      count: invoices.length,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      invoices,
      metadata: {
        count: invoices.length,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('API Route: Error fetching invoices:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al obtener las facturas',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 