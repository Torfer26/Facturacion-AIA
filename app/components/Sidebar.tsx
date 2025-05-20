'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Users,
  Calculator,
  Settings,
  LogOut,
  FileOutput,
  FileInput
} from 'lucide-react'
import { useState, useEffect } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Facturas Recibidas', href: '/recibidas', icon: FileInput },
  { name: 'Facturas Emitidas', href: '/emitidas', icon: FileOutput },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Fiscal', href: '/fiscal', icon: Calculator },
  { name: 'Configuración', href: '/configuracion', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen flex-col justify-between border-r bg-white">
      <div className="px-4 py-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xl font-semibold text-gray-900"
        >
          <span className="h-7 w-7 rounded-lg bg-primary-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="p-1"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </span>
          FiscalApp
        </Link>

        <nav className="mt-6 flex flex-1 flex-col">
          <ul role="list" className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href)

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`group flex items-center gap-2.5 rounded-lg px-4 py-2 text-sm font-medium ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-primary-700'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-primary-700' : 'text-gray-400'}`} />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      <div className="sticky inset-x-0 bottom-0 border-t border-gray-100 bg-white p-2">
        <button
          type="button"
          className="group relative flex w-full items-center gap-x-2 rounded-lg px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-red-700"
        >
          <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-700" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
} 