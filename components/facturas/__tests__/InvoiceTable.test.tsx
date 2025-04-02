import { render, screen, within } from '@testing-library/react'
import { InvoiceTable } from '../InvoiceTable'
import { formatCurrency } from '@/lib/utils'

const mockInvoices = [
  {
    id: '1',
    invoiceNumber: 'F001',
    invoiceDate: '2024-03-20',
    invoiceDescription: 'Factura de servicios',
    supplierName: 'Proveedor Test',
    customerName: 'Cliente Test',
    totalPriceExVat: 826.45,
    taxAmount: 173.55,
    totalPriceIncVat: 1000,
    paid: true,
    driveUrl: 'https://drive.google.com/test'
  }
]

describe('InvoiceTable', () => {
  it('renders loading state', () => {
    render(<InvoiceTable invoices={[]} isLoading={true} />)
    expect(screen.getByText(/cargando/i)).toBeInTheDocument()
  })

  it('renders empty state', () => {
    render(<InvoiceTable invoices={[]} isLoading={false} />)
    expect(screen.getByText(/no hay facturas/i)).toBeInTheDocument()
  })

  it('renders invoices correctly', () => {
    render(<InvoiceTable invoices={mockInvoices} isLoading={false} />)
    
    // Check headers
    expect(screen.getByRole('button', { name: /número/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /fecha/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /proveedor/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cliente/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /base imponible/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iva/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /total/i })).toBeInTheDocument()
    
    // Check invoice data
    const table = screen.getByRole('table')
    const cells = within(table).getAllByRole('cell')
    
    expect(cells[0]).toHaveTextContent('F001')
    expect(cells[1]).toHaveTextContent(new Date('2024-03-20').toLocaleDateString('es-ES'))
    expect(cells[2]).toHaveTextContent('Proveedor Test')
    expect(cells[3]).toHaveTextContent('Cliente Test')
    expect(cells[4]).toHaveTextContent(/826,45/)
    expect(cells[5]).toHaveTextContent(/173,55/)
    expect(cells[6]).toHaveTextContent(/1000,00/)
  })
}) 