import { IssuedInvoice, CreateIssuedInvoiceDTO } from '../types/issuedInvoice';

// Function to get the appropriate API URL based on environment (client or server)
function getApiUrl(path: string): string {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Client-side: use relative URL
    return path;
  } else {
    // Server-side: need absolute URL
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}${path}`;
  }
}

// Use fetch API instead of direct Airtable client integration
const API_PATH = '/api/facturas';

export const getIssuedInvoices = async (): Promise<IssuedInvoice[]> => {
  try {
    const apiUrl = getApiUrl(API_PATH);
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error fetching issued invoices');
    }
    
    const data = await response.json();
    
    if (!data.success || !Array.isArray(data.invoices)) {
      throw new Error('Unexpected response format from server');
    }
    
    // Convert the invoices from the general facturas format to IssuedInvoice format
    return data.invoices.map((invoice: any) => ({
      id: invoice.id,
      facturaID: invoice.invoiceNumber || new Date().toISOString().split('T')[0],
      creationDate: invoice.invoiceDate || new Date().toISOString(),
      fechavencimiento: invoice.invoiceDate || new Date().toISOString(), // Using invoiceDate as fallback
      nombrecliente: invoice.customerName || '',
      cifcliente: invoice.supplierVatNumber || '',
      direccioncliente: invoice.supplierAddress || '',
      productofactura: [{
        descripcion: invoice.invoiceDescription || '',
        cantidad: 1,
        precio: invoice.totalPriceExVat || 0
      }],
      cantidadproducto: 1,
      subtotal: invoice.totalPriceExVat || 0,
      tipoiva: invoice.taxPercentage || 21,
      total: invoice.totalPriceIncVat || 0,
      estadofactura: 'registrada',
      datosbancarios: '',
    }));
  } catch (error) {
    throw error;
  }
};

export const createIssuedInvoice = async (invoice: CreateIssuedInvoiceDTO): Promise<IssuedInvoice> => {
  try {
    );
    
    // Try the main endpoint first
    const mainApiUrl = getApiUrl(API_PATH);
    const response = await fetch(mainApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoice),
      // Add cache: 'no-store' to ensure we don't get cached responses
      cache: 'no-store'
    });
    
    // If the response is not OK, try the emitidas endpoint as fallback
    if (!response.ok) {
      // Try to get more details about the error
      let errorDetails = '';
      try {
        const errorData = await response.text();
        if (errorData) {
          errorDetails = errorData;
        }
      } catch (e) {
        }
      
      // Try the emitidas endpoint as fallback
      const emitApiUrl = getApiUrl(`${API_PATH}/emitidas`);
      const emitResponse = await fetch(emitApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoice),
        cache: 'no-store'
      });
      
      if (!emitResponse.ok) {
        const errorText = await emitResponse.text();
        // If both endpoints fail, create a mock response
        if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
          // Create a mock invoice for development
          return {
            id: 'mock-client-' + Date.now(),
            facturaID: new Date().toISOString().split('T')[0] + '-' + Math.floor(Math.random() * 1000),
            creationDate: invoice.creationDate,
            fechavencimiento: invoice.fechavencimiento,
            nombrecliente: invoice.nombrecliente,
            cifcliente: invoice.cifcliente,
            direccioncliente: invoice.direccioncliente,
            productofactura: invoice.productofactura || [],
            cantidadproducto: invoice.cantidadproducto,
            subtotal: invoice.subtotal,
            tipoiva: invoice.tipoiva,
            total: invoice.total,
            estadofactura: invoice.estadofactura,
            datosbancarios: invoice.datosbancarios,
          };
        }
        
        throw new Error(errorText || 'Error creating issued invoice');
      }
      
      // Try to parse the emitidas response
      try {
        const emitData = await emitResponse.json();
        
        // Convert the API response to IssuedInvoice format
        if (emitData.success && emitData.invoice) {
          return mapApiResponseToIssuedInvoice(emitData.invoice);
        }
        
        throw new Error('Unexpected response format from emitidas endpoint');
      } catch (parseError) {
        // If parsing fails, create a mock response
        if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
          // Create a mock invoice for development
          return {
            id: 'mock-emitidas-parse-error-' + Date.now(),
            facturaID: new Date().toISOString().split('T')[0] + '-' + Math.floor(Math.random() * 1000),
            creationDate: invoice.creationDate,
            fechavencimiento: invoice.fechavencimiento,
            nombrecliente: invoice.nombrecliente,
            cifcliente: invoice.cifcliente,
            direccioncliente: invoice.direccioncliente,
            productofactura: invoice.productofactura || [],
            cantidadproducto: invoice.cantidadproducto,
            subtotal: invoice.subtotal,
            tipoiva: invoice.tipoiva,
            total: invoice.total,
            estadofactura: invoice.estadofactura,
            datosbancarios: invoice.datosbancarios,
          };
        }
        
        throw new Error('Failed to parse response from emitidas endpoint');
      }
    }
    
    // Parse the response from the main endpoint
    try {
      const responseText = await response.text();
      // Only try to parse as JSON if there's content
      if (!responseText) {
        throw new Error('Empty response from server');
      }
      
      const data = JSON.parse(responseText);
      
      // Convert the API response to IssuedInvoice format
      if (data.success && data.invoice) {
        return mapApiResponseToIssuedInvoice(data.invoice);
      }
      
      throw new Error('Unexpected response format from server');
    } catch (parseError) {
      // If parsing fails, create a mock response
      if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
        // Create a mock invoice for development
        return {
          id: 'mock-main-parse-error-' + Date.now(),
          facturaID: new Date().toISOString().split('T')[0] + '-' + Math.floor(Math.random() * 1000),
          creationDate: invoice.creationDate,
          fechavencimiento: invoice.fechavencimiento,
          nombrecliente: invoice.nombrecliente,
          cifcliente: invoice.cifcliente,
          direccioncliente: invoice.direccioncliente,
          productofactura: invoice.productofactura || [],
          cantidadproducto: invoice.cantidadproducto,
          subtotal: invoice.subtotal,
          tipoiva: invoice.tipoiva,
          total: invoice.total,
          estadofactura: invoice.estadofactura,
          datosbancarios: invoice.datosbancarios,
        };
      }
      
      throw new Error('Failed to parse response from server');
    }
  } catch (error) {
    // Last resort fallback for the client side in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      // Create a mock invoice for development
      return {
        id: 'mock-fallback-' + Date.now(),
        facturaID: new Date().toISOString().split('T')[0] + '-' + Math.floor(Math.random() * 1000),
        creationDate: invoice.creationDate,
        fechavencimiento: invoice.fechavencimiento,
        nombrecliente: invoice.nombrecliente,
        cifcliente: invoice.cifcliente,
        direccioncliente: invoice.direccioncliente,
        productofactura: invoice.productofactura || [],
        cantidadproducto: invoice.cantidadproducto,
        subtotal: invoice.subtotal,
        tipoiva: invoice.tipoiva,
        total: invoice.total,
        estadofactura: invoice.estadofactura,
        datosbancarios: invoice.datosbancarios,
      };
    }
    
    throw error;
  }
};

// Helper function to map API response to IssuedInvoice
function mapApiResponseToIssuedInvoice(invoice: any): IssuedInvoice {
  return {
    id: invoice.id || '',
    facturaID: invoice.invoiceNumber || new Date().toISOString().split('T')[0],
    creationDate: invoice.invoiceDate || new Date().toISOString(),
    fechavencimiento: invoice.invoiceDate || new Date().toISOString(),
    nombrecliente: invoice.customerName || '',
    cifcliente: invoice.supplierVatNumber || '',
    direccioncliente: invoice.supplierAddress || '',
    productofactura: [{
      descripcion: invoice.invoiceDescription || '',
      cantidad: 1,
      precioUnitario: invoice.totalPriceExVat || 0
    }],
    cantidadproducto: 1,
    subtotal: invoice.totalPriceExVat || 0,
    tipoiva: invoice.taxPercentage || 21,
    total: invoice.totalPriceIncVat || 0,
    estadofactura: 'registrada',
    datosbancarios: '',
  };
}

export const updateIssuedInvoice = async (id: string, invoice: Partial<IssuedInvoice>): Promise<IssuedInvoice> => {
  try {
    const apiUrl = getApiUrl(`${API_PATH}/${id}`);
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoice),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error updating issued invoice');
    }
    
    const data = await response.json();
    return data.invoice;
  } catch (error) {
    throw error;
  }
};

export const deleteIssuedInvoice = async (id: string): Promise<void> => {
  try {
    const apiUrl = getApiUrl(`${API_PATH}/${id}`);
    const response = await fetch(apiUrl, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error deleting issued invoice');
    }
  } catch (error) {
    throw error;
  }
}; 