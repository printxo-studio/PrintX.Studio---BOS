'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  Truck,
  Cpu,
  ShieldCheck,
  CreditCard,
  DollarSign,
  AlertTriangle,
  Edit2,
  Trash2,
} from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KPICard } from '@/components/ui/KPICard';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/calculations';
import { ORDER_STATUSES } from '@/lib/constants';

export default function OrdersListPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editOrderForm, setEditOrderForm] = useState<any>({});

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenEditOrder = (order: any) => {
    setEditOrderForm({
      id: order.id,
      orderNumber: order.orderNumber,
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
      const res = await fetch(`/api/orders/${editOrderForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editOrderForm),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchOrders();
      } else {
        alert('Failed to update order');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating order');
    }
  };

  const handleDeleteOrder = async (id: string, orderNumber: string) => {
    if (!confirm(`Are you sure you want to delete order "${orderNumber}"? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchOrders();
      } else {
        alert('Failed to delete order. It may have associated print jobs or invoices.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting order');
    }
  };

  // Commercial & Operations KPIs
  const totalOrderValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const activeOrders = orders.filter((o) => !['COMPLETED', 'CANCELLED'].includes(o.overallStatus));
  const inProduction = orders.filter((o) => o.overallStatus === 'IN_PRODUCTION' || o.productionStatus === 'IN_PROGRESS');
  const pendingQC = orders.filter((o) => o.qcStatus === 'PENDING' || o.overallStatus === 'READY');

  const filteredOrders =
    statusFilter === 'ALL'
      ? orders
      : orders.filter((o) => o.overallStatus === statusFilter);

  const columns: Column<any>[] = [
    {
      key: 'orderNumber',
      header: 'Order #',
      render: (item) => (
        <Link
          href={`/orders/${item.id}`}
          style={{ fontWeight: 700, color: 'var(--accent-red)', textDecoration: 'none' }}
        >
          {item.orderNumber}
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
      key: 'dates',
      header: 'Order / Due Date',
      render: (item) => (
        <div style={{ fontSize: 11.5 }}>
          <div>Ordered: {new Date(item.orderDate).toLocaleDateString()}</div>
          <div
            style={{
              color: item.dueDate && new Date(item.dueDate) < new Date() ? 'var(--status-danger)' : 'var(--text-muted)',
              fontWeight: item.dueDate && new Date(item.dueDate) < new Date() ? 700 : 400,
            }}
          >
            Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'Immediate'}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'items',
      header: 'Items Summary',
      render: (item) => (
        <div style={{ fontSize: 12 }}>
          {item.items?.map((it: any, idx: number) => (
            <div key={idx} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
              {it.quantity}x {it.name}
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Total Value',
      render: (item) => (
        <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 13 }}>
          {formatCurrency(item.totalAmount)}
        </div>
      ),
      sortable: true,
      width: '110px',
    },
    {
      key: 'statuses',
      header: 'Sub-Statuses',
      render: (item) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <StatusBadge status={item.paymentStatus} label={`Pay: ${item.paymentStatus}`} />
          <StatusBadge status={item.productionStatus} label={`Prod: ${item.productionStatus}`} />
        </div>
      ),
      width: '120px',
    },
    {
      key: 'overallStatus',
      header: 'Lifecycle Status',
      render: (item) => <StatusBadge status={item.overallStatus} />,
      sortable: true,
      width: '130px',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Link
            href={`/orders/${item.id}`}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: 11, padding: '3px 8px' }}
          >
            Manage <ArrowRight size={12} />
          </Link>
          <button
            onClick={() => handleOpenEditOrder(item)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 6px', color: 'var(--text-secondary)' }}
            title="Edit Order"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => handleDeleteOrder(item.id, item.orderNumber)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 6px', color: 'var(--accent-red)' }}
            title="Delete Order"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
      width: '160px',
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ShoppingBag size={22} color="var(--accent-red)" /> Manufacturing Orders
          </h1>
          <p className="page-subtitle">
            Order Fulfillment &bull; Live Production Pipeline &bull; QC Gating &bull; Invoicing & Dispatch
          </p>
        </div>

        <Link href="/orders/new" className="btn btn-primary btn-sm">
          <Plus size={15} /> Book New Order
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard
          label="Active Orders"
          value={activeOrders.length}
          subtext="In fulfillment pipeline"
          icon={ShoppingBag}
        />
        <KPICard
          label="In Production Farm"
          value={inProduction.length}
          subtext="Queued or printing"
          icon={Cpu}
          accentColor="var(--status-purple)"
        />
        <KPICard
          label="Pending Quality Check"
          value={pendingQC.length}
          subtext="Printed, awaiting QC signoff"
          icon={ShieldCheck}
          accentColor="var(--status-warning)"
        />
        <KPICard
          label="Total Order Revenue"
          value={formatCurrency(totalOrderValue)}
          subtext={`${orders.length} lifetime orders`}
          icon={DollarSign}
          accentColor="var(--status-success)"
        />
      </div>

      {/* Lifecycle Status Filter Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => setStatusFilter('ALL')}
        >
          All Orders ({orders.length})
        </button>
        {ORDER_STATUSES.map((st) => (
          <button
            key={st.value}
            className={`tab-btn ${statusFilter === st.value ? 'active' : ''}`}
            onClick={() => setStatusFilter(st.value)}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Orders Data Table */}
      <DataTable
        columns={columns}
        data={filteredOrders}
        searchPlaceholder="Search orders by number, customer, part name..."
        searchKeys={['orderNumber']}
        pageSize={10}
      />

      {/* Edit Order Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Order: ${editOrderForm.orderNumber || ''}`}
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
