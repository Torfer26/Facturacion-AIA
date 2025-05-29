"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Modelo303 } from "@/lib/types/fiscal";

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

export default function IvaPage() {
  const [modelos303, setModelos303] = useState<Modelo303[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModelos303() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/fiscal/modelo303');
        const data = await response.json();
        
        if (data.success) {
          setModelos303(data.modelos);
        } else {
          setError(data.error || 'Error al cargar los modelos 303');
        }
      } catch (err) {
        console.error('Error fetching modelos 303:', err);
        setError('Error de conexión al cargar los modelos 303');
      } finally {
        setLoading(false);
      }
    }

    fetchModelos303();
  }, []);

  // Calcular resumen anual
  const ejercicioActual = new Date().getFullYear();
  const modelos303Actuales = modelos303.filter(m => m.ejercicio === ejercicioActual);
  
  const resumenAnual = {
    ivaRepercutido: modelos303Actuales.reduce((sum, m) => sum + m.totalIvaRepercutido, 0),
    ivaSoportado: modelos303Actuales.reduce((sum, m) => sum + m.totalIvaSoportado, 0),
    diferencia: modelos303Actuales.reduce((sum, m) => sum + m.diferenciaIva, 0),
    importeFinal: modelos303Actuales.reduce((sum, m) => sum + m.resultadoLiquidacion, 0)
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Cargando datos de IVA...</h2>
            <p className="text-gray-500">Obteniendo modelos 303 desde Airtable</p>
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
                Asegúrate de que la tabla 'Modelo303' esté configurada en Airtable con los campos correctos.
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
          <h1 className="text-3xl font-bold">Gestión de IVA</h1>
          <p className="text-gray-500 mt-2">
            Modelos 303 trimestrales y resumen anual
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Datos sincronizados desde Airtable - {modelos303.length} modelos cargados
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/fiscal/iva/nuevo">
            <Button>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Modelo 303
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(resumenAnual.ivaRepercutido)}
              </div>
              <p className="text-sm text-gray-500">IVA Repercutido</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(resumenAnual.ivaSoportado)}
              </div>
              <p className="text-sm text-gray-500">IVA Soportado</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(resumenAnual.diferencia)}
              </div>
              <p className="text-sm text-gray-500">Diferencia</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${resumenAnual.importeFinal >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(resumenAnual.importeFinal)}
              </div>
              <p className="text-sm text-gray-500">
                {resumenAnual.importeFinal >= 0 ? 'A pagar' : 'A devolver'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Modelos 303 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Declaraciones Trimestrales</CardTitle>
        </CardHeader>
        <CardContent>
          {modelos303.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No hay modelos 303 registrados</p>
              <Link href="/fiscal/iva/nuevo">
                <Button>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear primer modelo 303
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {modelos303
                .sort((a, b) => b.ejercicio - a.ejercicio || b.trimestre - a.trimestre)
                .map((modelo) => (
                <div key={modelo.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant={getEstadoBadgeVariant(modelo.estado)}>
                      {modelo.estado}
                    </Badge>
                    <div>
                      <h4 className="font-semibold">
                        Modelo 303 - {modelo.ejercicio} T{modelo.trimestre}
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
                        <p className="text-gray-500">Repercutido</p>
                        <p className="font-semibold text-green-600">
                          {formatCurrency(modelo.totalIvaRepercutido)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Soportado</p>
                        <p className="font-semibold text-blue-600">
                          {formatCurrency(modelo.totalIvaSoportado)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Resultado</p>
                        <p className={`font-semibold ${modelo.resultadoLiquidacion >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(modelo.resultadoLiquidacion)}
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
        <Link href="/fiscal/iva/calculadora" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-blue-600">Calculadora IVA</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Calcula IVA para facturas
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

        <Link href="/fiscal/iva/libros" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-green-600">Libros de IVA</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Registro de facturas emitidas y recibidas
              </p>
              <div className="flex items-center text-sm text-green-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Ver libros
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/fiscal/iva/modelo390" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-purple-600">Modelo 390</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Resumen anual de IVA
              </p>
              <div className="flex items-center text-sm text-purple-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generar
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/fiscal/iva/configuracion" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-orange-600">Configuración</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Parámetros y tipos de IVA
              </p>
              <div className="flex items-center text-sm text-orange-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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