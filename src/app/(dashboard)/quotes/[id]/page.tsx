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
  Download,
  Trash2,
  Edit2,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/calculations';
import { COMPANY_DETAILS } from '@/lib/constants';

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [quote, setQuote] = useState<any | null>(null);
  const [settings, setSettings] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editQuoteForm, setEditQuoteForm] = useState<any>({});

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

  const handleOpenEditQuote = () => {
    if (!quote) return;
    setEditQuoteForm({
      status: quote.status || 'DRAFT',
      notes: quote.notes || '',
      validUntil: quote.validUntil ? new Date(quote.validUntil).toISOString().split('T')[0] : '',
      paymentTerms: quote.paymentTerms || '',
      deliveryEstimate: quote.deliveryEstimate || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/quotes/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editQuoteForm),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchQuote();
      } else {
        alert('Failed to update quote');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating quote');
    }
  };

  const handleDeleteQuote = async () => {
    if (!confirm(`Are you sure you want to delete quotation "${quote?.quoteNumber}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/quotes/${params.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/quotes');
      } else {
        alert('Failed to delete quotation');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting quotation');
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

          <button
            onClick={handleOpenEditQuote}
            className="btn btn-secondary btn-sm"
          >
            <Edit2 size={14} /> Edit Quote
          </button>

          <button
            onClick={handleDeleteQuote}
            className="btn btn-secondary btn-sm"
            style={{ color: 'var(--accent-red)', borderColor: 'var(--border-default)' }}
            title="Delete Quote"
          >
            <Trash2 size={14} />
          </button>
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

      {/* Edit Quote Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Quotation: ${quote?.quoteNumber || ''}`}
      >
        <form onSubmit={handleUpdateQuote} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Quote Status
              </label>
              <select
                value={editQuoteForm.status || 'DRAFT'}
                onChange={(e) => setEditQuoteForm({ ...editQuoteForm, status: e.target.value })}
                className="input"
                style={{ width: '100%' }}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="SENT">SENT</option>
                <option value="VIEWED">VIEWED</option>
                <option value="ACCEPTED">ACCEPTED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="CONVERTED">CONVERTED</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Valid Until
              </label>
              <input
                type="date"
                className="input"
                value={editQuoteForm.validUntil || ''}
                onChange={(e) => setEditQuoteForm({ ...editQuoteForm, validUntil: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Payment Terms
              </label>
              <input
                type="text"
                className="input"
                value={editQuoteForm.paymentTerms || ''}
                onChange={(e) => setEditQuoteForm({ ...editQuoteForm, paymentTerms: e.target.value })}
                placeholder="e.g. 50% Advance, 50% on Dispatch"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Delivery Estimate
              </label>
              <input
                type="text"
                className="input"
                value={editQuoteForm.deliveryEstimate || ''}
                onChange={(e) => setEditQuoteForm({ ...editQuoteForm, deliveryEstimate: e.target.value })}
                placeholder="e.g. 3-5 Working Days"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Notes / Terms
            </label>
            <textarea
              className="input"
              rows={3}
              value={editQuoteForm.notes || ''}
              onChange={(e) => setEditQuoteForm({ ...editQuoteForm, notes: e.target.value })}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
