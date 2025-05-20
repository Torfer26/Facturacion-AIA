export interface ReceivedInvoice {
  id: string;
  facturaID: string;
  creationDate: string;
  fechavencimiento: string;
  nombreproveedor: string;
  CIFproveedor: string;
  direccionproveedor: string;
  productofactura: {
    descripcion: string;
    cantidad: number;
    precio: number;
  }[];
  catidadproducto: number;
  subtotal: number;
  tipoiva: number;
  total: number;
  estadofactura: 'borrador' | 'recibida' | 'pagada' | 'vencida';
  datosbancarios: string;
}

export type ReceivedInvoiceStatus = 'borrador' | 'recibida' | 'pagada' | 'vencida';

export interface CreateReceivedInvoiceDTO extends Omit<ReceivedInvoice, 'id' | 'facturaID'> {} 