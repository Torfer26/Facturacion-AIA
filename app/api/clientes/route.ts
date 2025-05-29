import { NextResponse } from 'next/server'
import { getClientes, createCliente } from '@/lib/services/clientesService'
import { z } from 'zod'

// Helper function to ensure date is current year
function getNormalizedTimestamp(): string {
  const now = new Date();
  return now.toISOString();
}

// Validation schema for cliente creation
const ClienteCreationSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  cifNif: z.string().min(1, 'El CIF/NIF es obligatorio'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  codigoPostal: z.string().optional(),
  ciudad: z.string().optional(),
  provincia: z.string().optional(),
  pais: z.string().optional(),
  personaContacto: z.string().optional(),
  telefonoContacto: z.string().optional(),
  emailContacto: z.string().email().optional().or(z.literal('')),
  tipoCliente: z.enum(['Empresa', 'Autónomo', 'Particular']).optional(),
  estado: z.enum(['Activo', 'Inactivo', 'Pendiente']).optional(),
  formaPago: z.enum(['Transferencia', 'Tarjeta', 'Efectivo', 'Cheque']).optional(),
  diasPago: z.number().optional(),
  limiteCredito: z.number().optional(),
  descuentoHabitual: z.number().optional(),
  notas: z.string().optional()
});

export async function GET(request: Request) {
  try {
    // TODO: Add authentication check here when ready
    
    // Verify required environment variables
    const requiredEnvVars = {
      AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
      AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
      AIRTABLE_API_URL: process.env.AIRTABLE_API_URL
    }

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key)

    if (missingVars.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required environment variables: ${missingVars.join(', ')}`,
        timestamp: getNormalizedTimestamp()
      }, { status: 500 })
    }

    const clientes = await getClientes()
    
    return NextResponse.json({
      success: true,
      clientes,
      metadata: {
        count: clientes.length,
        timestamp: getNormalizedTimestamp()
      }
    })
  } catch (error) {
    console.error('Error in GET /api/clientes:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al obtener los clientes',
      timestamp: getNormalizedTimestamp()
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // TODO: Add authentication check here when ready
    
    // Verify required environment variables
    const requiredEnvVars = {
      AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
      AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
    }

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key)

    if (missingVars.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required environment variables: ${missingVars.join(', ')}`,
        timestamp: getNormalizedTimestamp()
      }, { status: 500 })
    }

    // Get the data from the request
    const data = await request.json();
    
    // Validate the request data
    const validationResult = ClienteCreationSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Datos de cliente inválidos',
        details: validationResult.error.flatten()
      }, { status: 400 });
    }
    
    try {
      // Create the cliente in Airtable
      const cliente = await createCliente(validationResult.data);
      
      // Return the created cliente
      return NextResponse.json({
        success: true,
        cliente,
        timestamp: getNormalizedTimestamp()
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Error creando el cliente',
        timestamp: getNormalizedTimestamp()
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in POST /api/clientes:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error procesando la solicitud',
      timestamp: getNormalizedTimestamp()
    }, { status: 500 });
  }
} 