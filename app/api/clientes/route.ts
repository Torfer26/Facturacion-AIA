import { NextResponse } from 'next/server'
import { getClientes, createCliente } from '@/lib/services/clientesService'
import { z } from 'zod'
import { getUserFromRequest, createUserFilter, logDataAccess } from '@/lib/utils/userFilters'
import { 
  getNormalizedTimestamp, 
  validateAirtableEnv, 
  createAuthErrorResponse,
  createServerErrorResponse,
  createSuccessResponse 
} from '@/lib/utils/api-helpers'

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
    // Extraer información del usuario
    const user = getUserFromRequest(request);
    if (!user) {
      return createAuthErrorResponse('Usuario no autenticado');
    }

    logDataAccess(user, 'GET', 'clientes');
    
    // Verify required environment variables
    const envValidation = validateAirtableEnv();
    if (!envValidation.valid) {
      return envValidation.response!; // Non-null assertion since valid=false means response is always set
    }

    // Aplicar filtros según el rol del usuario
    const userFilter = createUserFilter(user);
    const clientes = await getClientes(userFilter.filterByFormula)
    
    return createSuccessResponse(
      { clientes },
      { count: clientes.length }
    );
  } catch (error) {
    console.error('Error in GET /api/clientes:', error)
    return createServerErrorResponse(
      error instanceof Error ? error.message : 'Error desconocido al obtener los clientes'
    );
  }
}

export async function POST(request: Request) {
  try {
    // Extraer información del usuario
    const user = getUserFromRequest(request);
    if (!user) {
      return createAuthErrorResponse('Usuario no autenticado');
    }

    logDataAccess(user, 'CREATE', 'clientes');
    
    // Verify required environment variables
    const envValidation = validateAirtableEnv();
    if (!envValidation.valid) {
      return envValidation.response!; // Non-null assertion since valid=false means response is always set
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
      // Create the cliente in Airtable with user information
      const cliente = await createCliente(validationResult.data, user);
      
      // Return the created cliente
      return createSuccessResponse({ cliente });
    } catch (error) {
      return createServerErrorResponse(
        error instanceof Error ? error.message : 'Error creando el cliente'
      );
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