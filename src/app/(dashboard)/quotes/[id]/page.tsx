'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  FileText,
  Printer,
  Copy,
  CheckCircle,
  ArrowRight,
  Clock,
  UserCheck,
  Building,
  Calendar,
  DollarSign,
  AlertCircle,
  Download,
  Trash2,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency } from '@/lib/calculations';
import { COMPANY_DETAILS } from '@/lib/constants';

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [quote, setQuote] = useState<any | null>(null);
  const [settings, setSettings] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchQuote = async () => {
    if (!params.id) return;
    try {
      const res = await fetch(`/api/quotes/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setQuote(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) setSettings(data.settings);
      })
      .catch(() => {});
  }, [params.id]);

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/quotes/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchQuote();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const res = await fetch(`/api/quotes/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DUPLICATE' }),
      });
      if (res.ok) {
        const duplicated = await res.json();
        router.push(`/quotes/${duplicated.id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvertToOrder = async () => {
    if (!confirm('Convert this accepted quotation into an active production manufacturing order?')) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/quotes/${params.id}/convert`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/orders/${data.order.id}`);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to convert quote');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading Quotation #{params.id}...
      </div>
    );
  }

  if (!quote) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2 style={{ color: 'var(--status-danger)', marginBottom: 8 }}>Quotation Not Found</h2>
        <Link href="/quotes" className="btn btn-secondary btn-sm">
          ← Back to Quotations
        </Link>
      </div>
    );
  }

  const isGst = settings ? settings.gstEnabled : false;
  const isConverted = quote.status === 'CONVERTED' || (quote.orders && quote.orders.length > 0);

  return (
    <div>
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <Link href="/quotes">Quotations</Link>
        <span>/</span>
        <span>{quote.quoteNumber}</span>
      </div>

      {/* Quote Action Header */}
      <div
        className="card"
        style={{
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-red-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-red)',
            }}
          >
            <FileText size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800 }}>{quote.quoteNumber}</h1>
              <StatusBadge status={quote.status} />
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>
              Issued: {new Date(quote.date).toLocaleDateString()} &bull; Valid Until:{' '}
              {new Date(quote.validUntil).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Status Transitions */}
          {quote.status === 'DRAFT' && (
            <button
              onClick={() => handleStatusUpdate('SENT')}
              className="btn btn-secondary btn-sm"
              disabled={updating}
            >
              Mark as Sent to Client
            </button>
          )}

          {['SENT', 'VIEWED', 'NEGOTIATION'].includes(quote.status) && (
            <button
              onClick={() => handleStatusUpdate('ACCEPTED')}
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--status-success)', borderColor: 'var(--status-success-border)' }}
              disabled={updating}
            >
              <CheckCircle size={14} /> Mark Accepted
            </button>
          )}

          {/* Convert to Order Action (Section 9) */}
          {!isConverted && (
            <button
              onClick={handleConvertToOrder}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 700 }}
              disabled={updating}
            >
              Convert to Order →
            </button>
          )}

          {isConverted && (
            <Link
              href={`/orders/${quote.orders[0]?.id || ''}`}
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--status-success)' }}
            >
              View Generated Order ({quote.orders[0]?.orderNumber}) →
            </Link>
          )}

          <button
            onClick={handleDuplicate}
            className="btn btn-secondary btn-sm"
            title="Duplicate Quote"
          >
            <Copy size={14} /> Duplicate
          </button>

          <Link
            href={`/quotes/${quote.id}/print`}
            target="_blank"
            className="btn btn-secondary btn-sm"
          >
            <Printer size={14} /> Print / PDF
          </Link>
        </div>
      </div>

      {/* 2-COLUMN VIEW: PROPOSAL DETAILS & COMMERCIAL SUMMARY */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24, alignItems: 'flex-start' }}>
        {/* LEFT COLUMN: CUSTOMER & LINE ITEMS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Customer Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <UserCheck size={16} color="var(--accent-red)" /> Customer / Client Details
              </div>
              <Link
                href={`/customers/${quote.customer.id}`}
                style={{ fontSize: 11.5, color: 'var(--accent-red)', textDecoration: 'none' }}
              >
                View Customer 360° →
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Client Name:</div>
                <div style={{ fontWeight: 600 }}>{quote.customer.name}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Company:</div>
                <div>{quote.customer.company || 'Individual Maker'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Phone & Email:</div>
                <div>{quote.customer.phone || quote.customer.email || '—'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>GSTIN:</div>
                <div style={{ fontFamily: 'monospace' }}>{quote.customer.gstin || 'Unregistered'}</div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <FileText size={16} color="var(--accent-red)" /> Quoted Manufacturing Items
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {quote.items.length} line item(s)
              </span>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Material</th>
                  <th>Specs (Time / Wt)</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Unit Price</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      {item.description && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.description}</div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: 10 }}>
                        {item.material || 'PLA'}
                      </span>
                    </td>
                    <td style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                      {item.printTimeHours ? `${item.printTimeHours}h` : '—'} &bull;{' '}
                      {item.filamentGrams ? `${item.filamentGrams}g` : '—'}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>
                      {formatCurrency(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Terms & Notes */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12, fontSize: 13 }}>
              Commercial Terms & Production Timeline
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 12.5, marginBottom: 14 }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Payment Terms: </span>
                <strong>{quote.paymentTerms || '50% Advance'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Delivery Estimate: </span>
                <strong>{quote.deliveryEstimate || '3-5 Business Days'}</strong>
              </div>
            </div>

            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              <strong>Notes: </strong> {quote.notes || 'None'}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FINANCIAL BREAKDOWN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <div className="card-title" style={{ marginBottom: 14 }}>
              Quotation Cost & Profit Breakdown
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Line Items Subtotal:</span>
                <span style={{ fontFamily: 'monospace' }}>{formatCurrency(quote.subtotal)}</span>
              </div>

              {quote.packagingCost > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Packaging:</span>
                  <span style={{ fontFamily: 'monospace' }}>{formatCurrency(quote.packagingCost)}</span>
                </div>
              )}

              {quote.shippingCost > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Shipping / Courier:</span>
                  <span style={{ fontFamily: 'monospace' }}>{formatCurrency(quote.shippingCost)}</span>
                </div>
              )}

              {isGst && quote.taxAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Taxes ({settings?.defaultGstRate || 18}% GST):</span>
                  <span style={{ fontFamily: 'monospace' }}>{formatCurrency(quote.taxAmount)}</span>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '2px solid var(--border-default)',
                  paddingTop: 10,
                  fontSize: 18,
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                }}
              >
                <span>Grand Total:</span>
                <span style={{ color: 'var(--status-success)' }}>
                  {formatCurrency(isGst ? quote.grandTotal : (quote.subtotal + (quote.packagingCost || 0) + (quote.shippingCost || 0)))}
                </span>
              </div>
            </div>

            {/* Internal Profit Analytics (Section 10) */}
            <div
              style={{
                marginTop: 18,
                padding: '12px 14px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontSize: 12,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--text-secondary)' }}>
                Internal Production Economics
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Estimated Cost:</span>
                <span>{formatCurrency(quote.estimatedCost || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Estimated Profit:</span>
                <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>
                  {formatCurrency(quote.estimatedProfit || 0)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Target Margin:</span>
                <span style={{ color: 'var(--accent-red)', fontWeight: 700 }}>
                  {quote.marginPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Quick PDF Action Card */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 8, fontSize: 13 }}>
              Print & Client PDF
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 14 }}>
              Open a clean, printable PDF proposal formatted with PRINTXO business credentials.
            </p>
            <Link
              href={`/quotes/${quote.id}/print`}
              target="_blank"
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Printer size={15} /> Open Printable Proposal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
