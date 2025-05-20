"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6">Bienvenido a FiscalApp</h1>
      
      <div className="flex flex-col space-y-4 w-full max-w-md">
        <Link href="/dashboard" className="w-full">
          <Button className="w-full">Dashboard</Button>
        </Link>
        
        <Link href="/recibidas" className="w-full">
          <Button className="w-full">Facturas Recibidas</Button>
        </Link>
        
        <Link href="/emitidas" className="w-full">
          <Button className="w-full">Facturas Emitidas</Button>
        </Link>
        
        <Link href="/clientes" className="w-full">
          <Button className="w-full">Clientes</Button>
        </Link>
      </div>
    </div>
  )
} 