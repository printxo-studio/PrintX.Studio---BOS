import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateGeminiInvoiceForOrder } from '@/lib/gemini';

export async function GET() {
  try {
    const orders = await db.order.findMany({
      orderBy: { orderDate: 'desc' },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
        printJobs: true,
        invoices: true,
        shipments: true,
      },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    let customerId = body.customerId;

    // Auto-create or resolve Customer from website order
    if (!customerId && body.customer) {
      const email = (body.customer.email || '').trim().toLowerCase();
      let existingCustomer = email ? await db.customer.findFirst({ where: { email } }) : null;
      if (!existingCustomer) {
        const custCount = await db.customer.count();
        const customerCode = `CUST-${String(custCount + 1).padStart(3, '0')}`;
        existingCustomer = await db.customer.create({
          data: {
            customerCode,
            name: body.customer.name || 'Storefront Customer',
            email: email || null,
            phone: body.customer.phone || null,
            address: body.customer.address || null,
            city: body.customer.city || 'Bengaluru',
            state: body.customer.state || 'Karnataka',
            pincode: body.customer.pincode || '560001',
            country: 'India',
            customerType: 'B2C',
            source: 'Website Storefront',
            status: 'ACTIVE',
          },
        });
      }
      customerId = existingCustomer.id;
    }

    if (!customerId) {
      const firstCust = await db.customer.findFirst();
      customerId = firstCust ? firstCust.id : (await db.customer.create({
        data: {
          customerCode: 'CUST-001',
          name: 'Walk-in Customer',
          customerType: 'B2C',
        }
      })).id;
    }

    const count = await db.order.count();
    const orderNumber = body.orderNumber || `ORD-2026-${String(count + 1).padStart(4, '0')}`;

    const newOrder = await db.order.create({
      data: {
        orderNumber,
        customerId,
        quoteId: body.quoteId || null,
        orderDate: body.orderDate ? new Date(body.orderDate) : new Date(),
        dueDate: body.dueDate ? new Date(body.dueDate) : new Date(Date.now() + 7 * 86400000),
        priority: body.priority || 'NORMAL',
        subtotal: parseFloat(body.subtotal) || 0,
        discountTotal: parseFloat(body.discountTotal) || 0,
        taxAmount: parseFloat(body.taxAmount) || 0,
        shippingCost: parseFloat(body.shippingCost) || 0,
        totalAmount: parseFloat(body.totalAmount) || 0,
        paymentStatus: body.paymentStatus || 'PENDING',
        productionStatus: body.productionStatus || 'PENDING',
        qcStatus: body.qcStatus || 'PENDING',
        shippingStatus: body.shippingStatus || 'PENDING',
        overallStatus: body.overallStatus || 'CONFIRMED',
        shippingAddress: body.shippingAddress || null,
        notes: body.notes || null,
        items: {
          create: (body.items || []).map((item: any) => ({
            productId: item.productId || null,
            name: item.name,
            sku: item.sku || null,
            description: item.description || null,
            quantity: parseInt(item.quantity) || 1,
            unitPrice: parseFloat(item.unitPrice) || 0,
            discount: parseFloat(item.discount) || 0,
            taxRate: parseFloat(item.taxRate) || 18.0,
            lineTotal: parseFloat(item.lineTotal) || 0,
          })),
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    // Auto-generate Gemini AI Tax Invoice immediately
    let generatedInvoice = null;
    try {
      generatedInvoice = await generateGeminiInvoiceForOrder(newOrder.id);
      console.log(`✓ Gemini AI Invoice generated for ${newOrder.orderNumber}: ${generatedInvoice.invoiceNumber}`);
    } catch (invErr) {
      console.warn('Could not auto-generate invoice in background:', invErr);
    }

    return NextResponse.json({ ...newOrder, invoice: generatedInvoice }, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
