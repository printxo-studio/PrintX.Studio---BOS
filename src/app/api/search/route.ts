import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();

    if (!q) {
      return NextResponse.json([]);
    }

    const results: any[] = [];

    // 1. Customers
    const customers = await db.customer.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { company: { contains: q } },
          { customerCode: { contains: q } },
          { phone: { contains: q } },
          { email: { contains: q } },
        ],
      },
      take: 4,
    });
    customers.forEach((c) =>
      results.push({
        type: 'Customer',
        title: c.name + (c.company ? ` (${c.company})` : ''),
        subtitle: `${c.customerCode} • ${c.phone || c.email || 'Client'}`,
        url: `/customers/${c.id}`,
      })
    );

    // 2. Orders
    const orders = await db.order.findMany({
      where: {
        OR: [
          { orderNumber: { contains: q } },
          { notes: { contains: q } },
        ],
      },
      include: { customer: true },
      take: 4,
    });
    orders.forEach((o) =>
      results.push({
        type: 'Order',
        title: o.orderNumber,
        subtitle: `${o.customer.name} • ₹${o.totalAmount} • ${o.overallStatus}`,
        url: `/orders/${o.id}`,
      })
    );

    // 3. Quotes
    const quotes = await db.quote.findMany({
      where: {
        OR: [
          { quoteNumber: { contains: q } },
          { notes: { contains: q } },
        ],
      },
      include: { customer: true },
      take: 4,
    });
    quotes.forEach((qt) =>
      results.push({
        type: 'Quote',
        title: qt.quoteNumber,
        subtitle: `${qt.customer.name} • ₹${qt.grandTotal} • ${qt.status}`,
        url: `/quotes/${qt.id}`,
      })
    );

    // 4. Products
    const products = await db.product.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { sku: { contains: q } },
          { category: { contains: q } },
        ],
      },
      take: 4,
    });
    products.forEach((p) =>
      results.push({
        type: 'Product',
        title: p.name,
        subtitle: `${p.sku} • v${p.currentVersion} • ₹${p.sellingPrice}`,
        url: `/products/${p.id}`,
      })
    );

    // 5. Printers
    const printers = await db.printer.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { printerCode: { contains: q } },
          { model: { contains: q } },
        ],
      },
      take: 3,
    });
    printers.forEach((pr) =>
      results.push({
        type: 'Printer',
        title: pr.name,
        subtitle: `${pr.printerCode} • ${pr.status}`,
        url: `/printers`,
      })
    );

    // 6. Filament Spools
    const spools = await db.filamentSpool.findMany({
      where: {
        OR: [
          { spoolCode: { contains: q } },
          { material: { contains: q } },
          { brand: { contains: q } },
          { color: { contains: q } },
        ],
      },
      take: 3,
    });
    spools.forEach((s) =>
      results.push({
        type: 'Spool',
        title: `${s.brand} ${s.material} - ${s.color}`,
        subtitle: `${s.spoolCode} • ${s.currentWeightG}g left`,
        url: `/filament`,
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
}
