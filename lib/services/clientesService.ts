import { Cliente } from '@/lib/types/cliente';
import { UserInfo } from '@/lib/utils/userFilters';

// Helper function to normalize dates
function normalizeDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toISOString();
  } catch (e) {
    return dateString;
  }
}

// Verificar que las variables de entorno necesarias estén definidas
const requiredEnvVars = {
  AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
  AIRTABLE_API_URL: process.env.AIRTABLE_API_URL || 'https://api.airtable.com/v0'
}

// Verificar variables de entorno
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
})

const AIRTABLE_API_KEY = requiredEnvVars.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = requiredEnvVars.AIRTABLE_BASE_ID
const AIRTABLE_API_URL = requiredEnvVars.AIRTABLE_API_URL
const AIRTABLE_TABLE_NAME_CLIENTES = process.env.AIRTABLE_TABLE_NAME_CLIENTES || 'tblh8z1wrQvi4xPpP';

export async function getClientes(filterFormula?: string): Promise<Cliente[]> {
  try {
    let url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME_CLIENTES}`
    
    // Añadir filtro si se proporciona
    if (filterFormula) {
      const params = new URLSearchParams({
        filterByFormula: filterFormula
      });
      url += `?${params.toString()}`;
    }
    
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

    const clientes = data.records.map((record: any) => {
      try {
        const cliente: Cliente = {
          id: record.id,
          nombre: record.fields.Nombre || '',
          cifNif: record.fields.CIF_NIF || '',
          email: record.fields.Email || '',
          telefono: record.fields.Telefono || '',
          direccion: record.fields.Direccion || '',
          codigoPostal: record.fields.CodigoPostal || '',
          ciudad: record.fields.Ciudad || '',
          provincia: record.fields.Provincia || '',
          pais: record.fields.Pais || 'España',
          personaContacto: record.fields.PersonaContacto || '',
          telefonoContacto: record.fields.TelefonoContacto || '',
          emailContacto: record.fields.EmailContacto || '',
          tipoCliente: record.fields.TipoCliente || 'Empresa',
          estado: record.fields.Estado || 'Activo',
          formaPago: record.fields.FormaPago || 'Transferencia',
          diasPago: parseInt(record.fields.DiasPago?.toString() || '30'),
          limiteCredito: parseFloat(record.fields.LimiteCredito?.toString() || '0'),
          descuentoHabitual: parseFloat(record.fields.DescuentoHabitual?.toString() || '0'),
          fechaAlta: record.fields.FechaAlta ? normalizeDate(record.fields.FechaAlta) : new Date().toISOString(),
          ultimaFactura: record.fields.UltimaFactura ? normalizeDate(record.fields.UltimaFactura) : null,
          totalFacturado: parseFloat(record.fields.TotalFacturado?.toString() || '0'),
          numeroFacturas: parseInt(record.fields.NumeroFacturas?.toString() || '0'),
          notas: record.fields.Notas || '',
          createdAt: normalizeDate(record.createdTime),
          updatedAt: normalizeDate(record.createdTime)
        }

        return cliente
      } catch (err) {
        console.error('Error processing cliente record:', err, record)
        throw err
      }
    })

    return clientes
  } catch (error) {
    console.error('Error fetching clientes:', error)
    throw error
  }
}

export async function createCliente(
  clienteData: Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>,
  user?: UserInfo
): Promise<Cliente> {
  try {
    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME_CLIENTES}`
    const headers = {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    }

    const fields: any = {
          Nombre: clienteData.nombre,
          CIF_NIF: clienteData.cifNif,
          Email: clienteData.email,
          Telefono: clienteData.telefono,
          Direccion: clienteData.direccion,
          CodigoPostal: clienteData.codigoPostal,
          Ciudad: clienteData.ciudad,
          Provincia: clienteData.provincia,
          Pais: clienteData.pais || 'España',
          PersonaContacto: clienteData.personaContacto,
          TelefonoContacto: clienteData.telefonoContacto,
          EmailContacto: clienteData.emailContacto,
          TipoCliente: clienteData.tipoCliente || 'Empresa',
          Estado: clienteData.estado || 'Activo',
          FormaPago: clienteData.formaPago || 'Transferencia',
          DiasPago: clienteData.diasPago || 30,
          LimiteCredito: clienteData.limiteCredito || 0,
          DescuentoHabitual: clienteData.descuentoHabitual || 0,
          FechaAlta: clienteData.fechaAlta || new Date().toISOString(),
          TotalFacturado: clienteData.totalFacturado || 0,
          NumeroFacturas: clienteData.numeroFacturas || 0,
          Notas: clienteData.notas || ''
    };

    // Añadir información del usuario si se proporciona
    if (user) {
      fields.UserID = user.id;
      fields.UserEmail = user.email;
    }

    const body = {
      records: [{ fields }]
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Error creating cliente: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    const record = data.records[0]

    return {
      id: record.id,
      nombre: record.fields.Nombre,
      cifNif: record.fields.CIF_NIF,
      email: record.fields.Email,
      telefono: record.fields.Telefono,
      direccion: record.fields.Direccion,
      codigoPostal: record.fields.CodigoPostal,
      ciudad: record.fields.Ciudad,
      provincia: record.fields.Provincia,
      pais: record.fields.Pais,
      personaContacto: record.fields.PersonaContacto,
      telefonoContacto: record.fields.TelefonoContacto,
      emailContacto: record.fields.EmailContacto,
      tipoCliente: record.fields.TipoCliente,
      estado: record.fields.Estado,
      formaPago: record.fields.FormaPago,
      diasPago: parseInt(record.fields.DiasPago?.toString() || '30'),
      limiteCredito: parseFloat(record.fields.LimiteCredito?.toString() || '0'),
      descuentoHabitual: parseFloat(record.fields.DescuentoHabitual?.toString() || '0'),
      fechaAlta: record.fields.FechaAlta,
      ultimaFactura: record.fields.UltimaFactura,
      totalFacturado: parseFloat(record.fields.TotalFacturado?.toString() || '0'),
      numeroFacturas: parseInt(record.fields.NumeroFacturas?.toString() || '0'),
      notas: record.fields.Notas,
      createdAt: normalizeDate(record.createdTime),
      updatedAt: normalizeDate(record.createdTime)
    }
  } catch (error) {
    console.error('Error creating cliente:', error)
    throw error
  }
} 