"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  // Si el usuario no está autenticado, redirigir al login
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Panel de Control</h1>
        <div className="flex items-center gap-4">
          <span>Bienvenido, {user?.username}</span>
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

        <Link href="/facturas/recibidas" className="block">
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