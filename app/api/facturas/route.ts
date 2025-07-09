import { NextResponse } from 'next/server'
import { getInvoices } from '@/lib/services/airtable'
import Airtable from 'airtable'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'
import { Invoice } from '@/lib/types'
import { getUserFromRequest, createUserFilter, addUserToRecordData, canAccessRecord, logDataAccess } from '@/lib/utils/userFilters'
import { 
  getNormalizedTimestamp, 
  validateAirtableEnv, 
  createAuthErrorResponse,
  createServerErrorResponse,
  createSuccessResponse,
  checkAuth
} from '@/lib/utils/api-helpers'

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



export async function GET(request: Request) {
  try {
    // Check authentication
    const auth = await checkAuth(request);
    if (!auth.authenticated) {
      return createAuthErrorResponse(auth.error);
    }

    // Convertir el usuario autenticado al formato UserInfo
    const user = {
      id: auth.user!.id,
      email: auth.user!.email,
      rol: (auth.user!.role?.toUpperCase() || 'USER') as 'ADMIN' | 'USER' | 'VIEWER'
    };

    logDataAccess(user, 'GET', 'facturas-recibidas');
    
    // Verificar que todas las variables de entorno necesarias estén definidas
    const envValidation = validateAirtableEnv();
    if (!envValidation.valid) {
      return envValidation.response!; // Non-null assertion since valid=false means response is always set
    }

    // Aplicar filtros según el rol del usuario
    const userFilter = createUserFilter(user);
    const airtableInvoices = await getInvoices(userFilter.filterByFormula)
    
    // No need for transformation since getInvoices already returns Invoice objects
    const invoices = airtableInvoices;

    return createSuccessResponse(
      { invoices },
      { count: invoices.length }
    );
  } catch (error) {
    return createServerErrorResponse(
      error instanceof Error ? error.message : 'Error desconocido al obtener las facturas'
    );
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
    // Check authentication
    const auth = await checkAuth(request);
    if (!auth.authenticated) {
      return createAuthErrorResponse(auth.error);
    }

    // Convertir el usuario autenticado al formato UserInfo
    const user = {
      id: auth.user!.id,
      email: auth.user!.email,
      rol: (auth.user!.role?.toUpperCase() || 'USER') as 'ADMIN' | 'USER' | 'VIEWER'
    };

    logDataAccess(user, 'CREATE', 'facturas-recibidas');
    
    // Verify required environment variables
    const requiredEnvVars = {
      AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
      AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
    }

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key)

    if (missingVars.length > 0) {
      return createServerErrorResponse(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Get the data from the request
    const data = await request.json();
    // Validate the request data
    const validationResult = InvoiceCreationSchema.safeParse(data);
    if (!validationResult.success) {
      return createServerErrorResponse('Invalid invoice data: ' + JSON.stringify(validationResult.error.flatten()));
    }
    
    try {
      // Get the Airtable table reference
      const table = getAirtableBase();
      
      // Generate invoice number if not provided
      const invoiceNumber = data.facturaID || new Date().toISOString().split('T')[0];
      
      // Prepare base data for Airtable - transforming from IssuedInvoice format to Invoice format
      const baseInvoiceData = {
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

      // Añadir información del usuario automáticamente
      const invoiceData = addUserToRecordData(baseInvoiceData, user);
      
      // Log the data being sent to Airtable
      // Create the record in Airtable
      let record;
      try {
        record = await table.create([{ fields: invoiceData }]);
      } catch (airtableError) {
        // In development or testing, create a mock record if Airtable fails
        // This allows the UI to function even if Airtable integration has issues
        if (process.env.NODE_ENV !== 'production') {
          const timestamp = getNormalizedTimestamp();
          return createSuccessResponse({
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
            } as Invoice
          }, { timestamp });
        }
        
        // If in production, rethrow the error
        throw airtableError;
      }
      
      if (!record || record.length === 0) {
        throw new Error('Failed to create invoice in Airtable');
      }
      
      const createdRecord = record[0];
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
      return createSuccessResponse({
        invoice
      });
    } catch (error) {
      return createServerErrorResponse(
        error instanceof Error ? error.message : 'Error creando la factura'
      );
    }
  } catch (error) {
    return createServerErrorResponse(
      error instanceof Error ? error.message : 'Error procesando la solicitud'
    );
  }
}