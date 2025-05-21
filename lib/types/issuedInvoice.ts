export interface IssuedInvoice {
  id: string;
  facturaID: string;
  CreationDate: string;
  Fechavencimiento: string;
  Nombrecliente: string;
  CIFcliente: string;
  direccioncliente: string;
  Productofactura: string;
  cantidadproducto: number; // ⚠️ typo heredado de Airtable
  subtotal: number;
  tipoiva: number;
  total: number;
  estadofactura: 'registrada' | 'pdfgenerado' | 'enviada' | 'cobrada';
  datosbancarios: string;
}


export type IssuedInvoiceStatus = 'registrada' | 'pdfgenerado' | 'enviada' | 'cobrada';

export interface CreateIssuedInvoiceDTO extends Omit<IssuedInvoice, 'id' | 'facturaID'> {} 