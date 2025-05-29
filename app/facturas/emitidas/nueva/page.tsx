"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useClientes } from "@/lib/hooks/useClientes"
import { useEmpresaProfile } from "@/lib/hooks/useEmpresaProfile"
import { useToast } from "@/components/ui/toast"
import { Cliente } from "@/lib/types/cliente"
import { Badge } from "@/components/ui/badge"

export default function NuevaFacturaEmitidaPage() {
  const router = useRouter();
  const { clientes, loading: loadingClientes } = useClientes();
  const { empresa, empresas, loading: loadingEmpresa, isConfigured, selectEmpresa } = useEmpresaProfile();
  const { showToast, ToastComponent } = useToast();
  
  const [selectedClienteId, setSelectedClienteId] = useState<string>("");
  const [showNewClienteForm, setShowNewClienteForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    CreationDate: new Date().toISOString().split('T')[0],
    Fechavencimiento: "",
    Nombrecliente: "",
    CIFcliente: "",
    direccioncliente: "",
    Productofactura: [{ descripcion: "", cantidad: 1, precioUnitario: 0 }],
    subtotal: 0,
    tipoiva: 21,
    total: 0,
    estadofactura: "registrada",
    datosbancarios: ""
  });

  const [newCliente, setNewCliente] = useState({
    nombre: "",
    cifNif: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    provincia: "",
    codigoPostal: "",
    pais: "España"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔍 DEBUGGING temporal
  console.log('🔍 Nueva Factura - Estado empresa:', {
    empresa: empresa,
    loadingEmpresa: loadingEmpresa,
    isConfigured: isConfigured,
    empresaNombre: empresa?.nombre
  });

  // Forzar carga de empresa si no se ha cargado
  useEffect(() => {
    console.log('🔍 UseEffect empresa - estado actual:', { empresa, loadingEmpresa });
  }, [empresa, loadingEmpresa]);

  // Calcular fechas automáticamente
  useEffect(() => {
    if (formData.CreationDate && selectedClienteId) {
      const cliente = clientes.find(c => c.id === selectedClienteId);
      if (cliente?.diasPago) {
        const fechaCreacion = new Date(formData.CreationDate);
        const fechaVencimiento = new Date(fechaCreacion);
        fechaVencimiento.setDate(fechaCreacion.getDate() + cliente.diasPago);
        
        setFormData(prev => ({
          ...prev,
          Fechavencimiento: fechaVencimiento.toISOString().split('T')[0]
        }));
      }
    }
  }, [formData.CreationDate, selectedClienteId, clientes]);

  // Calcular totales automáticamente
  useEffect(() => {
    const subtotal = formData.Productofactura.reduce((acc, producto) => 
      acc + (producto.cantidad * producto.precioUnitario), 0
    );
    const ivaAmount = subtotal * (formData.tipoiva / 100);
    const total = subtotal + ivaAmount;

    setFormData(prev => ({
      ...prev,
      subtotal: Math.round(subtotal * 100) / 100,
      total: Math.round(total * 100) / 100
    }));
  }, [formData.Productofactura, formData.tipoiva]);

  const filteredClientes = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cifNif.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClienteSelect = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (cliente) {
      setSelectedClienteId(clienteId);
      setFormData(prev => ({
        ...prev,
        Nombrecliente: cliente.nombre,
        CIFcliente: cliente.cifNif,
        direccioncliente: `${cliente.direccion || ''}${cliente.ciudad ? `, ${cliente.ciudad}` : ''}${cliente.provincia ? `, ${cliente.provincia}` : ''}${cliente.codigoPostal ? ` ${cliente.codigoPostal}` : ''}`
      }));
      setShowNewClienteForm(false);
    }
  };

  const handleProductoChange = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      Productofactura: prev.Productofactura.map((producto, i) =>
        i === index ? { ...producto, [field]: value } : producto
      )
    }));
  };

  const addProducto = () => {
    setFormData(prev => ({
      ...prev,
      Productofactura: [...prev.Productofactura, { descripcion: "", cantidad: 1, precioUnitario: 0 }]
    }));
  };

  const removeProducto = (index: number) => {
    if (formData.Productofactura.length > 1) {
      setFormData(prev => ({
        ...prev,
        Productofactura: prev.Productofactura.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Preparar datos para envío
      const facturaData = {
        ...formData,
        Productofactura: JSON.stringify(formData.Productofactura),
        cantidadproducto: formData.Productofactura.reduce((acc, p) => acc + p.cantidad, 0)
      };

      const res = await fetch("/api/facturas/emitidas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(facturaData),
      });
      
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Error al crear la factura");
      
      showToast("Factura creada exitosamente", "success");
      router.push("/facturas/emitidas");
    } catch (err: any) {
      setError(err.message);
      showToast(`Error: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      {ToastComponent}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Nueva Factura Emitida</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/facturas/emitidas")}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Facturas Emitidas
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información de Empresa Emisora */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              🏢 Empresa Emisora
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.push("/empresa/perfil")}
              >
                Configurar Empresa
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingEmpresa ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Cargando información de empresa...</span>
              </div>
            ) : empresas.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="font-medium text-yellow-800">No hay empresas configuradas</p>
                    <p className="text-yellow-700 text-sm">
                      Para generar facturas profesionales, configura los datos de tu empresa primero.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selector de empresa */}
                <div>
                  <Label htmlFor="selectEmpresa">Seleccionar Empresa Emisora</Label>
                  <div className="space-y-2">
                    {empresas.map((emp) => (
                      <div
                        key={emp.id}
                        className={`p-3 rounded cursor-pointer border transition-all ${
                          empresa?.id === emp.id 
                            ? 'bg-blue-50 border-blue-300' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => selectEmpresa(emp.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{emp.nombre}</p>
                            <p className="text-sm text-gray-600">CIF: {emp.cif}</p>
                            <p className="text-sm text-gray-500">{emp.ciudad}, {emp.provincia}</p>
                          </div>
                          <Badge variant={empresa?.id === emp.id ? 'default' : 'secondary'}>
                            {empresa?.id === emp.id ? 'Seleccionada' : 'Disponible'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Información de la empresa seleccionada */}
                {empresa && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium text-green-800">{empresa.nombre}</p>
                        <p className="text-green-700 text-sm">CIF: {empresa.cif}</p>
                        <p className="text-green-600 text-sm">{empresa.direccion}</p>
                        {empresa.ciudad && (
                          <p className="text-green-600 text-sm">
                            {empresa.codigoPostal} {empresa.ciudad}, {empresa.provincia}
                          </p>
                        )}
                      </div>
                      <div>
                        {empresa.telefono && (
                          <p className="text-green-600 text-sm">📞 {empresa.telefono}</p>
                        )}
                        {empresa.email && (
                          <p className="text-green-600 text-sm">📧 {empresa.email}</p>
                        )}
                        {empresa.web && (
                          <p className="text-green-600 text-sm">🌐 {empresa.web}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <Badge variant="default" className="bg-green-600">
                        ✅ Empresa seleccionada
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fechas */}
        <Card>
          <CardHeader>
            <CardTitle>📅 Información de Fechas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="CreationDate">Fecha de Creación *</Label>
                <Input
                  type="date"
                  id="CreationDate"
                  value={formData.CreationDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, CreationDate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="Fechavencimiento">Fecha de Vencimiento *</Label>
                <Input
                  type="date"
                  id="Fechavencimiento"
                  value={formData.Fechavencimiento}
                  onChange={(e) => setFormData(prev => ({ ...prev, Fechavencimiento: e.target.value }))}
                  required
                />
                {selectedClienteId && (
                  <p className="text-sm text-gray-500 mt-1">
                    Se calculó automáticamente según los días de pago del cliente
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selección de Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              👤 Datos del Cliente
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowNewClienteForm(!showNewClienteForm)}
              >
                {showNewClienteForm ? "Cancelar" : "Nuevo Cliente"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showNewClienteForm ? (
              <>
                <div>
                  <Label htmlFor="searchCliente">Buscar Cliente Existente</Label>
                  <Input
                    id="searchCliente"
                    placeholder="Buscar por nombre, CIF o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {loadingClientes ? (
                  <p>Cargando clientes...</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-2">
                    {filteredClientes.map((cliente) => (
                      <div
                        key={cliente.id}
                        className={`p-3 rounded cursor-pointer border transition-all ${
                          selectedClienteId === cliente.id 
                            ? 'bg-blue-50 border-blue-300' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => handleClienteSelect(cliente.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{cliente.nombre}</p>
                            <p className="text-sm text-gray-600">{cliente.cifNif}</p>
                            <p className="text-sm text-gray-500">{cliente.email}</p>
                          </div>
                          <Badge variant={cliente.estado === 'Activo' ? 'default' : 'secondary'}>
                            {cliente.estado}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {filteredClientes.length === 0 && searchTerm && (
                      <p className="text-center text-gray-500 py-4">
                        No se encontraron clientes. ¿Quieres crear uno nuevo?
                      </p>
                    )}
                  </div>
                )}

                {selectedClienteId && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-green-800 font-medium">✅ Cliente seleccionado:</p>
                    <p className="text-green-700">{formData.Nombrecliente}</p>
                    <p className="text-green-600 text-sm">{formData.CIFcliente}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4 bg-yellow-50 p-4 rounded-lg border">
                <p className="font-medium text-yellow-800">🆕 Crear Nuevo Cliente</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nuevoNombre">Nombre/Razón Social *</Label>
                    <Input
                      id="nuevoNombre"
                      value={newCliente.nombre}
                      onChange={(e) => {
                        setNewCliente(prev => ({ ...prev, nombre: e.target.value }));
                        setFormData(prev => ({ ...prev, Nombrecliente: e.target.value }));
                      }}
                      required={showNewClienteForm}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nuevoCIF">CIF/NIF *</Label>
                    <Input
                      id="nuevoCIF"
                      value={newCliente.cifNif}
                      onChange={(e) => {
                        setNewCliente(prev => ({ ...prev, cifNif: e.target.value }));
                        setFormData(prev => ({ ...prev, CIFcliente: e.target.value }));
                      }}
                      required={showNewClienteForm}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nuevoEmail">Email *</Label>
                    <Input
                      id="nuevoEmail"
                      type="email"
                      value={newCliente.email}
                      onChange={(e) => setNewCliente(prev => ({ ...prev, email: e.target.value }))}
                      required={showNewClienteForm}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nuevoTelefono">Teléfono</Label>
                    <Input
                      id="nuevoTelefono"
                      value={newCliente.telefono}
                      onChange={(e) => setNewCliente(prev => ({ ...prev, telefono: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="nuevaDireccion">Dirección *</Label>
                    <Input
                      id="nuevaDireccion"
                      value={newCliente.direccion}
                      onChange={(e) => {
                        setNewCliente(prev => ({ ...prev, direccion: e.target.value }));
                        setFormData(prev => ({ ...prev, direccioncliente: e.target.value }));
                      }}
                      required={showNewClienteForm}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Productos/Servicios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              📦 Productos/Servicios
              <Button type="button" onClick={addProducto} variant="outline" size="sm">
                + Añadir Línea
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formData.Productofactura.map((producto, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg">
                  <div className="col-span-5">
                    <Label>Descripción</Label>
                    <Input
                      value={producto.descripcion}
                      onChange={(e) => handleProductoChange(index, 'descripcion', e.target.value)}
                      placeholder="Descripción del producto/servicio"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Cantidad</Label>
                    <Input
                      type="number"
                      min="1"
                      value={producto.cantidad}
                      onChange={(e) => handleProductoChange(index, 'cantidad', parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Precio Unit. (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={producto.precioUnitario}
                      onChange={(e) => handleProductoChange(index, 'precioUnitario', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Total</Label>
                    <Input
                      value={`${(producto.cantidad * producto.precioUnitario).toFixed(2)} €`}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="col-span-1">
                    {formData.Productofactura.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeProducto(index)}
                      >
                        🗑️
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Totales y Configuración */}
        <Card>
          <CardHeader>
            <CardTitle>💰 Totales y Configuración</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <Label>Tipo IVA (%)</Label>
                <Select
                  value={formData.tipoiva.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, tipoiva: parseFloat(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0% (Exento)</SelectItem>
                    <SelectItem value="4">4% (Superreducido)</SelectItem>
                    <SelectItem value="10">10% (Reducido)</SelectItem>
                    <SelectItem value="21">21% (General)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estado de la Factura</Label>
                <Select
                  value={formData.estadofactura}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, estadofactura: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="registrada">Registrada</SelectItem>
                    <SelectItem value="pdfgenerado">PDF Generado</SelectItem>
                    <SelectItem value="enviada">Enviada</SelectItem>
                    <SelectItem value="cobrada">Cobrada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Datos Bancarios</Label>
              <Textarea
                value={formData.datosbancarios}
                onChange={(e) => setFormData(prev => ({ ...prev, datosbancarios: e.target.value }))}
                placeholder="IBAN: ES91 2100 0418 4502 0005 1332&#10;Banco: La Caixa&#10;Titular: Tu Empresa S.L."
                rows={3}
              />
            </div>

            {/* Resumen de Totales */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">📊 Resumen de Totales</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal (sin IVA):</span>
                  <span className="font-medium">{formData.subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA ({formData.tipoiva}%):</span>
                  <span className="font-medium">{((formData.total - formData.subtotal)).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>TOTAL:</span>
                  <span>{formData.total.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.push("/facturas/emitidas")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creando..." : "Crear Factura"}
          </Button>
        </div>
      </form>
    </div>
  );
}
