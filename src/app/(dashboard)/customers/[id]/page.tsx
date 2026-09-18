'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  UserCheck,
  Building,
  Phone,
  Mail,
  MapPin,
  FileText,
  ShoppingBag,
  CreditCard,
  AlertCircle,
  Plus,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Star,
  DollarSign,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KPICard } from '@/components/ui/KPICard';
import { formatCurrency } from '@/lib/calculations';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'quotes' | 'invoices' | 'complaints'>('overview');

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/crm/customers/${params.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setCustomer(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading Customer 360° Record...
      </div>
    );
  }

  if (!customer) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2 style={{ color: 'var(--status-danger)', marginBottom: 8 }}>Customer Not Found</h2>
        <Link href="/customers" className="btn btn-secondary btn-sm">
          ← Back to Customer Directory
        </Link>
      </div>
    );
  }

  const { metrics } = customer;

  return (
    <div>
      {/* Breadcrumb & Navigation */}
      <div className="breadcrumbs">
        <Link href="/customers">Customers</Link>
        <span>/</span>
        <span>{customer.customerCode}</span>
      </div>

      {/* Profile Header Card */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-red-subtle)',
              border: '1px solid var(--accent-red-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-red)',
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            {customer.name.charAt(0)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700 }}>{customer.name}</h1>
              <span className="badge badge-neutral" style={{ fontSize: 11 }}>
                {customer.customerCode}
              </span>
              <StatusBadge status={customer.customerType} />
              <StatusBadge status={customer.status} />
            </div>
            {customer.company && (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                {customer.company} &bull; GSTIN: {customer.gstin || 'Unregistered'}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link
            href={`/quotes/new?customerId=${customer.id}`}
            className="btn btn-primary btn-sm"
          >
            <Plus size={14} /> New Quote
          </Link>
        </div>
      </div>

      {/* 4 COMMERCIAL KPIS */}
      <div className="kpi-grid">
        <KPICard
          label="Total Orders"
          value={metrics?.totalOrders || 0}
          subtext="Lifetime manufacturing jobs"
          icon={ShoppingBag}
        />
        <KPICard
          label="Lifetime Revenue"
          value={formatCurrency(metrics?.totalRevenue || 0)}
          subtext="Billed revenue"
          icon={DollarSign}
          accentColor="var(--status-success)"
        />
        <KPICard
          label="Average Order Value"
          value={formatCurrency(metrics?.averageOrderValue || 0)}
          subtext="Per completed order"
          icon={CreditCard}
        />
        <KPICard
          label="Outstanding Balance"
          value={formatCurrency(metrics?.outstandingBalance || 0)}
          subtext="Unpaid invoice balance"
          icon={Clock}
          accentColor={metrics?.outstandingBalance > 0 ? 'var(--status-warning)' : 'var(--status-success)'}
        />
      </div>

      {/* TABS NAVIGATION */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Customer Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders ({customer.orders?.length || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === 'quotes' ? 'active' : ''}`}
          onClick={() => setActiveTab('quotes')}
        >
          Quotations ({customer.quotes?.length || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === 'invoices' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          Invoices & Payments ({customer.invoices?.length || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === 'complaints' ? 'active' : ''}`}
          onClick={() => setActiveTab('complaints')}
        >
          Quality / Complaints ({customer.complaints?.length || 0})
        </button>
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <UserCheck size={16} color="var(--accent-red)" /> Contact & Tax Information
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>Contact Person:</span>
                <span style={{ fontWeight: 600 }}>{customer.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>Company:</span>
                <span>{customer.company || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>GSTIN:</span>
                <span style={{ fontFamily: 'monospace' }}>{customer.gstin || 'None'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>Phone:</span>
                <span>{customer.phone || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                <span>{customer.email || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Client Rating:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={13} color="#f59e0b" fill="#f59e0b" />
                  <strong>{customer.rating} / 5.0</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <MapPin size={16} color="var(--accent-red)" /> Billing & Shipping Address
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
              {customer.address || 'No formal address provided.'}
              <div>
                <strong>Location: </strong>
                {customer.city || 'Bangalore'}, {customer.state || 'Karnataka'} - {customer.pincode || '560001'}
              </div>
              <div>
                <strong>Country: </strong>
                {customer.country || 'India'}
              </div>
            </div>

            <div className="card-title" style={{ fontSize: 13, marginBottom: 8 }}>
              Engineering & Operational Notes
            </div>
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                padding: 12,
                borderRadius: 'var(--radius-sm)',
                fontSize: 12.5,
                color: 'var(--text-muted)',
                lineHeight: 1.5,
              }}
            >
              {customer.notes || 'No special engineering notes or tolerances recorded for this customer.'}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ORDERS */}
      {activeTab === 'orders' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <ShoppingBag size={16} color="var(--accent-red)" /> Production Orders
            </div>
          </div>
          {customer.orders?.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No orders placed by this customer yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {customer.orders.map((ord: any) => (
                <div
                  key={ord.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      <Link href={`/orders/${ord.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                        {ord.orderNumber}
                      </Link>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      Date: {new Date(ord.orderDate).toLocaleDateString()} &bull; Total: {formatCurrency(ord.totalAmount)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusBadge status={ord.paymentStatus} label={`Pay: ${ord.paymentStatus}`} />
                    <StatusBadge status={ord.productionStatus} label={`Prod: ${ord.productionStatus}`} />
                    <StatusBadge status={ord.overallStatus} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: QUOTES */}
      {activeTab === 'quotes' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <FileText size={16} color="var(--accent-red)" /> Quotations History
            </div>
            <Link href={`/quotes/new?customerId=${customer.id}`} className="btn btn-primary btn-sm">
              <Plus size={13} /> Create Quote
            </Link>
          </div>
          {customer.quotes?.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No quotes created for this customer.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {customer.quotes.map((q: any) => (
                <div
                  key={q.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      <Link href={`/quotes/${q.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                        {q.quoteNumber}
                      </Link>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      Valid Until: {new Date(q.validUntil).toLocaleDateString()} &bull; Grand Total: {formatCurrency(q.grandTotal)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <StatusBadge status={q.status} />
                    <Link href={`/quotes/${q.id}`} className="btn btn-secondary btn-sm" style={{ fontSize: 11 }}>
                      View Quote →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: INVOICES & PAYMENTS */}
      {activeTab === 'invoices' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <CreditCard size={16} color="var(--accent-red)" /> Invoices & Received Payments
            </div>
          </div>
          {customer.invoices?.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No tax invoices issued for this customer.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {customer.invoices.map((inv: any) => (
                <div
                  key={inv.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{inv.invoiceNumber}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      Date: {new Date(inv.invoiceDate).toLocaleDateString()} &bull; Total: {formatCurrency(inv.grandTotal)} &bull; Balance Due: {formatCurrency(inv.balanceDue)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusBadge status={inv.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <AlertCircle size={16} color="var(--accent-red)" /> Quality Issues & Complaints
            </div>
          </div>
          {customer.complaints?.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--status-success)' }}>
              ✓ 100% Quality Satisfaction: Zero complaints logged for this customer.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {customer.complaints.map((c: any) => (
                <div
                  key={c.id}
                  style={{
                    padding: '12px 14px',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{c.issueTitle}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
