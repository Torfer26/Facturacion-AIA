import { render, screen, fireEvent, act } from '@testing-library/react'
import { FileUpload } from '../FileUpload'

describe('FileUpload', () => {
  const mockOnUpload = jest.fn()

  beforeEach(() => {
    mockOnUpload.mockClear()
  })

  it('renders upload section', () => {
    render(<FileUpload onUpload={mockOnUpload} />)
    expect(screen.getByText(/arrastra y suelta tu factura aquí/i)).toBeInTheDocument()
    expect(screen.getByText(/o haz clic para seleccionar/i)).toBeInTheDocument()
    expect(screen.getByText(/PDF, JPG o PNG \(máx. 10MB\)/i)).toBeInTheDocument()
  })

  it('handles file selection', async () => {
    mockOnUpload.mockImplementation(() => Promise.resolve())
    render(<FileUpload onUpload={mockOnUpload} />)
    
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    const input = screen.getByTestId('file-input')
    
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } })
    })
    
    expect(mockOnUpload).toHaveBeenCalledWith(file)
  })

  it('shows loading state during upload', async () => {
    mockOnUpload.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    render(<FileUpload onUpload={mockOnUpload} />)
    
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    const input = screen.getByTestId('file-input')
    
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } })
    })
    
    expect(screen.getByText(/subiendo archivo/i)).toBeInTheDocument()
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    expect(screen.queryByText(/subiendo archivo/i)).not.toBeInTheDocument()
  })
}) 