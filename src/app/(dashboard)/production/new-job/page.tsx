'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/calculations';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Cpu,
  Printer,
  Disc,
  Box,
  ShoppingBag,
  Clock,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

function NewPrintJobForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedOrderId = searchParams.get('orderId') || '';
  const preselectedProductId = searchParams.get('productId') || '';

  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [printers, setPrinters] = useState<any[]>([]);
  const [spools, setSpools] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    orderId: preselectedOrderId,
    productId: preselectedProductId,
    printerId: '',
    filamentSpoolId: '',
    quantity: '1',
    estimatedTimeHours: '3.5',
    estimatedFilamentG: '85',
    status: 'QUEUED',
    notes: '',
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/orders').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/products').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/printers').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/filament').then((r) => (r.ok ? r.json() : [])),
    ]).then(([ords, prods, prts, spls]) => {
      setOrders(ords);
      setProducts(prods);
      setPrinters(prts);
      setSpools(spls);

      // Defaults
      if (prts.length > 0) {
        setFormData((prev) => ({
          ...prev,
          printerId: prts[0].id,
          filamentSpoolId: spls.length > 0 ? spls[0].id : '',
        }));
      }
    });
  }, []);

  const handleProductSelect = (productId: string) => {
    const p = products.find((prod) => prod.id === productId);
    setFormData((prev) => ({
      ...prev,
      productId,
      estimatedTimeHours: p ? String(p.standardPrintTimeHours || 3.5) : prev.estimatedTimeHours,
      estimatedFilamentG: p ? String(p.standardFilamentGrams || 85) : prev.estimatedFilamentG,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.printerId) {
      alert('Please select a printer.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/production/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/production');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to dispatch print job');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedSpool = spools.find((s) => s.id === formData.filamentSpoolId);
  const estGrams = parseFloat(formData.estimatedFilamentG) || 0;
  const isInsufficientSpool = selectedSpool && selectedSpool.currentWeightG < estGrams;

  return (
    <div>
      <div className="breadcrumbs">
        <Link href="/production">Production</Link>
        <span>/</span>
        <span>Queue New Print Job</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Cpu size={22} color="var(--accent-red)" /> Queue Production Print Job
          </h1>
          <p className="page-subtitle">
            Assign manufacturing order & product to farm printer & filament spool
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 780 }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Order & Product Association */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Link to Order (Optional)</label>
              <select
                className="form-control"
                value={formData.orderId}
                onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
              >
                <option value="">-- Internal / Standalone Shop Job --</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} &bull; {o.customer?.name} ({formatCurrency(o.totalAmount)})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Select Product *</label>
              <select
                className="form-control"
                value={formData.productId}
                onChange={(e) => handleProductSelect(e.target.value)}
              >
                <option value="">-- Custom Engineering Part --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} - {p.name} ({p.materialName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Machine & Spool Selection (Section 15 & 16) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Assign Farm Machine *</label>
              <select
                className="form-control"
                value={formData.printerId}
                onChange={(e) => setFormData({ ...formData, printerId: e.target.value })}
                required
              >
                {printers.map((prt) => (
                  <option key={prt.id} value={prt.id}>
                    {prt.name} &bull; {prt.nozzleSize}mm &bull; [{prt.status}]
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assign Filament Spool *</label>
              <select
                className="form-control"
                value={formData.filamentSpoolId}
                onChange={(e) => setFormData({ ...formData, filamentSpoolId: e.target.value })}
                required
              >
                {spools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.brand} {s.material} ({s.color}) &bull; {s.currentWeightG}g left &bull; [{s.spoolCode}]
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Spool Weight Alert (Section 48 Validation) */}
          {isInsufficientSpool && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: 'var(--status-danger-bg)',
                border: '1px solid var(--status-danger-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--status-danger)',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertCircle size={16} />
              Warning: Spool only has {selectedSpool.currentWeightG}g remaining, which is less than the required {estGrams}g!
            </div>
          )}

          {/* Time, Filament, Quantity */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Quantity to Print</label>
              <input
                type="number"
                min="1"
                required
                className="form-control"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Print Hours *</label>
              <input
                type="number"
                step="0.1"
                required
                className="form-control"
                value={formData.estimatedTimeHours}
                onChange={(e) => setFormData({ ...formData, estimatedTimeHours: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Filament (g) *</label>
              <input
                type="number"
                required
                className="form-control"
                value={formData.estimatedFilamentG}
                onChange={(e) => setFormData({ ...formData, estimatedFilamentG: e.target.value })}
              />
            </div>
          </div>

          {/* Job Dispatch Status */}
          <div className="form-group">
            <label className="form-label">Initial Dispatch State</label>
            <select
              className="form-control"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="QUEUED">Queued (Wait in Farm Queue)</option>
              <option value="PRINTING">Printing Immediately (Machine Ready)</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Operator Notes / Slicer Settings</label>
            <textarea
              className="form-control"
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Bed adhesion notes, tree support style, infill pattern..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <Link href="/production" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || isInsufficientSpool}
            >
              {loading ? 'Queueing...' : 'Dispatch Print Job →'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function NewPrintJobPage() {
  return (
    <Suspense fallback={<div className="card" style={{ margin: 24, textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading Print Job Form...</div>}>
      <NewPrintJobForm />
    </Suspense>
  );
}

