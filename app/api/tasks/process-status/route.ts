import { NextRequest, NextResponse } from 'next/server';
import { getIssuedInvoices } from '@/lib/services/issuedInvoices';

export async function GET(req: NextRequest) {
  try {
    const invoices = await getIssuedInvoices();
    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 