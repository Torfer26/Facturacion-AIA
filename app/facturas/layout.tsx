'use client';

import Sidebar from '../components/Sidebar';

export default function FacturasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {children}
      </main>
    </>
  );
} 