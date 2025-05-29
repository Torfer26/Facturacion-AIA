"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Modelo111 } from "@/lib/types/fiscal";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

function formatDate(dateString: string) {
  if (!dateString) return 'No especificada';
  return new Date(dateString).toLocaleDateString('es-ES');
}

function getEstadoBadgeVariant(estado: string) {
  switch (estado) {
    case 'borrador':
      return 'outline';
    case 'presentado':
      return 'default';
    case 'rectificativa':
      return 'destructive';
    default:
      return 'outline';
  }
}

export default function RetencionesPage() {
  const [modelos111, setModelos111] = useState<Modelo111[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModelos111() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/fiscal/modelo111');
        const data = await response.json();
        
        if (data.success) {
          setModelos111(data.modelos);
        } else {
          setError(data.error || 'Error al cargar los modelos 111');
        }
      } catch (err) {
        console.error('Error fetching modelos 111:', err);
        setError('Error de conexión al cargar los modelos 111');
      } finally {
        setLoading(false);
      }
    }

    fetchModelos111();
  }, []);

  // Calcular resumen anual
  const ejercicioActual = new Date().getFullYear();
  const modelos111Actuales = modelos111.filter(m => m.ejercicio === ejercicioActual);
  
  const resumenAnual = {
    trabajo: {
      perceptores: modelos111Actuales.reduce((sum, m) => sum + m.numeroPerceptoresTrabajo, 0),
      importe: modelos111Actuales.reduce((sum, m) => sum + m.importeRetribucionesTrabajo, 0),
      retenciones: modelos111Actuales.reduce((sum, m) => sum + m.retencionesIngresadasTrabajo, 0)
    },
    profesional: {
      perceptores: modelos111Actuales.reduce((sum, m) => sum + m.numeroPerceptoresProfesional, 0),
      importe: modelos111Actuales.reduce((sum, m) => sum + m.importeRetribucionesProfesional, 0),
      retenciones: modelos111Actuales.reduce((sum, m) => sum + m.retencionesIngresadasProfesional, 0)
    },
    premios: {
      perceptores: modelos111Actuales.reduce((sum, m) => sum + m.numeroPerceptoresPremios, 0),
      importe: modelos111Actuales.reduce((sum, m) => sum + m.importePremios, 0),
      retenciones: modelos111Actuales.reduce((sum, m) => sum + m.retencionesIngresadasPremios, 0)
    },
    total: modelos111Actuales.reduce((sum, m) => sum + m.totalRetenciones, 0)
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Cargando datos de retenciones...</h2>
            <p className="text-gray-500">Obteniendo modelos 111 desde Airtable</p>
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
                Asegúrate de que la tabla 'Modelo111' esté configurada en Airtable con los campos correctos.
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
          <h1 className="text-3xl font-bold">Gestión de Retenciones</h1>
          <p className="text-gray-500 mt-2">
            Modelos 111 trimestrales - Retenciones e ingresos a cuenta
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Datos sincronizados desde Airtable - {modelos111.length} modelos cargados
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/fiscal/retenciones/nuevo">
            <Button>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Modelo 111
            </Button>
          </Link>
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

      {/* Resumen Anual */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Resumen Anual {ejercicioActual}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Rendimientos del Trabajo</h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  {resumenAnual.trabajo.perceptores} perceptores
                </p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(resumenAnual.trabajo.importe)}
                </p>
                <p className="text-sm text-blue-800">
                  Retenciones: {formatCurrency(resumenAnual.trabajo.retenciones)}
                </p>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Actividades Profesionales</h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  {resumenAnual.profesional.perceptores} perceptores
                </p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(resumenAnual.profesional.importe)}
                </p>
                <p className="text-sm text-green-800">
                  Retenciones: {formatCurrency(resumenAnual.profesional.retenciones)}
                </p>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">Premios</h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  {resumenAnual.premios.perceptores} perceptores
                </p>
                <p className="text-lg font-bold text-purple-600">
                  {formatCurrency(resumenAnual.premios.importe)}
                </p>
                <p className="text-sm text-purple-800">
                  Retenciones: {formatCurrency(resumenAnual.premios.retenciones)}
                </p>
              </div>
            </div>
          </div>

          <div className="text-center bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Total Retenciones Anuales</h3>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(resumenAnual.total)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Modelos 111 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Declaraciones Trimestrales</CardTitle>
        </CardHeader>
        <CardContent>
          {modelos111.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No hay modelos 111 registrados</p>
              <Link href="/fiscal/retenciones/nuevo">
                <Button>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear primer modelo 111
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {modelos111
                .sort((a, b) => b.ejercicio - a.ejercicio || b.trimestre - a.trimestre)
                .map((modelo) => (
                <div key={modelo.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant={getEstadoBadgeVariant(modelo.estado)}>
                      {modelo.estado}
                    </Badge>
                    <div>
                      <h4 className="font-semibold">
                        Modelo 111 - {modelo.ejercicio} T{modelo.trimestre}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {modelo.fechaPresentacion ? 
                          `Presentado: ${formatDate(modelo.fechaPresentacion)}` : 
                          'Sin presentar'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Trabajo</p>
                        <p className="font-semibold text-blue-600">
                          {formatCurrency(modelo.retencionesIngresadasTrabajo)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Profesional</p>
                        <p className="font-semibold text-green-600">
                          {formatCurrency(modelo.retencionesIngresadasProfesional)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total</p>
                        <p className="font-semibold text-purple-600">
                          {formatCurrency(modelo.totalRetenciones)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accesos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/fiscal/retenciones/calculadora" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-blue-600">Calculadora</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Calcula retenciones IRPF
              </p>
              <div className="flex items-center text-sm text-blue-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Calcular
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/fiscal/retenciones/certificados" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-green-600">Certificados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Genera certificados de retenciones
              </p>
              <div className="flex items-center text-sm text-green-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generar
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/fiscal/retenciones/modelo115" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-purple-600">Modelo 115</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Retenciones e ingresos a cuenta sobre determinados rendimientos del trabajo
              </p>
              <div className="flex items-center text-sm text-purple-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Acceder
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/fiscal/retenciones/resumen-anual" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-orange-600">Resumen Anual</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Información detallada anual
              </p>
              <div className="flex items-center text-sm text-orange-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Ver resumen
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
} 