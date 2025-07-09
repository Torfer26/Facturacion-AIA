"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";

interface DashboardStats {
  facturasEmitidas: {
    total: number;
    totalImporte: number;
  };
  facturasRecibidas: {
    total: number;
    totalImporte: number;
  };
  clientes: {
    total: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    // Solo redirigir si estamos completamente seguros de que no está autenticado
    // y hemos esperado suficiente tiempo para la verificación
    if (!isLoading && !isAuthenticated && !user) {
      console.log('[DASHBOARD] User not authenticated, redirecting to home');
      // Usar setTimeout para evitar problemas de timing
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [isLoading, isAuthenticated, user]);

  // Fetch dashboard statistics
  useEffect(() => {
    async function fetchStats() {
      if (!isAuthenticated) return;
      
      try {
        setLoadingStats(true);
        
        // Fetch data from all APIs in parallel
        const [emitidasResponse, recibidasResponse, clientesResponse] = await Promise.all([
          fetch('/api/facturas/emitidas'),
          fetch('/api/facturas'),
          fetch('/api/clientes')
        ]);

        const emitidasData = await emitidasResponse.json();
        const recibidasData = await recibidasResponse.json();
        const clientesData = await clientesResponse.json();

        const emitidas = emitidasData.success ? emitidasData.invoices : [];
        const recibidas = recibidasData.success ? recibidasData.invoices : [];
        const clientes = clientesData.success ? clientesData.clientes : [];

        setStats({
          facturasEmitidas: {
            total: emitidas.length,
            totalImporte: emitidas.reduce((sum: number, invoice: any) => sum + (invoice.total || 0), 0)
          },
          facturasRecibidas: {
            total: recibidas.length,
            totalImporte: recibidas.reduce((sum: number, invoice: any) => sum + (invoice.totalPriceIncVat || 0), 0)
          },
          clientes: {
            total: clientes.length
          }
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStats({
          facturasEmitidas: { total: 0, totalImporte: 0 },
          facturasRecibidas: { total: 0, totalImporte: 0 },
          clientes: { total: 0 }
        });
      } finally {
        setLoadingStats(false);
      }
    }

    fetchStats();
  }, [isAuthenticated]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Cargando...</h2>
          <p className="text-gray-500">Verificando autenticación</p>
        </div>
      </div>
    );
  }

  // Safety check - don't show dashboard content if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Acceso Restringido</h2>
          <p className="text-gray-500 mb-4">Debe iniciar sesión para acceder a esta página</p>
                      <Button onClick={() => window.location.href = "/"}>
              Iniciar Sesión
            </Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Panel de Control</h1>
        <div className="flex items-center gap-4">
          <span>Bienvenido, {user.nombre}</span>
          <Button variant="outline" onClick={logout}>
            Cerrar sesión
          </Button>
        </div>
      </div>

      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Emitidas</CardTitle>
            <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loadingStats ? "..." : stats?.facturasEmitidas.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total: {loadingStats ? "..." : formatCurrency(stats?.facturasEmitidas.totalImporte || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Recibidas</CardTitle>
            <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {loadingStats ? "..." : stats?.facturasRecibidas.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total: {loadingStats ? "..." : formatCurrency(stats?.facturasRecibidas.totalImporte || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              loadingStats ? "text-gray-500" : 
              (stats?.facturasEmitidas.totalImporte || 0) - (stats?.facturasRecibidas.totalImporte || 0) >= 0 
                ? "text-green-600" : "text-red-600"
            }`}>
              {loadingStats ? "..." : formatCurrency(
                (stats?.facturasEmitidas.totalImporte || 0) - (stats?.facturasRecibidas.totalImporte || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresos - Gastos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {loadingStats ? "..." : stats?.clientes.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total registrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Link href="/facturas/emitidas" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-green-600">Facturas Emitidas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Gestiona tus facturas emitidas</p>
              <p className="text-sm text-green-600 mt-2">
                {loadingStats ? "Cargando..." : `${stats?.facturasEmitidas.total || 0} facturas`}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/recibidas" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-blue-600">Facturas Recibidas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Gestiona tus facturas recibidas</p>
              <p className="text-sm text-blue-600 mt-2">
                {loadingStats ? "Cargando..." : `${stats?.facturasRecibidas.total || 0} facturas`}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/clientes" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-orange-600">Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Gestiona tus clientes</p>
              <p className="text-sm text-orange-600 mt-2">
                {loadingStats ? "Cargando..." : `${stats?.clientes.total || 0} clientes`}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/empresa/perfil" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-indigo-600">Perfil de Empresa</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Configura tu empresa y datos</p>
              <p className="text-sm text-indigo-600 mt-2">
                Logo, datos bancarios, fiscales
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/fiscal" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-purple-600">Gestión Fiscal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">IVA, retenciones y obligaciones</p>
              <p className="text-sm text-purple-600 mt-2">
                Módulo fiscal completo
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
} 