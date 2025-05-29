export interface Cliente {
  id: string;
  nombre: string;
  cifNif: string;
  email: string;
  telefono?: string;
  direccion?: string;
  codigoPostal?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  personaContacto?: string;
  telefonoContacto?: string;
  emailContacto?: string;
  tipoCliente?: 'Empresa' | 'Autónomo' | 'Particular';
  estado?: 'Activo' | 'Inactivo' | 'Pendiente';
  formaPago?: 'Transferencia' | 'Tarjeta' | 'Efectivo' | 'Cheque';
  diasPago?: number;
  limiteCredito?: number;
  descuentoHabitual?: number;
  fechaAlta?: string;
  ultimaFactura?: string;
  totalFacturado?: number;
  numeroFacturas?: number;
  notas?: string;
  createdAt?: string;
  updatedAt?: string;
} 