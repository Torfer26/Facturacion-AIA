import { redirect } from 'next/navigation';

export default function FacturasPage() {
  // Server-side redirect
  redirect('/facturas/recibidas');
} 
