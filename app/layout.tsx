import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from './components/Sidebar'
import { usePathname } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Facturación AIA',
  description: 'Aplicación para gestionar facturas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="h-full bg-gray-50">
      <body className={`${inter.className} h-full`}>
        <div className="flex h-full">
          {children}
        </div>
      </body>
    </html>
  )
} 