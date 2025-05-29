"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

export default function NuevoModelo303Page() {
  const [formData, setFormData] = useState({
    ejercicio: new Date().getFullYear(),
    trimestre: 1,
    estado: 'borrador',
    ventasExentas: 0,
    ventasGravadas21: 0,
    ivaRepercutido21: 0,
    ventasGravadas10: 0,
    ivaRepercutido10: 0,
    ventasGravadas4: 0,
    ivaRepercutido4: 0,
    comprasGravadas21: 0,
    ivaSoportado21: 0,
    comprasGravadas10: 0,
    ivaSoportado10: 0,
    comprasGravadas4: 0,
    ivaSoportado4: 0,
    compensacionesAnterior: 0,
    observaciones: ''
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await fetch('/api/fiscal/modelo303', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Modelo 303 creado exitosamente');
        // Redirigir a la página de IVA
        window.location.href = '/fiscal/iva';
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert('Error de conexión al crear el modelo');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calcular totales automáticamente
  const totalIvaRepercutido = formData.ivaRepercutido21 + formData.ivaRepercutido10 + formData.ivaRepercutido4;
  const totalIvaSoportado = formData.ivaSoportado21 + formData.ivaSoportado10 + formData.ivaSoportado4;
  const diferenciaIva = totalIvaRepercutido - totalIvaSoportado;
  const resultadoLiquidacion = diferenciaIva - formData.compensacionesAnterior;

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Nuevo Modelo 303</h1>
          <p className="text-gray-500 mt-2">
            Declaración trimestral de IVA
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/fiscal/iva">
            <Button variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a IVA
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos básicos */}
        <Card>
          <CardHeader>
            <CardTitle>Datos Básicos</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Ejercicio</label>
              <Input
                type="number"
                value={formData.ejercicio}
                onChange={(e) => handleInputChange('ejercicio', parseInt(e.target.value))}
                min="2020"
                max="2030"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Trimestre</label>
              <Select value={formData.trimestre.toString()} onValueChange={(value) => handleInputChange('trimestre', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1º Trimestre</SelectItem>
                  <SelectItem value="2">2º Trimestre</SelectItem>
                  <SelectItem value="3">3º Trimestre</SelectItem>
                  <SelectItem value="4">4º Trimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Estado</label>
              <Select value={formData.estado} onValueChange={(value) => handleInputChange('estado', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="borrador">Borrador</SelectItem>
                  <SelectItem value="presentado">Presentado</SelectItem>
                  <SelectItem value="rectificativa">Rectificativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* IVA Repercutido */}
        <Card>
          <CardHeader>
            <CardTitle>IVA Repercutido (Ventas)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ventas Exentas</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.ventasExentas}
                  onChange={(e) => handleInputChange('ventasExentas', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Base Imponible 21%</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.ventasGravadas21}
                  onChange={(e) => handleInputChange('ventasGravadas21', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">IVA 21%</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.ivaRepercutido21}
                  onChange={(e) => handleInputChange('ivaRepercutido21', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="flex items-center pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleInputChange('ivaRepercutido21', formData.ventasGravadas21 * 0.21)}
                >
                  Calcular IVA
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Base Imponible 10%</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.ventasGravadas10}
                  onChange={(e) => handleInputChange('ventasGravadas10', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">IVA 10%</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.ivaRepercutido10}
                  onChange={(e) => handleInputChange('ivaRepercutido10', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="flex items-center pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleInputChange('ivaRepercutido10', formData.ventasGravadas10 * 0.10)}
                >
                  Calcular IVA
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Base Imponible 4%</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.ventasGravadas4}
                  onChange={(e) => handleInputChange('ventasGravadas4', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">IVA 4%</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.ivaRepercutido4}
                  onChange={(e) => handleInputChange('ivaRepercutido4', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="flex items-center pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleInputChange('ivaRepercutido4', formData.ventasGravadas4 * 0.04)}
                >
                  Calcular IVA
                </Button>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded">
              <p className="font-semibold text-green-800">
                Total IVA Repercutido: €{totalIvaRepercutido.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* IVA Soportado */}
        <Card>
          <CardHeader>
            <CardTitle>IVA Soportado (Compras)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Base Imponible 21%</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.comprasGravadas21}
                  onChange={(e) => handleInputChange('comprasGravadas21', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">IVA 21%</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.ivaSoportado21}
                  onChange={(e) => handleInputChange('ivaSoportado21', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="flex items-center pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleInputChange('ivaSoportado21', formData.comprasGravadas21 * 0.21)}
                >
                  Calcular IVA
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Base Imponible 10%</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.comprasGravadas10}
                  onChange={(e) => handleInputChange('comprasGravadas10', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">IVA 10%</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.ivaSoportado10}
                  onChange={(e) => handleInputChange('ivaSoportado10', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="flex items-center pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleInputChange('ivaSoportado10', formData.comprasGravadas10 * 0.10)}
                >
                  Calcular IVA
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Base Imponible 4%</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.comprasGravadas4}
                  onChange={(e) => handleInputChange('comprasGravadas4', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">IVA 4%</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.ivaSoportado4}
                  onChange={(e) => handleInputChange('ivaSoportado4', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="flex items-center pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleInputChange('ivaSoportado4', formData.comprasGravadas4 * 0.04)}
                >
                  Calcular IVA
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded">
              <p className="font-semibold text-blue-800">
                Total IVA Soportado: €{totalIvaSoportado.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Resultado */}
        <Card>
          <CardHeader>
            <CardTitle>Resultado de la Liquidación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Compensaciones de Períodos Anteriores</label>
              <Input
                type="number"
                step="0.01"
                value={formData.compensacionesAnterior}
                onChange={(e) => handleInputChange('compensacionesAnterior', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded space-y-2">
              <p className="text-sm text-gray-600">Diferencia (Repercutido - Soportado): €{diferenciaIva.toFixed(2)}</p>
              <p className="text-lg font-bold">
                Resultado Final: 
                <span className={resultadoLiquidacion >= 0 ? 'text-red-600' : 'text-green-600'}>
                  €{resultadoLiquidacion.toFixed(2)}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                {resultadoLiquidacion >= 0 ? 'A ingresar' : 'A devolver'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Observaciones</label>
              <Textarea
                value={formData.observaciones}
                onChange={(e) => handleInputChange('observaciones', e.target.value)}
                placeholder="Observaciones adicionales..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4">
          <Link href="/fiscal/iva">
            <Button variant="outline" disabled={saving}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Crear Modelo 303'}
          </Button>
        </div>
      </form>
    </div>
  );
} 