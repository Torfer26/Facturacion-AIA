import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

const ALLOWED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png']
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>
}

export function FileUpload({ onUpload }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    try {
      setIsUploading(true)
      await onUpload(file)
      toast({
        title: "Archivo subido",
        description: "La factura se ha subido correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al subir el archivo.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }, [onUpload, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  })

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-colors duration-200 ease-in-out
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} data-testid="file-input" disabled={isUploading} />
      <div className="flex flex-col items-center gap-4">
        <Upload className="h-8 w-8 text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {isUploading ? 'Subiendo archivo...' : 'Arrastra y suelta tu factura aquí'}
          </p>
          <p className="text-xs text-muted-foreground">
            o haz clic para seleccionar
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          PDF, JPG o PNG (máx. 10MB)
        </p>
      </div>
    </div>
  )
} 