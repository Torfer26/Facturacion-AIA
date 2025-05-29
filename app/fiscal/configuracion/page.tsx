"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ConfiguracionFiscal } from "@/lib/types/fiscal";

export default function ConfiguracionPage() {
  const [configuracion, setConfiguracion] = useState<ConfiguracionFiscal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Por ahora, configuración mock hasta implementar la API
    setLoading(false);
    setConfiguracion({
      id: "1",
      cif: "B12345678",
      razonSocial: "Empresa de Ejemplo S.L.",
      periodoLiquidacion: "trimestral",
      regmenEspecial: "",
      tipoSociedad: "limitada",
      ejercicioFiscal: {
        inicio: "01-01",
        fin: "31-12"
      },
      codigoActividad: "6201",
      epigrafeIAE: "831",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Cargando configuración...</h2>
            <p className="text-gray-500">Obteniendo datos fiscales</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Configuración Fiscal</h1>
          <p className="text-gray-500 mt-2">
            Parámetros y datos fiscales de la empresa
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

      {configuracion && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Datos de la Empresa */}
          <Card>
            <CardHeader>
              <CardTitle>Datos de la Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">CIF</label>
                <p className="text-lg font-semibold">{configuracion.cif}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Razón Social</label>
                <p className="text-lg font-semibold">{configuracion.razonSocial}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tipo de Sociedad</label>
                <Badge variant="outline" className="ml-2">
                  {configuracion.tipoSociedad}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Configuración Fiscal */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración Fiscal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Período de Liquidación</label>
                <Badge variant="outline" className="ml-2">
                  {configuracion.periodoLiquidacion}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Ejercicio Fiscal</label>
                <p className="text-lg font-semibold">
                  {configuracion.ejercicioFiscal.inicio} - {configuracion.ejercicioFiscal.fin}
                </p>
              </div>
              {configuracion.regmenEspecial && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Régimen Especial</label>
                  <p className="text-lg font-semibold">{configuracion.regmenEspecial}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Códigos de Actividad */}
          <Card>
            <CardHeader>
              <CardTitle>Códigos de Actividad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Código de Actividad</label>
                <p className="text-lg font-semibold">{configuracion.codigoActividad}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Epígrafe IAE</label>
                <p className="text-lg font-semibold">{configuracion.epigrafeIAE}</p>
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" disabled>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar Configuración
              </Button>
              <p className="text-sm text-gray-500">
                La funcionalidad de edición estará disponible próximamente
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 