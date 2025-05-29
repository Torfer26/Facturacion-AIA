import { useState } from 'react';

interface UsePDFOptions {
  onSuccess?: (filename: string) => void;
  onError?: (error: string) => void;
}

export function usePDF(options: UsePDFOptions = {}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadFacturaPDF = async (facturaId: string, facturaNumber: string) => {
    try {
      setIsGenerating(true);
      
      const response = await fetch(`/api/facturas/emitidas/${facturaId}/pdf`);
      
      if (!response.ok) {
        throw new Error('Error al generar el PDF');
      }

      // Crear blob del PDF
      const blob = await response.blob();
      
      // Crear URL temporal
      const url = window.URL.createObjectURL(blob);
      
      // Crear elemento de descarga temporal
      const link = document.createElement('a');
      link.href = url;
      link.download = `Factura_${facturaNumber}.pdf`;
      document.body.appendChild(link);
      
      // Iniciar descarga
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      options.onSuccess?.(`Factura_${facturaNumber}.pdf`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      options.onError?.(errorMessage);
      console.error('Error descargando PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const previewFacturaPDF = (facturaId: string) => {
    try {
      const previewUrl = `/api/facturas/emitidas/${facturaId}/pdf?preview=true`;
      window.open(previewUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      options.onError?.(errorMessage);
      console.error('Error abriendo vista previa:', error);
    }
  };

  return {
    isGenerating,
    downloadFacturaPDF,
    previewFacturaPDF,
  };
} 