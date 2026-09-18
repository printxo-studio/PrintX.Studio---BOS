import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const payments = await db.payment.findMany({
      orderBy: { paymentDate: 'desc' },
      include: {
        customer: true,
        invoice: true,
      },
    });
    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const count = await db.payment.count();
    const paymentCode = `PAY-2026-${String(count + 1).padStart(4, '0')}`;
    const amount = parseFloat(body.amount) || 0;

    // 1. Create Payment record
    const payment = await db.payment.create({
      data: {
        paymentCode,
        invoiceId: body.invoiceId || null,
        customerId: body.customerId,
        amount,
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
        paymentMethod: body.paymentMethod || 'UPI',
        referenceNumber: body.referenceNumber || null,
        status: 'CONFIRMED',
        notes: body.notes || null,
      },
    });

    // 2. If linked to an invoice, reconcile balance & status
    if (body.invoiceId) {
      const invoice = await db.invoice.findUnique({
        where: { id: body.invoiceId },
        include: { payments: true },
      });

      if (invoice) {
        const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
        const balanceDue = Math.max(0, invoice.grandTotal - totalPaid);
        const newStatus = balanceDue <= 0 ? 'PAID' : totalPaid > 0 ? 'PARTIALLY_PAID' : 'ISSUED';

        await db.invoice.update({
          where: { id: invoice.id },
          data: {
            amountPaid: totalPaid,
            balanceDue,
            status: newStatus,
          },
        });

        // 3. If invoice has an associated order, update order paymentStatus as well
        if (invoice.orderId) {
          await db.order.update({
            where: { id: invoice.orderId },
            data: {
              paymentStatus: newStatus === 'PAID' ? 'PAID' : 'PARTIAL',
            },
          });
        }
      }
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Payment record error:', error);
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }
}
