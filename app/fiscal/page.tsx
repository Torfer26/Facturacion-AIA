"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MetricasFiscales, VencimientoFiscal } from "@/lib/types/fiscal";

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
      return 'bg-blue-100 text-blue-800';
    case '111':
      return 'bg-green-100 text-green-800';
    case '200':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function FiscalPage() {
  const [metricas, setMetricas] = useState<MetricasFiscales | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetricas() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/fiscal/metricas');
        const data = await response.json();
        
        if (data.success) {
          setMetricas(data.metricas);
        } else {
          setError(data.error || 'Error al cargar las métricas fiscales');
        }
      } catch (err) {
        console.error('Error fetching métricas fiscales:', err);
        setError('Error de conexión al cargar las métricas fiscales');
      } finally {
        setLoading(false);
      }
    }

    fetchMetricas();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Cargando datos fiscales...</h2>
            <p className="text-gray-500">Obteniendo información desde Airtable</p>
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
                Asegúrate de que las tablas fiscales estén configuradas en Airtable:
              </p>
              <ul className="text-sm text-gray-500 list-disc list-inside mb-4">
                <li>Modelo303</li>
                <li>Modelo111</li>
                <li>VencimientosFiscales</li>
                <li>ConfiguracionFiscal</li>
              </ul>
              <Button onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!metricas) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No se encontraron datos fiscales</h2>
          <p className="text-gray-500">No hay información fiscal disponible en Airtable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestión Fiscal</h1>
          <p className="text-gray-500 mt-2">
            Panel de control y gestión de obligaciones fiscales
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Datos sincronizados desde Airtable - Última actualización: {formatDate(metricas.ultimaActualizacion)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard">
            <Button variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Button>
          </Link>
          <Link href="/fiscal/configuracion">
            <Button variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configuración
            </Button>
          </Link>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IVA a Pagar</CardTitle>
            <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(metricas.ivaAPagar)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pendiente de pago
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retenciones</CardTitle>
            <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(metricas.retencionesAPagar)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pendiente de ingreso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendiente</CardTitle>
            <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(metricas.totalObligacionesPendientes)}
            </div>
            <p className="text-xs text-muted-foreground">
              Obligaciones fiscales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Vencimientos</CardTitle>
            <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metricas.proximosVencimientos.length}
            </div>
            <p className="text-xs text-muted-foreground">
              En los próximos 30 días
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas si hay obligaciones vencidas */}
      {metricas.totalObligacionesVencidas > 0 && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">⚠️ Obligaciones Vencidas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              Tienes obligaciones fiscales vencidas por un total de {formatCurrency(metricas.totalObligacionesVencidas)}.
              Revisa el calendario fiscal para más detalles.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Próximos Vencimientos */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Próximos Vencimientos</CardTitle>
        </CardHeader>
        <CardContent>
          {metricas.proximosVencimientos.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay vencimientos próximos en los próximos 30 días
            </p>
          ) : (
            <div className="space-y-4">
              {metricas.proximosVencimientos.map((vencimiento) => (
                <div key={vencimiento.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge className={`${getModeloBadgeColor(vencimiento.modelo)} border-0`}>
                      Modelo {vencimiento.modelo}
                    </Badge>
                    <div>
                      <h4 className="font-semibold">{vencimiento.descripcion}</h4>
                      <p className="text-sm text-gray-500">
                        Vencimiento: {formatDate(vencimiento.fechaVencimiento)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {vencimiento.importe ? formatCurrency(vencimiento.importe) : 'A calcular'}
                    </p>
                    <Badge variant={getEstadoBadgeVariant(vencimiento.estado)}>
                      {vencimiento.estado}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Módulos Fiscales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/fiscal/iva" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-blue-600">Gestión de IVA</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Modelos 303, 390 y libros de IVA
              </p>
              <div className="flex items-center text-sm text-blue-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Acceder al módulo
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/fiscal/retenciones" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-green-600">Retenciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Modelos 111, 115 y certificados
              </p>
              <div className="flex items-center text-sm text-green-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Acceder al módulo
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/fiscal/sociedades" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-purple-600">Impuesto de Sociedades</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Modelo 200 y pagos fraccionados
              </p>
              <div className="flex items-center text-sm text-purple-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Acceder al módulo
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/fiscal/calendario" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-orange-600">Calendario Fiscal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Vencimientos y recordatorios
              </p>
              <div className="flex items-center text-sm text-orange-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Ver calendario
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/fiscal/reportes" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-indigo-600">Reportes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Análisis e informes fiscales
              </p>
              <div className="flex items-center text-sm text-indigo-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Ver reportes
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/fiscal/configuracion" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-gray-600">Configuración</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Datos fiscales y parámetros
              </p>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Configurar
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
} 