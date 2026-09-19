'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ShoppingBag,
  UserCheck,
  Building,
  Calendar,
  DollarSign,
  Cpu,
  ShieldCheck,
  Truck,
  CreditCard,
  FileText,
  Clock,
  ArrowRight,
  Printer,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/calculations';
import { ORDER_STATUSES } from '@/lib/constants';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'items' | 'jobs' | 'qc' | 'invoices' | 'shipment'>('items');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editOrderForm, setEditOrderForm] = useState<any>({});

  const fetchOrder = async () => {
    if (!params.id) return;
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const handleUpdateStatus = async (field: string, value: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        fetchOrder();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleGenerateInvoice = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${params.id}/invoice`, {
        method: 'POST',
      });
      if (res.ok) {
        const inv = await res.json();
        fetchOrder();
        router.push(`/finance`);
      } else {
        alert('Failed to generate invoice');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenEditOrder = () => {
    if (!order) return;
    setEditOrderForm({
      priority: order.priority || 'MEDIUM',
      overallStatus: order.overallStatus || 'PENDING',
      dueDate: order.dueDate ? new Date(order.dueDate).toISOString().split('T')[0] : '',
      shippingAddress: order.shippingAddress || '',
      notes: order.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editOrderForm),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchOrder();
      } else {
        alert('Failed to update order');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating order');
    }
  };

  const handleDeleteOrder = async () => {
    if (!confirm(`Are you sure you want to delete order "${order?.orderNumber}"? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/orders/${params.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/orders');
      } else {
        alert('Failed to delete order. It may have associated print jobs or invoices.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting order');
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading Order #{params.id}...</div>;
  }

  if (!order) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2 style={{ color: 'var(--status-danger)', marginBottom: 8 }}>Order Not Found</h2>
        <Link href="/orders" className="btn btn-secondary btn-sm">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const hasInvoice = order.invoices && order.invoices.length > 0;

  return (
    <div>
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <Link href="/orders">Orders</Link>
        <span>/</span>
        <span>{order.orderNumber}</span>
      </div>

      {/* Header Card */}
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
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-red-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-red)',
            }}
          >
            <ShoppingBag size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800 }}>{order.orderNumber}</h1>
              <StatusBadge status={order.overallStatus} />
              <StatusBadge status={order.priority} />
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>
              Ordered: {new Date(order.orderDate).toLocaleDateString()} &bull; Target Due:{' '}
              {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'Immediate'}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Status updater */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Status:</span>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '4px 10px', fontSize: 12 }}
              value={order.overallStatus}
              onChange={(e) => handleUpdateStatus('overallStatus', e.target.value)}
              disabled={updating}
            >
              {ORDER_STATUSES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* Generate Tax Invoice Action */}
          {!hasInvoice ? (
            <button
              onClick={handleGenerateInvoice}
              className="btn btn-primary btn-sm"
              disabled={updating}
            >
              <CreditCard size={14} /> Generate Tax Invoice
            </button>
          ) : (
            <Link
              href={`/finance/invoices/${order.invoices[0].id}/print`}
              target="_blank"
              className="btn btn-secondary btn-sm"
            >
              <Printer size={14} /> View Invoice ({order.invoices[0].invoiceNumber})
            </Link>
          )}

          {/* Queue Print Job */}
          <button
            onClick={() => router.push(`/production?orderId=${order.id}`)}
            className="btn btn-secondary btn-sm"
          >
            <Cpu size={14} /> Queue Print Job
          </button>

          <button
            onClick={handleOpenEditOrder}
            className="btn btn-secondary btn-sm"
          >
            <Edit2 size={14} /> Edit Order
          </button>

          <button
            onClick={handleDeleteOrder}
            className="btn btn-secondary btn-sm"
            style={{ color: 'var(--accent-red)', borderColor: 'var(--border-default)' }}
            title="Delete Order"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* 4 STATUS & TRACKING PILLS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Production Status
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, marginTop: 2 }}>{order.productionStatus}</div>
          </div>
          <select
            value={order.productionStatus}
            onChange={(e) => handleUpdateStatus('productionStatus', e.target.value)}
            style={{ fontSize: 11, background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
          >
            <option value="PENDING">Pending</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="ON_HOLD">On Hold</option>
          </select>
        </div>

        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Payment Status
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, marginTop: 2 }}>{order.paymentStatus}</div>
          </div>
          <select
            value={order.paymentStatus}
            onChange={(e) => handleUpdateStatus('paymentStatus', e.target.value)}
            style={{ fontSize: 11, background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
          >
            <option value="PENDING">Pending</option>
            <option value="PARTIAL">Partial</option>
            <option value="PAID">Paid</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>

        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              QC Status
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, marginTop: 2 }}>{order.qcStatus}</div>
          </div>
          <select
            value={order.qcStatus}
            onChange={(e) => handleUpdateStatus('qcStatus', e.target.value)}
            style={{ fontSize: 11, background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
          >
            <option value="PENDING">Pending</option>
            <option value="PASSED">Passed</option>
            <option value="FAILED">Failed</option>
            <option value="REWORK">Rework</option>
          </select>
        </div>

        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Shipping Status
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, marginTop: 2 }}>{order.shippingStatus}</div>
          </div>
          <select
            value={order.shippingStatus}
            onChange={(e) => handleUpdateStatus('shippingStatus', e.target.value)}
            style={{ fontSize: 11, background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
          >
            <option value="PENDING">Pending</option>
            <option value="PACKED">Packed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </div>
      </div>

      {/* TABS HEADER */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'items' ? 'active' : ''}`}
          onClick={() => setActiveTab('items')}
        >
          Line Items & Production ({order.items?.length || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          Print Farm Jobs ({order.printJobs?.length || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === 'qc' ? 'active' : ''}`}
          onClick={() => setActiveTab('qc')}
        >
          Quality Inspections ({order.inspections?.length || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === 'invoices' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          Invoices & Financials ({order.invoices?.length || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === 'shipment' ? 'active' : ''}`}
          onClick={() => setActiveTab('shipment')}
        >
          Logistics & Shipping ({order.shipments?.length || 0})
        </button>
      </div>

      {/* TAB CONTENT: ITEMS & SUMMARY */}
      {activeTab === 'items' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Items Table */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <ShoppingBag size={16} color="var(--accent-red)" /> Manufacturing Line Items
                </div>
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>SKU</th>
                    <th style={{ textAlign: 'center' }}>Ordered Qty</th>
                    <th style={{ textAlign: 'center' }}>Produced</th>
                    <th style={{ textAlign: 'right' }}>Unit Price</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((it: any) => (
                    <tr key={it.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{it.name}</div>
                        {it.description && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{it.description}</div>
                        )}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: 11.5 }}>{it.sku || 'CUSTOM'}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{it.quantity}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-purple" style={{ fontSize: 11 }}>
                          {it.producedQty || 0} / {it.quantity}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {formatCurrency(it.unitPrice)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>
                        {formatCurrency(it.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Shipping & Delivery Address Card */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 8, fontSize: 13 }}>
                <Truck size={15} color="var(--accent-red)" /> Shipping & Dispatch Address
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {order.shippingAddress || order.customer?.address || 'No dispatch address specified'}
              </div>
              {order.notes && (
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-subtle)', fontSize: 12, color: 'var(--text-muted)' }}>
                  <strong>Notes: </strong> {order.notes}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: CUSTOMER & FINANCIALS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Customer Details */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <UserCheck size={16} color="var(--accent-red)" /> Customer
                </div>
                <Link
                  href={`/customers/${order.customer.id}`}
                  style={{ fontSize: 11.5, color: 'var(--accent-red)', textDecoration: 'none' }}
                >
                  View 360° →
                </Link>
              </div>

              <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{order.customer.name}</div>
                {order.customer.company && (
                  <div style={{ color: 'var(--text-muted)' }}>{order.customer.company}</div>
                )}
                <div style={{ marginTop: 6 }}>{order.customer.phone || order.customer.email}</div>
                {order.customer.gstin && (
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>
                    GSTIN: {order.customer.gstin}
                  </div>
                )}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="card" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <div className="card-title" style={{ marginBottom: 14 }}>
                Commercial Summary
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Items Subtotal:</span>
                  <span style={{ fontFamily: 'monospace' }}>{formatCurrency(order.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Shipping & Freight:</span>
                  <span style={{ fontFamily: 'monospace' }}>{formatCurrency(order.shippingCost)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>GST (18%):</span>
                  <span style={{ fontFamily: 'monospace' }}>{formatCurrency(order.taxAmount)}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: '2px solid var(--border-default)',
                    paddingTop: 10,
                    fontSize: 16,
                    fontWeight: 800,
                  }}
                >
                  <span>Order Total:</span>
                  <span style={{ color: 'var(--status-success)' }}>
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PRINT JOBS */}
      {activeTab === 'jobs' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Cpu size={16} color="var(--accent-red)" /> Production Print Jobs
            </div>
            <button
              onClick={() => router.push(`/production?orderId=${order.id}`)}
              className="btn btn-primary btn-sm"
            >
              <Plus size={13} /> Queue Job for Order
            </button>
          </div>

          {order.printJobs?.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No print jobs launched yet for this order.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {order.printJobs.map((job: any) => (
                <div
                  key={job.id}
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
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{job.jobCode}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      Printer: {job.printer?.name || 'Unassigned'} &bull; Filament: {job.filamentSpool?.brand || 'Standard'} {job.filamentSpool?.material || ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <StatusBadge status={job.status} />
                    <StatusBadge status={job.qcStatus} label={`QC: ${job.qcStatus}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: QC */}
      {activeTab === 'qc' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <ShieldCheck size={16} color="var(--accent-red)" /> Quality Inspections
            </div>
          </div>
          {order.inspections?.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              Parts are currently in production. Final QC inspection will appear here once printed.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {order.inspections.map((qc: any) => (
                <div
                  key={qc.id}
                  style={{
                    padding: '12px 14px',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{qc.qcCode} &bull; {qc.specification}</span>
                    <StatusBadge status={qc.result} />
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                    Required: {qc.requiredValue} | Actual: {qc.actualValue} | Tolerance: {qc.tolerance}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: INVOICES */}
      {activeTab === 'invoices' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <CreditCard size={16} color="var(--accent-red)" /> Linked Invoices
            </div>
            {!hasInvoice && (
              <button onClick={handleGenerateInvoice} className="btn btn-primary btn-sm">
                <Plus size={13} /> Generate Invoice
              </button>
            )}
          </div>
          {order.invoices?.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No tax invoice issued yet. Click &quot;Generate Tax Invoice&quot; to issue.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {order.invoices.map((inv: any) => (
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
                      Total: {formatCurrency(inv.grandTotal)} &bull; Balance Due: {formatCurrency(inv.balanceDue)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusBadge status={inv.status} />
                    <Link
                      href={`/finance/invoices/${inv.id}/print`}
                      target="_blank"
                      className="btn btn-secondary btn-sm"
                    >
                      <Printer size={13} /> PDF
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SHIPMENT */}
      {activeTab === 'shipment' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Truck size={16} color="var(--accent-red)" /> Logistics & Shipping Consignments
            </div>
          </div>
          {order.shipments?.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              Order has not been dispatched yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {order.shipments.map((shp: any) => (
                <div
                  key={shp.id}
                  style={{
                    padding: '12px 14px',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{shp.courierName}: {shp.trackingNumber}</span>
                    <StatusBadge status={shp.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Order Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Order: ${order?.orderNumber || ''}`}
      >
        <form onSubmit={handleUpdateOrder} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Lifecycle Status
              </label>
              <select
                value={editOrderForm.overallStatus || 'PENDING'}
                onChange={(e) => setEditOrderForm({ ...editOrderForm, overallStatus: e.target.value })}
                className="input"
                style={{ width: '100%' }}
              >
                {ORDER_STATUSES.map((st) => (
                  <option key={st.value} value={st.value}>{st.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Priority
              </label>
              <select
                value={editOrderForm.priority || 'MEDIUM'}
                onChange={(e) => setEditOrderForm({ ...editOrderForm, priority: e.target.value })}
                className="input"
                style={{ width: '100%' }}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Target Due Date
            </label>
            <input
              type="date"
              className="input"
              value={editOrderForm.dueDate || ''}
              onChange={(e) => setEditOrderForm({ ...editOrderForm, dueDate: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Shipping Address
            </label>
            <textarea
              className="input"
              rows={2}
              value={editOrderForm.shippingAddress || ''}
              onChange={(e) => setEditOrderForm({ ...editOrderForm, shippingAddress: e.target.value })}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Production & Delivery Notes
            </label>
            <textarea
              className="input"
              rows={2}
              value={editOrderForm.notes || ''}
              onChange={(e) => setEditOrderForm({ ...editOrderForm, notes: e.target.value })}
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
              Save Order Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
