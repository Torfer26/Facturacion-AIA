"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { VencimientoFiscal } from "@/lib/types/fiscal";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-ES');
}

function getEstadoBadgeVariant(estado: string) {
  switch (estado) {
    case 'pendiente':
      return 'destructive';
    case 'presentado':
      return 'default';
    case 'pagado':
      return 'secondary';
    default:
      return 'outline';
  }
}

function getModeloBadgeColor(modelo: string) {
  switch (modelo) {
    case '303':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case '111':
      return 'bg-green-100 text-green-800 border-green-200';
    case '200':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function calcularDiasRestantes(fechaVencimiento: string): number {
  const hoy = new Date();
  const vencimiento = new Date(fechaVencimiento);
  const diferencia = vencimiento.getTime() - hoy.getTime();
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
}

export default function CalendarioPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [vencimientos, setVencimientos] = useState<VencimientoFiscal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");

  useEffect(() => {
    async function fetchVencimientos() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/fiscal/vencimientos');
        const data = await response.json();
        
        if (data.success) {
          setVencimientos(data.vencimientos);
        } else {
          setError(data.error || 'Error al cargar los vencimientos fiscales');
        }
      } catch (err) {
        console.error('Error fetching vencimientos:', err);
        setError('Error de conexión al cargar los vencimientos fiscales');
      } finally {
        setLoading(false);
      }
    }

    fetchVencimientos();
  }, []);

  // Filtrar vencimientos próximos (30 días)
  const hoy = new Date();
  const fechaLimite = new Date(hoy.getTime() + (30 * 24 * 60 * 60 * 1000));
  
  const proximosVencimientos = vencimientos.filter(v => {
    const fechaVencimiento = new Date(v.fechaVencimiento);
    return fechaVencimiento >= hoy && fechaVencimiento <= fechaLimite;
  }).sort((a, b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime());

  // Filtrar obligaciones vencidas
  const obligacionesVencidas = vencimientos.filter(v => {
    const fechaVencimiento = new Date(v.fechaVencimiento);
    return fechaVencimiento < hoy && v.estado === 'pendiente';
  }).sort((a, b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime());

  // Aplicar filtro de estado
  const vencimientosFiltrados = vencimientos.filter(v => {
    if (filtroEstado === "todos") return true;
    return v.estado === filtroEstado;
  });

  // Estadísticas
  const estadisticas = {
    total: vencimientos.length,
    pendientes: vencimientos.filter(v => v.estado === 'pendiente').length,
    presentados: vencimientos.filter(v => v.estado === 'presentado').length,
    pagados: vencimientos.filter(v => v.estado === 'pagado').length,
    cumplimiento: vencimientos.length > 0 ? 
      ((vencimientos.filter(v => v.estado !== 'pendiente').length / vencimientos.length) * 100).toFixed(1) : 0
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Cargando calendario fiscal...</h2>
            <p className="text-gray-500">Obteniendo vencimientos desde Airtable</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-center items-center min-h-[400px]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Error al cargar datos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{error}</p>
              <p className="text-sm text-gray-500 mb-4">
                Asegúrate de que la tabla 'VencimientosFiscales' esté configurada en Airtable con los campos correctos.
              </p>
              <Button onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Calendario Fiscal</h1>
          <p className="text-gray-500 mt-2">
            Vencimientos y obligaciones fiscales
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Datos sincronizados desde Airtable - {vencimientos.length} vencimientos cargados
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/fiscal">
            <Button variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Gestión Fiscal
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

      {/* Alertas de obligaciones vencidas */}
      {obligacionesVencidas.length > 0 && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">⚠️ Obligaciones Vencidas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">
              Tienes {obligacionesVencidas.length} obligaciones fiscales vencidas que requieren atención inmediata.
            </p>
            <div className="space-y-2">
              {obligacionesVencidas.slice(0, 3).map((vencimiento) => (
                <div key={vencimiento.id} className="flex items-center justify-between bg-white p-3 rounded border-red-200 border">
                  <div className="flex items-center gap-2">
                    <Badge className={getModeloBadgeColor(vencimiento.modelo)}>
                      Modelo {vencimiento.modelo}
                    </Badge>
                    <span className="font-medium">{vencimiento.descripcion}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-red-600 font-semibold">
                      Vencido hace {Math.abs(calcularDiasRestantes(vencimiento.fechaVencimiento))} días
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(vencimiento.fechaVencimiento)}
                    </p>
                  </div>
                </div>
              ))}
              {obligacionesVencidas.length > 3 && (
                <p className="text-red-600 text-sm">
                  ... y {obligacionesVencidas.length - 3} más
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{estadisticas.total}</div>
            <p className="text-xs text-muted-foreground">Total obligaciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{estadisticas.pendientes}</div>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{estadisticas.presentados}</div>
            <p className="text-xs text-muted-foreground">Presentados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{estadisticas.pagados}</div>
            <p className="text-xs text-muted-foreground">Pagados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{estadisticas.cumplimiento}%</div>
            <p className="text-xs text-muted-foreground">Cumplimiento</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendario */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Seleccionar Fecha</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>

        {/* Próximos Vencimientos */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Próximos Vencimientos (30 días)</CardTitle>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendientes</SelectItem>
                  <SelectItem value="presentado">Presentados</SelectItem>
                  <SelectItem value="pagado">Pagados</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {proximosVencimientos.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  {vencimientos.length === 0 ? 
                    'No hay vencimientos fiscales registrados en Airtable' :
                    'No hay vencimientos próximos en los próximos 30 días'
                  }
                </p>
              ) : (
                <div className="space-y-4">
                  {proximosVencimientos.map((vencimiento) => {
                    const diasRestantes = calcularDiasRestantes(vencimiento.fechaVencimiento);
                    return (
                      <div key={vencimiento.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Badge className={getModeloBadgeColor(vencimiento.modelo)}>
                            Modelo {vencimiento.modelo}
                          </Badge>
                          <div>
                            <h4 className="font-semibold">{vencimiento.descripcion}</h4>
                            <p className="text-sm text-gray-500">
                              {vencimiento.periodo && `Periodo: ${vencimiento.periodo}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={getEstadoBadgeVariant(vencimiento.estado)}>
                              {vencimiento.estado}
                            </Badge>
                            <span className={`text-sm font-medium ${
                              diasRestantes <= 7 ? 'text-red-600' : 
                              diasRestantes <= 15 ? 'text-orange-600' : 'text-green-600'
                            }`}>
                              {diasRestantes === 0 ? 'Hoy' : 
                               diasRestantes === 1 ? 'Mañana' : 
                               `${diasRestantes} días`}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {formatDate(vencimiento.fechaVencimiento)}
                          </p>
                          {vencimiento.importe && (
                            <p className="text-sm font-semibold">
                              {formatCurrency(vencimiento.importe)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Todos los Vencimientos */}
          {vencimientosFiltrados.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>
                  Todos los Vencimientos 
                  {filtroEstado !== "todos" && ` (${filtroEstado})`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {vencimientosFiltrados
                    .sort((a, b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime())
                    .map((vencimiento) => (
                    <div key={vencimiento.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <Badge className={getModeloBadgeColor(vencimiento.modelo)}>
                          {vencimiento.modelo}
                        </Badge>
                        <div>
                          <h5 className="font-medium text-sm">{vencimiento.descripcion}</h5>
                          <p className="text-xs text-gray-500">
                            {formatDate(vencimiento.fechaVencimiento)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getEstadoBadgeVariant(vencimiento.estado)}>
                        {vencimiento.estado}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Fechas Clave del Calendario Fiscal Español */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Calendario Fiscal Estándar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded">
              <h4 className="font-semibold text-blue-800 mb-1">1º Trimestre</h4>
              <p className="text-sm text-blue-600">IVA (303): 20 de abril</p>
              <p className="text-sm text-blue-600">IRPF (111): 20 de abril</p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <h4 className="font-semibold text-green-800 mb-1">2º Trimestre</h4>
              <p className="text-sm text-green-600">IVA (303): 20 de julio</p>
              <p className="text-sm text-green-600">IRPF (111): 20 de julio</p>
              <p className="text-sm text-green-600">Sociedades (200): 25 de julio</p>
            </div>
            <div className="bg-orange-50 p-3 rounded">
              <h4 className="font-semibold text-orange-800 mb-1">3º Trimestre</h4>
              <p className="text-sm text-orange-600">IVA (303): 20 de octubre</p>
              <p className="text-sm text-orange-600">IRPF (111): 20 de octubre</p>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <h4 className="font-semibold text-purple-800 mb-1">4º Trimestre</h4>
              <p className="text-sm text-purple-600">IVA (303): 30 de enero</p>
              <p className="text-sm text-purple-600">IRPF (111): 30 de enero</p>
              <p className="text-sm text-purple-600">IVA Anual (390): 30 de enero</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 