"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useClientes } from "@/lib/hooks/useClientes";
import { Cliente } from "@/lib/types/cliente";

function formatDate(dateString?: string | null) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-ES');
}

function formatCurrency(amount?: number) {
  if (!amount) return '€0,00';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

function getEstadoBadgeVariant(estado?: string) {
  switch (estado) {
    case 'Activo':
      return 'default';
    case 'Inactivo':
      return 'secondary';
    case 'Pendiente':
      return 'outline';
    default:
      return 'secondary';
  }
}

function getTipoClienteColor(tipo?: string) {
  switch (tipo) {
    case 'Empresa':
      return 'text-blue-600';
    case 'Autónomo':
      return 'text-green-600';
    case 'Particular':
      return 'text-purple-600';
    default:
      return 'text-gray-600';
  }
}

export default function ClientesPage() {
  const { clientes, loading, error, refetch } = useClientes();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClientes = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cifNif.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Cargando clientes...</h2>
            <p className="text-gray-500">Por favor, espere</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Error al cargar clientes</h2>
          <p className="text-gray-500 mb-4">{error.message}</p>
          <Button onClick={refetch}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Clientes</h1>
          <p className="text-gray-500 mt-2">
            {clientes.length} {clientes.length === 1 ? 'cliente registrado' : 'clientes registrados'}
          </p>
        </div>
        <Link href="/clientes/nuevo">
          <Button>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Cliente
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <Input
          placeholder="Buscar por nombre, CIF/NIF o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{clientes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {clientes.filter(c => c.estado === 'Activo').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas</CardTitle>
            <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {clientes.filter(c => c.tipoCliente === 'Empresa').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
            <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(clientes.reduce((sum, c) => sum + (c.totalFacturado || 0), 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      {filteredClientes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">No se encontraron clientes</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'No hay clientes que coincidan con tu búsqueda.' : 'Aún no tienes clientes registrados.'}
            </p>
            {!searchTerm && (
              <Link href="/clientes/nuevo">
                <Button>Agregar primer cliente</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClientes.map((cliente) => (
            <Card key={cliente.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{cliente.nombre}</CardTitle>
                    <p className={`text-sm font-medium ${getTipoClienteColor(cliente.tipoCliente)}`}>
                      {cliente.tipoCliente}
                    </p>
                  </div>
                  <Badge variant={getEstadoBadgeVariant(cliente.estado)}>
                    {cliente.estado}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <p><strong>CIF/NIF:</strong> {cliente.cifNif}</p>
                  <p><strong>Email:</strong> {cliente.email}</p>
                  {cliente.telefono && (
                    <p><strong>Teléfono:</strong> {cliente.telefono}</p>
                  )}
                  {cliente.ciudad && (
                    <p><strong>Ciudad:</strong> {cliente.ciudad}</p>
                  )}
                </div>
                
                <div className="pt-2 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Facturas</p>
                      <p className="font-semibold">{cliente.numeroFacturas || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="font-semibold">{formatCurrency(cliente.totalFacturado)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <span className="text-xs text-gray-500">
                    Registrado: {formatDate(cliente.fechaAlta)}
                  </span>
                  <Link href={`/clientes/${cliente.id}`}>
                    <Button size="sm" variant="outline">
                      Ver detalles
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 