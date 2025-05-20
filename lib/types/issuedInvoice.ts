export interface IssuedInvoice {
  id: string;
  facturaID: string;
  creationDate: string;
  fechavencimiento: string;
  nombrecliente: string;
  CIFcliente: string;
  direccioncliente: string;
  productofactura: {
    descripcion: string;
    cantidad: number;
    precio: number;
  }[];
  catidadproducto: number;
  subtotal: number;
  tipoiva: number;
  total: number;
  estadofactura: 'registrada' | 'pdfgenerado' | 'enviada' | 'cobrada';
  datosbancarios: string;
}

export type IssuedInvoiceStatus = 'registrada' | 'pdfgenerado' | 'enviada' | 'cobrada';

export interface CreateIssuedInvoiceDTO extends Omit<IssuedInvoice, 'id' | 'facturaID'> {} 