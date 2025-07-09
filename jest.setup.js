// Configuración global para pruebas
import 'jest-environment-jsdom'

// Mock para window.location
delete window.location;
window.location = { href: '', assign: jest.fn(), reload: jest.fn() };

// Mock para next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next-auth - TEMPORALMENTE COMENTADO
// NextAuth ha sido deshabilitado para evitar conflictos
/*
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
}))
*/

// Mock Google Drive API
jest.mock('googleapis', () => ({
  google: {
    drive: () => ({
      files: {
        list: jest.fn(),
        get: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    }),
  },
})) 