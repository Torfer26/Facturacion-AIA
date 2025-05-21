'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { CreateIssuedInvoiceDTO } from '@/lib/types';
import { useIssuedInvoices } from '@/lib/hooks/useIssuedInvoices';

export function IssuedInvoiceForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { createInvoice } = useIssuedInvoices();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Omit<CreateIssuedInvoiceDTO, 'id' | 'facturaID'>>({
    creationDate: new Date().toISOString().split('T')[0],
    fechavencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    nombrecliente: '',
    CIFcliente: '',
    direccioncliente: '',
    productofactura: [{ descripcion: '', cantidad: 1, precioUnitario: 0 }],
    catidadproducto: 0,
    subtotal: 0,
    tipoiva: 21,
    total: 0,
    estadofactura: 'registrada',
    datosbancarios: '',
  });

  const calculateTotals = (products: typeof formData.productofactura) => {
    const subtotal = products.reduce((acc, product) => {
      return acc + (product.cantidad * product.precioUnitario);
    }, 0);
    const total = subtotal * (1 + formData.tipoiva / 100);
    return { subtotal, total };
  };

  const handleProductChange = (index: number, field: keyof typeof formData.productofactura[0], value: string | number) => {
    const newProducts = [...formData.productofactura];
    newProducts[index] = {
      ...newProducts[index],
      [field]: field === 'descripcion' ? value : Number(value),
    };

    const { subtotal, total } = calculateTotals(newProducts);

    setFormData(prev => ({
      ...prev,
      productofactura: newProducts,
      subtotal,
      total,
      catidadproducto: newProducts.reduce((acc, product) => acc + product.cantidad, 0),
    }));
  };

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      productofactura: [...prev.productofactura, { descripcion: '', cantidad: 1, precioUnitario: 0 }],
    }));
  };

  const removeProduct = (index: number) => {
    const newProducts = formData.productofactura.filter((_, i) => i !== index);
    const { subtotal, total } = calculateTotals(newProducts);

    setFormData(prev => ({
      ...prev,
      productofactura: newProducts,
      subtotal,
      total,
      catidadproducto: newProducts.reduce((acc, product) => acc + product.cantidad, 0),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Submitting form with data:', formData);
      const newInvoice = await createInvoice(formData);
      console.log('Created invoice:', newInvoice);
      toast({
        title: 'Éxito',
        description: 'Factura creada correctamente',
      });
      router.push('/facturas/emitidas');
    } catch (error) {
      console.error('Error while creating invoice:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la factura',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Datos del Cliente</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombrecliente">Nombre del Cliente</Label>
              <Input
                id="nombrecliente"
                value={formData.nombrecliente}
                onChange={(e) => setFormData(prev => ({ ...prev, nombrecliente: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="CIFcliente">CIF/NIF</Label>
              <Input
                id="CIFcliente"
                value={formData.CIFcliente}
                onChange={(e) => setFormData(prev => ({ ...prev, CIFcliente: e.target.value }))}
                required
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="direccioncliente">Dirección</Label>
              <Input
                id="direccioncliente"
                value={formData.direccioncliente}
                onChange={(e) => setFormData(prev => ({ ...prev, direccioncliente: e.target.value }))}
                required
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Productos/Servicios</h2>
            <Button type="button" variant="outline" onClick={addProduct}>
              <Plus className="w-4 h-4 mr-2" />
              Añadir Producto
            </Button>
          </div>
          
          {formData.productofactura.map((product, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-end border-b pb-4">
              <div className="col-span-6 space-y-2">
                <Label htmlFor={`descripcion-${index}`}>Descripción</Label>
                <Input
                  id={`descripcion-${index}`}
                  value={product.descripcion}
                  onChange={(e) => handleProductChange(index, 'descripcion', e.target.value)}
                  required
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor={`cantidad-${index}`}>Cantidad</Label>
                <Input
                  id={`cantidad-${index}`}
                  type="number"
                  min="1"
                  value={product.cantidad}
                  onChange={(e) => handleProductChange(index, 'cantidad', e.target.value)}
                  required
                />
              </div>
              <div className="col-span-3 space-y-2">
                <Label htmlFor={`precioUnitario-${index}`}>Precio Unitario</Label>
                <Input
                  id={`precioUnitario-${index}`}
                  type="number"
                  step="0.01"
                  min="0"
                  value={product.precioUnitario}
                  onChange={(e) => handleProductChange(index, 'precio', e.target.value)}
                  required
                />
              </div>
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeProduct(index)}
                  disabled={formData.productofactura.length === 1}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="tipoiva">Tipo de IVA (%)</Label>
              <Input
                id="tipoiva"
                type="number"
                min="0"
                max="100"
                value={formData.tipoiva}
                onChange={(e) => {
                  const tipoiva = Number(e.target.value);
                  const { subtotal, total } = calculateTotals(formData.productofactura);
                  setFormData(prev => ({ ...prev, tipoiva, subtotal, total }));
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="datosbancarios">Datos Bancarios</Label>
              <Input
                id="datosbancarios"
                value={formData.datosbancarios}
                onChange={(e) => setFormData(prev => ({ ...prev, datosbancarios: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Subtotal</Label>
              <Input type="number" name="subtotal" value={formData.subtotal.toFixed(2)} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Total</Label>
              <Input type="number" name="total" value={formData.total.toFixed(2)} readOnly />
            </div>
          </div>

          <div className="flex justify-end text-lg font-semibold mt-4">
            <div>IVA ({formData.tipoiva}%): {(formData.total - formData.subtotal).toFixed(2)}€</div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/facturas/emitidas')}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creando...' : 'Crear Factura'}
        </Button>
      </div>
    </form>
  );
} 