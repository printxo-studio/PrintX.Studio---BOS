'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShoppingBag,
  Plus,
  Trash2,
  Calendar,
  UserCheck,
  Building,
  Truck,
  ArrowLeft,
} from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';

function NewOrderWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCustomerId = searchParams.get('customerId') || '';

  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(preselectedCustomerId);
  const [priority, setPriority] = useState('NORMAL');
  const [dueDate, setDueDate] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCost, setShippingCost] = useState(250);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState<any[]>([
    {
      name: 'Custom 3D Print Part',
      sku: 'PRX-CUSTOM-01',
      description: 'Additive manufactured component',
      quantity: 1,
      unitPrice: 1200,
      taxRate: 18.0,
      lineTotal: 1200,
    },
  ]);

  useEffect(() => {
    fetch('/api/crm/customers')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setCustomers(data);
        if (!selectedCustomerId && data.length > 0) {
          setSelectedCustomerId(data[0].id);
          setShippingAddress(data[0].address || '');
        }
      });
  }, []);

  const handleCustomerChange = (id: string) => {
    setSelectedCustomerId(id);
    const found = customers.find((c) => c.id === id);
    if (found?.address) setShippingAddress(found.address);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        name: 'New Manufacturing Item',
        sku: '',
        description: '',
        quantity: 1,
        unitPrice: 500,
        taxRate: 18.0,
        lineTotal: 500,
      },
    ]);
  };

  const handleItemChange = (idx: number, field: string, val: any) => {
    const updated = [...items];
    updated[idx][field] = val;
    const qty = updated[idx].quantity || 1;
    const price = updated[idx].unitPrice || 0;
    updated[idx].lineTotal = Math.round(qty * price);
    setItems(updated);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const taxAmount = Math.round((subtotal + shippingCost) * 0.18);
  const totalAmount = subtotal + shippingCost + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert('Please select a customer.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          priority,
          dueDate: dueDate || null,
          shippingAddress,
          shippingCost,
          subtotal,
          taxAmount,
          totalAmount,
          notes,
          items,
          overallStatus: 'CONFIRMED',
          productionStatus: 'PENDING',
          paymentStatus: 'PENDING',
        }),
      });

      if (res.ok) {
        const order = await res.json();
        router.push(`/orders/${order.id}`);
      } else {
        alert('Failed to book order');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="breadcrumbs">
        <Link href="/orders">Orders</Link>
        <span>/</span>
        <span>Book Direct Order</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ShoppingBag size={22} color="var(--accent-red)" /> Book Direct Manufacturing Order
          </h1>
          <p className="page-subtitle">
            Enter client part requirements &bull; Set delivery deadline &bull; Queue for production
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, alignItems: 'flex-start' }}>
          {/* LEFT: CUSTOMER & LINE ITEMS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Customer & Priority */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <UserCheck size={16} color="var(--accent-red)" /> Customer & Schedule
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Client / Customer *</label>
                  <select
                    className="form-control"
                    value={selectedCustomerId}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.customerCode} - {c.name} {c.company ? `(${c.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-control"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent / Rush</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Production Target Due Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Shipping / Courier Cost (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            {/* Line Items Card */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <ShoppingBag size={16} color="var(--accent-red)" /> Order Line Items
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 11 }}
                >
                  <Plus size={13} /> Add Item
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 14,
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--accent-red)' }}>
                        Item #{idx + 1}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: 4, color: 'var(--status-danger)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Part Name *</label>
                        <input
                          type="text"
                          required
                          className="form-control"
                          value={item.name}
                          onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">SKU</label>
                        <input
                          type="text"
                          className="form-control"
                          value={item.sku}
                          onChange={(e) => handleItemChange(idx, 'sku', e.target.value)}
                          placeholder="PRX-001"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          required
                          className="form-control"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Unit Price (₹)</label>
                        <input
                          type="number"
                          required
                          className="form-control"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Line Total</label>
                        <input
                          type="text"
                          disabled
                          className="form-control"
                          style={{ fontFamily: 'monospace', fontWeight: 700 }}
                          value={`₹${item.lineTotal}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address & Notes */}
            <div className="card">
              <div className="form-group">
                <label className="form-label">Shipping / Delivery Address</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Full dispatch address for courier delivery..."
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Production & QC Notes</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Material specs, tolerances, packing instructions..."
                />
              </div>
            </div>
          </div>

          {/* RIGHT: ORDER SUMMARY & SUBMIT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <div className="card-title" style={{ marginBottom: 14 }}>
                Commercial Order Summary
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Items Subtotal:</span>
                  <span style={{ fontFamily: 'monospace' }}>{formatCurrency(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Shipping & Packaging:</span>
                  <span style={{ fontFamily: 'monospace' }}>{formatCurrency(shippingCost)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>GST (18%):</span>
                  <span style={{ fontFamily: 'monospace' }}>{formatCurrency(taxAmount)}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: '2px solid var(--border-default)',
                    paddingTop: 10,
                    fontSize: 18,
                    fontWeight: 800,
                  }}
                >
                  <span>Grand Total:</span>
                  <span style={{ color: 'var(--status-success)' }}>
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={loading}
                >
                  {loading ? 'Booking Order...' : 'Confirm & Book Order →'}
                </button>
                <Link
                  href="/orders"
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <Suspense fallback={<div className="card" style={{ margin: 24, textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading Order Form...</div>}>
      <NewOrderWizard />
    </Suspense>
  );
}
