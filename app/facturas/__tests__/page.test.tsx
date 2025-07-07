import { render, screen } from '@testing-library/react'
import FacturasPage from '../page'

const mockInvoices = [
  {
    id: '1',
    invoiceNumber: 'F001',
    invoiceDate: '2024-03-20',
    invoiceDescription: 'Factura de servicios',
    supplierName: 'Proveedor Test',
    totalPriceIncVat: 1000,
    paid: true,
    driveUrl: 'https://drive.google.com/test'
  }
]

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/facturas',
  useSearchParams: () => new URLSearchParams(),
  redirect: jest.fn(),
}))

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        name: 'Test User',
        email: 'test@example.com',
      },
    },
    status: 'authenticated',
  }),
}))

// Mock googleapis
jest.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: jest.fn().mockImplementation(() => ({
        getClient: jest.fn(),
      })),
    },
    drive: jest.fn().mockImplementation(() => ({
      files: {
        create: jest.fn(),
        get: jest.fn(),
        list: jest.fn(),
      },
    })),
  },
}))

// Mock useInvoices hook
jest.mock('@/lib/hooks/useInvoices', () => ({
  useInvoices: () => ({
    invoices: mockInvoices,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}))

describe('FacturasPage', () => {
  it('redirects to received invoices', () => {
    const { redirect } = require('next/navigation')
    render(<FacturasPage />)
    expect(redirect).toHaveBeenCalledWith('/facturas/recibidas')
  })
})
