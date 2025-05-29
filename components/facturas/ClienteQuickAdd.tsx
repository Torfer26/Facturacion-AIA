"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClientes } from "@/lib/hooks/useClientes";
import { useToast } from "@/components/ui/toast";
import { Cliente } from "@/lib/types/cliente";

interface ClienteQuickAddProps {
  onClienteCreated: (cliente: Cliente) => void;
  trigger?: React.ReactNode;
}

export function ClienteQuickAdd({ onClienteCreated, trigger }: ClienteQuickAddProps) {
  const { createCliente } = useClientes();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    cifNif: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    provincia: "",
    codigoPostal: "",
    pais: "España",
    tipoCliente: "Empresa" as const,
    estado: "Activo" as const,
    formaPago: "Transferencia" as const,
    diasPago: 30,
    limiteCredito: 0,
    descuentoHabitual: 0,
    notas: ""
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createCliente(formData);
      
      // Crear objeto cliente mock para uso inmediato
      const newCliente: Cliente = {
        id: `temp-${Date.now()}`, // ID temporal
        ...formData,
        fechaAlta: new Date().toISOString(),
        ultimaFactura: null,
        totalFacturado: 0,
        numeroFacturas: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      onClienteCreated(newCliente);
      showToast("Cliente creado exitosamente", "success");
      setOpen(false);
      
      // Reset form
      setFormData({
        nombre: "",
        cifNif: "",
        email: "",
        telefono: "",
        direccion: "",
        ciudad: "",
        provincia: "",
        codigoPostal: "",
        pais: "España",
        tipoCliente: "Empresa",
        estado: "Activo",
        formaPago: "Transferencia",
        diasPago: 30,
        limiteCredito: 0,
        descuentoHabitual: 0,
        notas: ""
      });
    } catch (error) {
      showToast(
        `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`, 
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button type="button" variant="outline">
            + Nuevo Cliente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🆕 Crear Nuevo Cliente</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información Básica */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre/Razón Social *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="cifNif">CIF/NIF *</Label>
              <Input
                id="cifNif"
                value={formData.cifNif}
                onChange={(e) => handleInputChange('cifNif', e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Contacto */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Dirección */}
          <div>
            <Label htmlFor="direccion">Dirección *</Label>
            <Input
              id="direccion"
              value={formData.direccion}
              onChange={(e) => handleInputChange('direccion', e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="ciudad">Ciudad</Label>
              <Input
                id="ciudad"
                value={formData.ciudad}
                onChange={(e) => handleInputChange('ciudad', e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="provincia">Provincia</Label>
              <Input
                id="provincia"
                value={formData.provincia}
                onChange={(e) => handleInputChange('provincia', e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="codigoPostal">Código Postal</Label>
              <Input
                id="codigoPostal"
                value={formData.codigoPostal}
                onChange={(e) => handleInputChange('codigoPostal', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Configuración Comercial */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipoCliente">Tipo de Cliente</Label>
              <Select 
                value={formData.tipoCliente} 
                onValueChange={(value) => handleInputChange('tipoCliente', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Empresa">Empresa</SelectItem>
                  <SelectItem value="Autónomo">Autónomo</SelectItem>
                  <SelectItem value="Particular">Particular</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="formaPago">Forma de Pago</Label>
              <Select 
                value={formData.formaPago} 
                onValueChange={(value) => handleInputChange('formaPago', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Transferencia">Transferencia</SelectItem>
                  <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="Efectivo">Efectivo</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="diasPago">Días de Pago</Label>
              <Input
                id="diasPago"
                type="number"
                value={formData.diasPago}
                onChange={(e) => handleInputChange('diasPago', parseInt(e.target.value) || 0)}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="limiteCredito">Límite de Crédito (€)</Label>
              <Input
                id="limiteCredito"
                type="number"
                step="0.01"
                value={formData.limiteCredito}
                onChange={(e) => handleInputChange('limiteCredito', parseFloat(e.target.value) || 0)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Cliente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 