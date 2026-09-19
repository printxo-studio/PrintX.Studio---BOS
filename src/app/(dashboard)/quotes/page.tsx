'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Plus,
  ArrowRight,
  Printer,
  Copy,
  CheckCircle,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Clock,
  Edit2,
  Trash2,
} from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KPICard } from '@/components/ui/KPICard';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/calculations';

const QUOTE_STATUSES = ['ALL', 'DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'CONVERTED'];

export default function QuotesListPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editQuoteForm, setEditQuoteForm] = useState<any>({});

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quotes');
      if (res.ok) {
        const data = await res.json();
        setQuotes(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleDuplicate = async (quoteId: string) => {
    try {
      const res = await fetch(`/api/quotes/${quoteId}`, {
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

  const handleConvert = async (quoteId: string) => {
    if (!confirm('Convert this accepted quotation into an active manufacturing order?')) return;
    try {
      const res = await fetch(`/api/quotes/${quoteId}/convert`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/orders/${data.order.id}`);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to convert');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEditQuote = (quote: any) => {
    setEditQuoteForm({
      id: quote.id,
      quoteNumber: quote.quoteNumber,
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
      const res = await fetch(`/api/quotes/${editQuoteForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editQuoteForm),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchQuotes();
      } else {
        alert('Failed to update quote');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating quote');
    }
  };

  const handleDeleteQuote = async (id: string, quoteNumber: string) => {
    if (!confirm(`Are you sure you want to delete quotation "${quoteNumber}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/quotes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchQuotes();
      } else {
        alert('Failed to delete quotation');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting quotation');
    }
  };

  // Metrics
  const totalQuoteValue = quotes.reduce((sum, q) => sum + q.grandTotal, 0);
  const acceptedQuotes = quotes.filter((q) => q.status === 'ACCEPTED' || q.status === 'CONVERTED');
  const acceptedValue = acceptedQuotes.reduce((sum, q) => sum + q.grandTotal, 0);
  const conversionRate = quotes.length > 0 ? Math.round((acceptedQuotes.length / quotes.length) * 100) : 0;

  const filteredQuotes =
    statusFilter === 'ALL'
      ? quotes
      : quotes.filter((q) => q.status === statusFilter);

  const columns: Column<any>[] = [
    {
      key: 'quoteNumber',
      header: 'Quote Number',
      render: (item) => (
        <Link
          href={`/quotes/${item.id}`}
          style={{ fontWeight: 700, color: 'var(--accent-red)', textDecoration: 'none' }}
        >
          {item.quoteNumber}
        </Link>
      ),
      sortable: true,
      width: '130px',
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (item) => (
        <div>
          <Link
            href={`/customers/${item.customerId}`}
            style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}
          >
            {item.customer?.name}
          </Link>
          {item.customer?.company && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.customer.company}</div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'date',
      header: 'Date & Validity',
      render: (item) => (
        <div style={{ fontSize: 11.5 }}>
          <div>Issued: {new Date(item.date).toLocaleDateString()}</div>
          <div style={{ color: 'var(--text-muted)' }}>
            Valid: {new Date(item.validUntil).toLocaleDateString()}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'itemsCount',
      header: 'Line Items',
      render: (item) => (
        <span style={{ fontSize: 12 }}>
          {item.items?.length || 0} item{(item.items?.length || 0) === 1 ? '' : 's'}
        </span>
      ),
      width: '90px',
    },
    {
      key: 'grandTotal',
      header: 'Quote Amount',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 700, fontFamily: 'monospace' }}>
            {formatCurrency(item.grandTotal)}
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--status-success)' }}>
            {item.marginPercent}% est. margin
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
      sortable: true,
      width: '110px',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {item.status !== 'CONVERTED' && (
            <button
              onClick={() => handleConvert(item.id)}
              className="btn btn-primary btn-sm"
              style={{ fontSize: 11, padding: '3px 8px' }}
              title="Convert Accepted Quote to Manufacturing Order"
            >
              Convert to Order →
            </button>
          )}
          <button
            onClick={() => handleDuplicate(item.id)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 6px' }}
            title="Duplicate Quote"
          >
            <Copy size={13} />
          </button>
          <Link
            href={`/quotes/${item.id}/print`}
            target="_blank"
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 6px' }}
            title="Print / Download PDF"
          >
            <Printer size={13} />
          </Link>
          <button
            onClick={() => handleOpenEditQuote(item)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 6px', color: 'var(--text-secondary)' }}
            title="Edit Quote"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => handleDeleteQuote(item.id, item.quoteNumber)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 6px', color: 'var(--accent-red)' }}
            title="Delete Quote"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FileText size={22} color="var(--accent-red)" /> Quotation Engine
          </h1>
          <p className="page-subtitle">
            3D Print Cost Estimator &bull; Formal PDF Proposals &bull; Instant Order Conversion
          </p>
        </div>

        <Link href="/quotes/new" className="btn btn-primary btn-sm">
          <Plus size={15} /> Create Quotation
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard
          label="Total Quoted Pipeline"
          value={formatCurrency(totalQuoteValue)}
          subtext={`${quotes.length} total quotes issued`}
          icon={DollarSign}
        />
        <KPICard
          label="Accepted Pipeline Value"
          value={formatCurrency(acceptedValue)}
          subtext={`${acceptedQuotes.length} accepted proposals`}
          icon={TrendingUp}
          accentColor="var(--status-success)"
        />
        <KPICard
          label="Quote Acceptance Rate"
          value={`${conversionRate}%`}
          subtext="Target: > 40%"
          icon={CheckCircle}
          accentColor="var(--status-info)"
        />
        <KPICard
          label="Pending Quotes"
          value={quotes.filter((q) => q.status === 'SENT' || q.status === 'DRAFT').length}
          subtext="Awaiting client acceptance"
          icon={Clock}
          accentColor="var(--status-warning)"
        />
      </div>

      {/* Filter Tabs */}
      <div className="tabs-container">
        {QUOTE_STATUSES.map((status) => (
          <button
            key={status}
            className={`tab-btn ${statusFilter === status ? 'active' : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            {status === 'ALL' ? 'All Quotes' : status}
          </button>
        ))}
      </div>

      {/* Quotes Table */}
      <DataTable
        columns={columns}
        data={filteredQuotes}
        searchPlaceholder="Search quotes by number, customer, company..."
        searchKeys={['quoteNumber']}
        pageSize={10}
      />

      {/* Edit Quote Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Quotation: ${editQuoteForm.quoteNumber || ''}`}
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
