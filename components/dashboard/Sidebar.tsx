import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Calendar, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { 
      name: 'Facturas', 
      href: '/facturas', 
      icon: FileText,
      children: [
        { name: 'Emitidas', href: '/facturas/emitidas' },
        { name: 'Recibidas', href: '/facturas/recibidas' },
        { name: 'Procesar', href: '/facturas/procesar' },
      ]
    },
    { name: 'Clientes', href: '/clientes', icon: Users },
    { name: 'Obligaciones Fiscales', href: '/fiscal', icon: Calendar },
    { name: 'Configuración', href: '/configuracion', icon: Settings },
  ];
  
  return (
    <>
      {/* Mobile menu button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-6 border-b">
            <Link href="/dashboard" className="flex items-center">
              <span className="text-2xl font-bold">
                <span className="text-blue-600">Fiscal</span>App
              </span>
            </Link>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                        isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                    
                    {/* Submenu */}
                    {item.children && pathname?.startsWith(`${item.href}/`) && (
                      <ul className="mt-1 ml-6 space-y-1">
                        {item.children.map((child) => {
                          const isChildActive = pathname === child.href;
                          
                          return (
                            <li key={child.name}>
                              <Link
                                href={child.href}
                                className={cn(
                                  "block px-4 py-2 text-sm rounded-md transition-colors",
                                  isChildActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
                                )}
                              >
                                {child.name}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
          
          {/* User menu */}
          <div className="px-4 py-4 border-t">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                  U
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Usuario</p>
                <Link 
                  href="/api/auth/signout" 
                  className="text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center mt-1"
                >
                  <LogOut className="mr-1 h-3 w-3" />
                  Cerrar sesión
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 