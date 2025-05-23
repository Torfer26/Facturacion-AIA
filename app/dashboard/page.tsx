"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    // Only redirect if we're sure user is not authenticated (loading is complete)
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isLoading, isAuthenticated]);

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
          <Button onClick={() => window.location.href = "/login"}>
            Iniciar Sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Panel de Control</h1>
        <div className="flex items-center gap-4">
          <span>Bienvenido, {user.name}</span>
          <Button variant="outline" onClick={logout}>
            Cerrar sesión
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/facturas/emitidas" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Facturas Emitidas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Gestiona tus facturas emitidas</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/recibidas" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Facturas Recibidas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Gestiona tus facturas recibidas</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/clientes" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Gestiona tus clientes</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
} 