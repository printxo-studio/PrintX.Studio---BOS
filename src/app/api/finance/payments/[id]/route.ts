import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const payment = await db.payment.findUnique({
      where: { id: params.id },
      include: { customer: true, invoice: true },
    });
    if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    return NextResponse.json(payment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = await db.payment.update({
      where: { id: params.id },
      data: {
        ...(body.paymentMethod !== undefined && { paymentMethod: body.paymentMethod }),
        ...(body.referenceNumber !== undefined && { referenceNumber: body.referenceNumber }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.status !== undefined && { status: body.status }),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Payment update error:', error);
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const payment = await db.payment.findUnique({
      where: { id: params.id },
    });
    if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });

    const invoiceId = payment.invoiceId;

    await db.payment.delete({ where: { id: params.id } });

    // Reconcile linked invoice balance
    if (invoiceId) {
      const invoice = await db.invoice.findUnique({
        where: { id: invoiceId },
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
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment delete error:', error);
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 });
  }
}
