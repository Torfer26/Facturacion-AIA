export async function uploadInvoiceToApi(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/facturas/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Error al subir el archivo');
  }

  return data;
}
