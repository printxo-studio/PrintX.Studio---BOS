'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Truck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Package,
  ExternalLink,
  MapPin,
  Calendar,
  Check,
  RotateCcw,
  Boxes,
  ArrowRight,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KPICard } from '@/components/ui/KPICard';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/calculations';

const COURIERS = ['Delhivery', 'Blue Dart', 'DTDC', 'Speed Post', 'Porter', 'Bluedart Express'];

export default function ShippingPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<any | null>(null);

  // Forms
  const [newShipmentForm, setNewShipmentForm] = useState({
    orderId: '',
    courierName: 'Delhivery',
    trackingNumber: 'DEL-9928172635',
    trackingUrl: 'https://www.delhivery.com/track/package/DEL-9928172635',
    shippingCost: '350',
    status: 'SHIPPED',
    notes: 'Fragile carbon fiber components. High grade protective bubble wrapping applied.',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [shpRes, ordRes] = await Promise.all([
        fetch(`/api/shipping?status=${statusFilter}`),
        fetch('/api/orders'),
      ]);

      if (shpRes.ok) setShipments(await shpRes.json());
      if (ordRes.ok) {
        const ordData = await ordRes.json();
        setOrders(ordData);
        if (ordData.length > 0 && !newShipmentForm.orderId) {
          setNewShipmentForm((prev) => ({ ...prev, orderId: ordData[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load shipping data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShipmentForm),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkDelivered = async (id: string) => {
    try {
      const res = await fetch(`/api/shipping/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DELIVERED' }),
      });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // KPIs
  const totalShipments = shipments.length;
  const inTransitCount = shipments.filter((s) => s.status === 'IN_TRANSIT' || s.status === 'SHIPPED').length;
  const deliveredCount = shipments.filter((s) => s.status === 'DELIVERED').length;
  const totalShippingSpend = shipments.reduce((sum, s) => sum + (s.shippingCost || 0), 0);

  // Filtered by Search
  const filteredShipments = shipments.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.shipmentCode.toLowerCase().includes(q) ||
      (s.trackingNumber && s.trackingNumber.toLowerCase().includes(q)) ||
      s.courierName.toLowerCase().includes(q) ||
      (s.order?.orderNumber && s.order.orderNumber.toLowerCase().includes(q)) ||
      (s.order?.customer?.name && s.order.customer.name.toLowerCase().includes(q));
    return matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--accent-red)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Fulfillment & Logistics
            </span>
            <span style={{ color: 'var(--text-tertiary)' }}>•</span>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              Section 26: Courier Waybills & Tracking
            </span>
          </div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginTop: 4,
            }}
          >
            Shipping & Dispatch
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Courier waybill tracking, live in-transit parcel monitoring, delivery proof, and client dispatch notifications.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              backgroundColor: 'var(--accent-red)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 10px var(--accent-red-glow)',
            }}
          >
            <Plus size={16} />
            Create Waybill / Dispatch
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        <KPICard
          label="Total Shipments"
          value={totalShipments}
          subtext="Parcels dispatched to clients"
          icon={Truck}
        />
        <KPICard
          label="In-Transit"
          value={inTransitCount}
          subtext="On the road with couriers"
          icon={Package}
        />
        <KPICard
          label="Delivered Orders"
          value={deliveredCount}
          subtext="Completed client deliveries"
          icon={CheckCircle2}
        />
        <KPICard
          label="Shipping Expenditure"
          value={formatCurrency(totalShippingSpend)}
          subtext="Net freight charges paid"
          icon={Boxes}
        />
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 260 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              width: '100%',
              maxWidth: 360,
            }}
          >
            <Search size={16} color="var(--text-tertiary)" />
            <input
              type="text"
              placeholder="Search by code, tracking #, courier, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: 13,
                outline: 'none',
                width: '100%',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={15} color="var(--text-tertiary)" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: 13,
                padding: '6px 10px',
                outline: 'none',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="SHIPPED">Shipped</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="DELIVERED">Delivered</option>
              <option value="DELAYED">Delayed</option>
              <option value="PENDING">Pending Packing</option>
            </select>
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          Showing {filteredShipments.length} shipments
        </div>
      </div>

      {/* Shipments Table */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                }}
              >
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Shipment Code</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Customer & Order</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Courier & Tracking AWB</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Ship Date / ETA</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Freight Cost</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    Loading dispatch register...
                  </td>
                </tr>
              ) : filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    No shipments found matching filters.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((shp) => (
                  <tr
                    key={shp.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      fontSize: 13,
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-canvas)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* Code */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                        {shp.shipmentCode}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                        {new Date(shp.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Customer & Order */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {shp.order?.customer?.name || 'Walk-in Client'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                        Order: {shp.order?.orderNumber}
                      </div>
                    </td>

                    {/* Courier & AWB */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {shp.courierName}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--accent-red)' }}>
                          {shp.trackingNumber || 'Manual Delivery'}
                        </span>
                        {shp.trackingUrl && (
                          <a
                            href={shp.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--text-tertiary)' }}
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Dates */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ color: 'var(--text-primary)', fontSize: 12 }}>
                        Shipped: {shp.shipDate ? new Date(shp.shipDate).toLocaleDateString() : '-'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                        ETA: {shp.expectedDelivery ? new Date(shp.expectedDelivery).toLocaleDateString() : '3 business days'}
                      </div>
                    </td>

                    {/* Freight Cost */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {formatCurrency(shp.shippingCost)}
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge status={shp.status} />
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        {shp.status !== 'DELIVERED' && (
                          <button
                            onClick={() => handleMarkDelivered(shp.id)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: 'rgba(16, 185, 129, 0.15)',
                              border: '1px solid rgba(16, 185, 129, 0.4)',
                              borderRadius: 4,
                              color: 'var(--accent-green, #10b981)',
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Check size={12} />
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DISPATCH MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Shipment & Courier Waybill"
      >
        <form onSubmit={handleCreateShipment} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Linked Production Order
            </label>
            <select
              required
              value={newShipmentForm.orderId}
              onChange={(e) => setNewShipmentForm({ ...newShipmentForm, orderId: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                color: 'var(--text-primary)',
              }}
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} — {o.customer?.name} ({formatCurrency(o.totalAmount)})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Courier Service
              </label>
              <select
                value={newShipmentForm.courierName}
                onChange={(e) => setNewShipmentForm({ ...newShipmentForm, courierName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              >
                {COURIERS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Tracking / AWB Number
              </label>
              <input
                type="text"
                required
                value={newShipmentForm.trackingNumber}
                onChange={(e) => setNewShipmentForm({ ...newShipmentForm, trackingNumber: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Tracking URL
            </label>
            <input
              type="url"
              value={newShipmentForm.trackingUrl}
              onChange={(e) => setNewShipmentForm({ ...newShipmentForm, trackingUrl: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Shipping Cost (₹)
              </label>
              <input
                type="number"
                value={newShipmentForm.shippingCost}
                onChange={(e) => setNewShipmentForm({ ...newShipmentForm, shippingCost: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Initial Status
              </label>
              <select
                value={newShipmentForm.status}
                onChange={(e) => setNewShipmentForm({ ...newShipmentForm, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              >
                <option value="SHIPPED">SHIPPED</option>
                <option value="IN_TRANSIT">IN_TRANSIT</option>
                <option value="PACKED">PACKED (Ready for Pickup)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Packaging & Handling Instructions
            </label>
            <textarea
              rows={2}
              value={newShipmentForm.notes}
              onChange={(e) => setNewShipmentForm({ ...newShipmentForm, notes: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                color: 'var(--text-primary)',
                resize: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 18px',
                backgroundColor: 'var(--accent-red)',
                border: 'none',
                borderRadius: 4,
                color: '#ffffff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Dispatch Shipment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
