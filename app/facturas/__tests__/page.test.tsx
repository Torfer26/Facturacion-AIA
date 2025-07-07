import { render } from '@testing-library/react'
import FacturasPage from '../page'
import { redirect } from 'next/navigation'

jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}))

describe('FacturasPage', () => {
  it('redirects to received invoices', () => {
    render(<FacturasPage />)
    expect(redirect).toHaveBeenCalledWith('/facturas/recibidas')
  })
})
