import { NextResponse } from 'next/server'
import { getInvoices } from '@/lib/services/airtable'
import Airtable from 'airtable'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'
import { z } from 'zod'
import { Invoice } from '@/lib/types'

// Helper function to ensure date is current year
function getNormalizedTimestamp(): string {
  const now = new Date();
  return now.toISOString();
}

// Airtable configuration
function getAirtableBase() {
  const apiKey = process.env.AIRTABLE_API_KEY
  const baseId = process.env.AIRTABLE_BASE_ID
  const tableName = process.env.AIRTABLE_TABLE_NAME_RECIBIDAS
  if (!apiKey || !baseId || !tableName) {
    throw new Error('Missing Airtable configuration for recibidas');
  }
  const base = new Airtable({ apiKey }).base(baseId);
  return base(tableName);
}

// Check authentication helper
async function checkAuth(request: Request) {
  // Get token from Authorization header
  const authHeader = request.headers.get('Authorization');
  const token = getTokenFromHeader(authHeader || '');
  
  if (!token) {
    return { authenticated: false, error: 'No authentication token provided' };
  }
  
  // Verify token
  const user = await verifyToken(token);
  
  if (!user) {
    return { authenticated: false, error: 'Invalid authentication token' };
  }
  
  return { authenticated: true, user };
}

export async function GET(request: Request) {
  try {
    console.log('API Route: Starting request for invoices');
    
    // Check authentication
    const auth = await checkAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({
        success: false,
        error: auth.error
      }, { status: 401 });
    }
    
    // Verificar que todas las variables de entorno necesarias estén definidas
    const requiredEnvVars = {
      AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
      AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
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
        timestamp: getNormalizedTimestamp()
      }, { status: 500 })
    }

    console.log('API Route: Fetching invoices from Airtable')
    const airtableInvoices = await getInvoices()
    
    // No need for transformation since getInvoices already returns Invoice objects
    const invoices = airtableInvoices;
    
    console.log('API Route: Successfully fetched invoices:', {
      count: invoices.length,
      timestamp: getNormalizedTimestamp()
    })

    return NextResponse.json({
      success: true,
      invoices,
      metadata: {
        count: invoices.length,
        timestamp: getNormalizedTimestamp()
      }
    })
  } catch (error) {
    console.error('API Route: Error fetching invoices:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al obtener las facturas',
      timestamp: getNormalizedTimestamp()
    }, { status: 500 })
  }
}

// Validation schema for the invoice creation payload
const InvoiceCreationSchema = z.object({
  creationDate: z.string().optional(),
  nombrecliente: z.string(),
  CIFcliente: z.string().optional(),
  direccioncliente: z.string().optional(),
  subtotal: z.number(),
  total: z.number(),
  tipoiva: z.number(),
  facturaID: z.string().optional(),
  productofactura: z.array(
    z.object({
      descripcion: z.string().optional(),
      precio: z.number().optional(),
      cantidad: z.number().optional()
    })
  ).optional()
});

export async function POST(request: Request) {
  try {
    console.log('API Route: Starting request to create invoice');
    
    // Check authentication
    const auth = await checkAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({
        success: false,
        error: auth.error
      }, { status: 401 });
    }
    
    // Verify required environment variables
    const requiredEnvVars = {
      AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
      AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
    }

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key)

    if (missingVars.length > 0) {
      console.error('API Route: Missing environment variables:', missingVars)
      return NextResponse.json({
        success: false,
        error: `Missing required environment variables: ${missingVars.join(', ')}`,
        timestamp: getNormalizedTimestamp()
      }, { status: 500 })
    }

    // Get the data from the request
    const data = await request.json();
    console.log('API Route: Received invoice data:', data);
    
    // Validate the request data
    const validationResult = InvoiceCreationSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid invoice data',
        details: validationResult.error.flatten()
      }, { status: 400 });
    }
    
    try {
      // Get the Airtable table reference
      const table = getAirtableBase();
      
      // Generate invoice number if not provided
      const invoiceNumber = data.facturaID || new Date().toISOString().split('T')[0];
      
      // Prepare data for Airtable - transforming from IssuedInvoice format to Invoice format
      const invoiceData = {
        'InvoiceDate': data.creationDate,
        'Customer Name': data.nombrecliente,
        'Supplier VAT Identification Number': data.CIFcliente,
        'Supplier Address': data.direccioncliente,
        'Total Price excluding VAT': data.subtotal,
        'Total Price including VAT': data.total,
        'Tax percentage': data.tipoiva,
        'Tax amount': data.total - data.subtotal,
        'Supplier name': 'Your Company Name', // This should be a config value
        'Invoice description': data.productofactura?.[0]?.descripcion || 'Services',
        'URL Google Drive': ''
      };
      
      // Log the data being sent to Airtable
      console.log('API Route: Data being sent to Airtable:', invoiceData);
      
      // Create the record in Airtable
      console.log('API Route: Creating invoice in Airtable');
      
      let record;
      try {
        record = await table.create([{ fields: invoiceData }]);
      } catch (airtableError) {
        console.error('API Route: Airtable error while creating record:', airtableError);
        
        // In development or testing, create a mock record if Airtable fails
        // This allows the UI to function even if Airtable integration has issues
        if (process.env.NODE_ENV !== 'production') {
          console.log('API Route: Using mock record in development mode');
          const timestamp = getNormalizedTimestamp();
          return NextResponse.json({
            success: true,
            invoice: {
              id: 'mock-' + Date.now(),
              invoiceDate: data.creationDate,
              invoiceNumber: invoiceNumber,
              customerName: data.nombrecliente,
              supplierVatNumber: data.CIFcliente,
              supplierAddress: data.direccioncliente,
              totalPriceExVat: data.subtotal,
              totalPriceIncVat: data.total,
              taxPercentage: data.tipoiva,
              taxAmount: data.total - data.subtotal,
              supplierName: 'Your Company Name',
              invoiceDescription: data.productofactura?.[0]?.descripcion || 'Services',
              internalId: String(Date.now()),
              driveUrl: '',
              createdAt: timestamp,
              updatedAt: timestamp
            } as Invoice,
            timestamp: timestamp
          });
        }
        
        // If in production, rethrow the error
        throw airtableError;
      }
      
      if (!record || record.length === 0) {
        console.error('API Route: Failed to create invoice in Airtable - empty record returned');
        throw new Error('Failed to create invoice in Airtable');
      }
      
      const createdRecord = record[0];
      console.log('API Route: Created invoice with ID:', createdRecord.id);
      
      // Convert the created record to our invoice format
      const invoice: Invoice = {
        id: createdRecord.id,
        invoiceNumber: createdRecord.fields['Invoice Number']?.toString() || invoiceNumber,
        invoiceDate: createdRecord.fields['InvoiceDate']?.toString() || new Date().toISOString(),
        customerName: createdRecord.fields['Customer Name']?.toString() || data.nombrecliente,
        supplierVatNumber: createdRecord.fields['Supplier VAT Identification Number']?.toString() || data.CIFcliente || '',
        supplierAddress: createdRecord.fields['Supplier Address']?.toString() || data.direccioncliente || '',
        totalPriceExVat: typeof createdRecord.fields['Total Price excluding VAT'] === 'number' 
          ? createdRecord.fields['Total Price excluding VAT'] : data.subtotal,
        totalPriceIncVat: typeof createdRecord.fields['Total Price including VAT'] === 'number'
          ? createdRecord.fields['Total Price including VAT'] : data.total,
        taxPercentage: typeof createdRecord.fields['Tax percentage'] === 'number'
          ? createdRecord.fields['Tax percentage'] : data.tipoiva,
        taxAmount: typeof createdRecord.fields['Tax amount'] === 'number'
          ? createdRecord.fields['Tax amount'] : (data.total - data.subtotal),
        supplierName: createdRecord.fields['Supplier name']?.toString() || 'Your Company Name',
        invoiceDescription: createdRecord.fields['Invoice description']?.toString() || 
          data.productofactura?.[0]?.descripcion || 'Services',
        internalId: createdRecord.fields['InternalID']?.toString() || null,
        driveUrl: createdRecord.fields['URL Google Drive']?.toString() || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Return the created invoice
      console.log('API Route: Returning created invoice:', {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber
      });
      
      const timestamp = getNormalizedTimestamp();
      return NextResponse.json({
        success: true,
        invoice,
        timestamp
      });
    } catch (error) {
      console.error('API Route: Error creating invoice:', error);
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Error creando la factura',
        timestamp: getNormalizedTimestamp()
      }, { status: 500 });
    }
  } catch (error) {
    console.error('API Route: Error processing request:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error procesando la solicitud',
      timestamp: getNormalizedTimestamp()
    }, { status: 500 });
  }
}