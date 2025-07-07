import { render, screen, fireEvent, act } from '@testing-library/react'
import { FileUpload } from '../FileUpload'

const mockToast = jest.fn((opts: { description: string }) => {
  const div = document.createElement('div')
  div.textContent = opts.description
  document.body.appendChild(div)
})

jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}))

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

  it('shows error toast on upload failure', async () => {
    mockOnUpload.mockRejectedValue(new Error('fail'))
    render(<FileUpload onUpload={mockOnUpload} />)

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    const input = screen.getByTestId('file-input')

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } })
    })

    expect(await screen.findByText('Ha ocurrido un error al subir el archivo.')).toBeInTheDocument()
  })
})
