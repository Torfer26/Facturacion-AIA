import { z } from 'zod';

// Define the shape of the Airtable record
export const AirtableRecordSchema = z.object({
  id: z.string(),
  // Allow any fields to come from Airtable
  fields: z.record(z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.any())])),
});

export type AirtableRecord = z.infer<typeof AirtableRecordSchema>;

// Define the shape of our application's invoice model
export const InvoiceSchema = z.object({
  id: z.string(),
  invoiceNumber: z.string().optional(),
  customerName: z.string().optional(),
  supplierId: z.string().optional(),
  supplierName: z.string().optional(),
  supplierVat: z.string().optional(),
  supplierAddress: z.string().optional(),
  invoiceDate: z.string().optional(),
  totalWithoutVat: z.number().optional(),
  totalWithVat: z.number().optional(),
  vatPercentage: z.number().optional(),
  vatAmount: z.number().optional(),
  description: z.string().optional(),
  internalId: z.string().optional(),
});

export type Invoice = z.infer<typeof InvoiceSchema>;

// Mapping of Airtable field names to our application field names
const fieldMapping = {
  'Invoice Number': 'invoiceNumber',
  'Customer Name': 'customerName',
  'Supplier ID': 'supplierId',
  'Supplier name': 'supplierName',
  'Supplier VAT Identification Number': 'supplierVat',
  'Supplier Address': 'supplierAddress',
  'InvoiceDate': 'invoiceDate',
  'Total Price excluding VAT': 'totalWithoutVat',
  'Total Price including VAT': 'totalWithVat',
  'Tax percentage': 'vatPercentage',
  'Tax amount': 'vatAmount',
  'Invoice description': 'description',
  'InternalID': 'internalId',
};

/**
 * Adapter to transform Airtable record to our application model
 */
export function airtableToInvoice(record: AirtableRecord): Invoice {
  try {
    // Parse with Zod to ensure the record has the expected shape
    const parsedRecord = AirtableRecordSchema.parse(record);
    
    // Create our application model with consistent field names
    const invoice: Record<string, any> = { id: parsedRecord.id };
    
    // Map fields from Airtable to our model
    Object.entries(parsedRecord.fields).forEach(([airtableField, value]) => {
      const appField = fieldMapping[airtableField as keyof typeof fieldMapping];
      if (appField) {
        invoice[appField] = value;
      }
    });
    
    // Validate the invoice with our schema
    return InvoiceSchema.parse(invoice);
  } catch (error) {
    // Return a minimal valid invoice with the ID
    return { id: record.id };
  }
}

/**
 * Adapter to transform our application model to Airtable record
 */
export function invoiceToAirtable(invoice: Invoice): { fields: Record<string, any> } {
  const fields: Record<string, any> = {};
  
  // Map fields from our model to Airtable
  Object.entries(fieldMapping).forEach(([airtableField, appField]) => {
    const value = invoice[appField as keyof Invoice];
    if (value !== undefined) {
      fields[airtableField] = value;
    }
  });
  
  return { fields };
} 