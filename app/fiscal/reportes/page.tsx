"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Datos mock para reportes
const reportesDisponibles = [
  {
    id: "resumen-fiscal",
    titulo: "Resumen Fiscal Anual",
    descripcion: "Análisis completo de todas las obligaciones fiscales del ejercicio",
    categoria: "general",
    icono: "📊"
  },
  {
    id: "iva-detallado",
    titulo: "Informe de IVA Detallado",
    descripcion: "Análisis trimestral de IVA repercutido y soportado",
    categoria: "iva",
    icono: "📈"
  },
  {
    id: "retenciones-anuales",
    titulo: "Retenciones Anuales",
    descripcion: "Resumen de todas las retenciones practicadas en el año",
    categoria: "retenciones",
    icono: "📋"
  },
  {
    id: "cumplimiento-fiscal",
    titulo: "Cumplimiento Fiscal",
    descripcion: "Estado de presentación de todas las obligaciones",
    categoria: "cumplimiento",
    icono: "✅"
  },
  {
    id: "cargas-fiscales",
    titulo: "Análisis de Cargas Fiscales",
    descripcion: "Evolución de la presión fiscal sobre la empresa",
    categoria: "analisis",
    icono: "⚖️"
  },
  {
    id: "previsiones-pagos",
    titulo: "Previsión de Pagos",
    descripcion: "Calendario de pagos fiscales previstos",
    categoria: "tesoreria",
    icono: "💰"
  }
];

const estadisticasGenerales = {
  totalModelos: 15,
  modelosPresentados: 12,
  modelosPendientes: 3,
  importeTotalPagado: 45230.50,
  importePendiente: 8750.25,
  ahorroFiscal: 2350.00,
  eficienciaFiscal: 95.2
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

function getCategoriaColor(categoria: string) {
  switch (categoria) {
    case 'general':
      return 'bg-blue-100 text-blue-800';
    case 'iva':
      return 'bg-green-100 text-green-800';
    case 'retenciones':
      return 'bg-purple-100 text-purple-800';
    case 'cumplimiento':
      return 'bg-orange-100 text-orange-800';
    case 'analisis':
      return 'bg-indigo-100 text-indigo-800';
    case 'tesoreria':
      return 'bg-pink-100 text-pink-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function ReportesFiscalesPage() {
  const router = useRouter();
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos");
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState<string>("2024");

  const reportesFiltrados = reportesDisponibles.filter(reporte => {
    if (filtroCategoria === "todos") return true;
    return reporte.categoria === filtroCategoria;
  });

  const categorias = Array.from(new Set(reportesDisponibles.map(r => r.categoria)));

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => router.back()}>
          ← Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Reportes Fiscales</h1>
          <p className="text-gray-500 mt-2">
            Análisis, informes y estadísticas fiscales
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={ejercicioSeleccionado} onValueChange={setEjercicioSeleccionado}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Exportar todos
          </Button>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modelos Presentados</CardTitle>
            <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {estadisticasGenerales.modelosPresentados}/{estadisticasGenerales.totalModelos}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((estadisticasGenerales.modelosPresentados / estadisticasGenerales.totalModelos) * 100)}% completado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
            <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(estadisticasGenerales.importeTotalPagado)}
            </div>
            <p className="text-xs text-muted-foreground">
              En obligaciones fiscales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendiente</CardTitle>
            <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(estadisticasGenerales.importePendiente)}
            </div>
            <p className="text-xs text-muted-foreground">
              Por presentar/pagar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia Fiscal</CardTitle>
            <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {estadisticasGenerales.eficienciaFiscal}%
            </div>
            <p className="text-xs text-muted-foreground">
              Cumplimiento fiscal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las categorías</SelectItem>
                {categorias.map(categoria => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reportes Disponibles */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Reportes Disponibles</CardTitle>
            <Badge variant="outline">
              {reportesFiltrados.length} reportes
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportesFiltrados.map((reporte) => (
              <Card key={reporte.id} className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{reporte.icono}</span>
                      <div>
                        <CardTitle className="text-lg">{reporte.titulo}</CardTitle>
                        <Badge className={`${getCategoriaColor(reporte.categoria)} border-0 mt-1`}>
                          {reporte.categoria}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-sm mb-4">
                    {reporte.descripcion}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver
                    </Button>
                    <Button size="sm" variant="outline">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      </svg>
                      PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accesos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link href="/fiscal/reportes/dashboard-ejecutivo">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-blue-600">Dashboard Ejecutivo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm">
                Vista ejecutiva de métricas fiscales
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/fiscal/reportes/comparativa-anual">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-green-600">Comparativa Anual</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm">
                Evolución fiscal año tras año
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/fiscal/reportes/alertas-fiscales">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-red-600">Alertas Fiscales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm">
                Incidencias y alertas del sistema
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/fiscal/reportes/planificacion-fiscal">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-purple-600">Planificación Fiscal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm">
                Optimización y planificación
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Gráfico de Evolución */}
      <Card>
        <CardHeader>
          <CardTitle>Evolución Fiscal {ejercicioSeleccionado}</CardTitle>
          <p className="text-sm text-gray-500">
            Análisis trimestral de cargas fiscales
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded">
              <h4 className="font-semibold text-blue-800">1T {ejercicioSeleccionado}</h4>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(12450)}</p>
              <p className="text-xs text-blue-600">IVA + Retenciones</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded">
              <h4 className="font-semibold text-green-800">2T {ejercicioSeleccionado}</h4>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(15230)}</p>
              <p className="text-xs text-green-600">IVA + Retenciones</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded">
              <h4 className="font-semibold text-purple-800">3T {ejercicioSeleccionado}</h4>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(8750)}</p>
              <p className="text-xs text-purple-600">IVA + Retenciones</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded">
              <h4 className="font-semibold text-orange-800">4T {ejercicioSeleccionado}</h4>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(8800)}</p>
              <p className="text-xs text-orange-600">IVA + Retenciones</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Resumen por Impuesto</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>IVA Total</span>
                  <span className="font-semibold">{formatCurrency(35280)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>Retenciones</span>
                  <span className="font-semibold">{formatCurrency(9950)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="font-semibold">Total Año</span>
                  <span className="font-bold text-blue-600">{formatCurrency(45230)}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Indicadores Clave</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>Presión fiscal efectiva</span>
                  <span className="font-semibold">22.4%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>Ahorro fiscal estimado</span>
                  <span className="font-semibold text-green-600">{formatCurrency(2350)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="font-semibold">Eficiencia fiscal</span>
                  <span className="font-bold text-green-600">95.2%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 