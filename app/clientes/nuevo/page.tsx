"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClientes } from "@/lib/hooks/useClientes";
import { Cliente } from "@/lib/types/cliente";

export default function NuevoClientePage() {
  const router = useRouter();
  const { createCliente } = useClientes();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    cifNif: '',
    email: '',
    telefono: '',
    direccion: '',
    codigoPostal: '',
    ciudad: '',
    provincia: '',
    pais: 'España',
    personaContacto: '',
    telefonoContacto: '',
    emailContacto: '',
    tipoCliente: 'Empresa' as const,
    estado: 'Activo' as const,
    formaPago: 'Transferencia' as const,
    diasPago: 30,
    limiteCredito: 0,
    descuentoHabitual: 0,
    notas: ''
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
    setError(null);

    try {
      await createCliente(formData);
      router.push('/clientes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al crear el cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            disabled={loading}
          >
            ← Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Nuevo Cliente</h1>
            <p className="text-gray-500 mt-1">Registra un nuevo cliente en tu base de datos</p>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información Básica */}
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <Label htmlFor="estado">Estado</Label>
                  <Select 
                    value={formData.estado} 
                    onValueChange={(value) => handleInputChange('estado', value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Activo">Activo</SelectItem>
                      <SelectItem value="Inactivo">Inactivo</SelectItem>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Dirección */}
            <Card>
              <CardHeader>
                <CardTitle>Dirección</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="direccion">Dirección</Label>
                  <Textarea
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                    disabled={loading}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="codigoPostal">Código Postal</Label>
                    <Input
                      id="codigoPostal"
                      value={formData.codigoPostal}
                      onChange={(e) => handleInputChange('codigoPostal', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ciudad">Ciudad</Label>
                    <Input
                      id="ciudad"
                      value={formData.ciudad}
                      onChange={(e) => handleInputChange('ciudad', e.target.value)}
                      disabled={loading}
                    />
                  </div>
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
                  <Label htmlFor="pais">País</Label>
                  <Input
                    id="pais"
                    value={formData.pais}
                    onChange={(e) => handleInputChange('pais', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contacto Adicional */}
            <Card>
              <CardHeader>
                <CardTitle>Persona de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="personaContacto">Nombre del Contacto</Label>
                  <Input
                    id="personaContacto"
                    value={formData.personaContacto}
                    onChange={(e) => handleInputChange('personaContacto', e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="telefonoContacto">Teléfono del Contacto</Label>
                  <Input
                    id="telefonoContacto"
                    value={formData.telefonoContacto}
                    onChange={(e) => handleInputChange('telefonoContacto', e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="emailContacto">Email del Contacto</Label>
                  <Input
                    id="emailContacto"
                    type="email"
                    value={formData.emailContacto}
                    onChange={(e) => handleInputChange('emailContacto', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Configuración Comercial */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración Comercial</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div>
                  <Label htmlFor="descuentoHabitual">Descuento Habitual (%)</Label>
                  <Input
                    id="descuentoHabitual"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.descuentoHabitual}
                    onChange={(e) => handleInputChange('descuentoHabitual', parseFloat(e.target.value) || 0)}
                    disabled={loading}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notas */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Notas Adicionales</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notas}
                onChange={(e) => handleInputChange('notas', e.target.value)}
                placeholder="Observaciones, comentarios adicionales..."
                disabled={loading}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-4 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cliente'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 