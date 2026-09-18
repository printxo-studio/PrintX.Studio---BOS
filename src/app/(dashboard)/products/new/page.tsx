'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Cpu,
  Layers,
  DollarSign,
  FileCode,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Functional / Engineering',
    productType: 'STANDARD',
    description: '',
    materialName: 'PA-CF',
    recommendedPrinter: 'Bambu Lab X1-Carbon',
    nozzleSize: '0.4',
    layerHeight: '0.2',
    infillPercent: '30',
    wallCount: '4',
    supportRequired: false,
    standardPrintTimeHours: '3.5',
    standardFilamentGrams: '85',
    sellingPrice: '1500',
    productionCost: '450',
    stlFileUrl: '',
    threeMfUrl: '',
    stepFileUrl: '',
  });

  const selling = parseFloat(formData.sellingPrice) || 0;
  const cost = parseFloat(formData.productionCost) || 0;
  const marginPercent = selling > 0 ? Math.round(((selling - cost) / selling) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const prod = await res.json();
        router.push(`/products/${prod.id}`);
      } else {
        alert('Failed to create product');
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
        <Link href="/products">Products</Link>
        <span>/</span>
        <span>New Product Master</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Box size={22} color="var(--accent-red)" /> Create Product Master
          </h1>
          <p className="page-subtitle">
            Configure CAD metadata &bull; Slicer manufacturing presets &bull; Commercial cost modeling
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, alignItems: 'flex-start' }}>
          {/* LEFT COLUMN: GENERAL & MANUFACTURING */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* General Info */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Box size={16} color="var(--accent-red)" /> Product Identification
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Product / Part Name *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Carbon Fiber Drone Motor Arm"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">SKU (Auto-generated if blank)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="PRX-AERO-01"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Functional / Robotics / Prototype"
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Description & Engineering Purpose</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="High strength, chemical resistance, tolerances..."
                />
              </div>
            </div>

            {/* Manufacturing & Slicer Parameters (Section 12) */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Cpu size={16} color="var(--accent-red)" /> Standard Slicer & Print Presets
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Recommended Material</label>
                  <select
                    className="form-control"
                    value={formData.materialName}
                    onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                  >
                    <option value="PLA">PLA (Standard / Matte)</option>
                    <option value="PETG">PETG (Engineering Solid)</option>
                    <option value="ABS">ABS / ASA</option>
                    <option value="TPU">TPU-95A (Flexible)</option>
                    <option value="PA-CF">PA-CF (Carbon Fiber Nylon)</option>
                    <option value="PC">Polycarbonate</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Recommended Machine</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.recommendedPrinter}
                    onChange={(e) => setFormData({ ...formData, recommendedPrinter: e.target.value })}
                    placeholder="Bambu Lab X1-Carbon"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Nozzle (mm)</label>
                  <input
                    type="number"
                    step="0.2"
                    className="form-control"
                    value={formData.nozzleSize}
                    onChange={(e) => setFormData({ ...formData, nozzleSize: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Layer Height (mm)</label>
                  <input
                    type="number"
                    step="0.04"
                    className="form-control"
                    value={formData.layerHeight}
                    onChange={(e) => setFormData({ ...formData, layerHeight: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Infill %</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.infillPercent}
                    onChange={(e) => setFormData({ ...formData, infillPercent: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Wall Loops</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.wallCount}
                    onChange={(e) => setFormData({ ...formData, wallCount: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Standard Print Time (Hours)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={formData.standardPrintTimeHours}
                    onChange={(e) => setFormData({ ...formData, standardPrintTimeHours: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Standard Filament Weight (Grams)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.standardFilamentGrams}
                    onChange={(e) => setFormData({ ...formData, standardFilamentGrams: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* CAD File Links */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <FileCode size={16} color="var(--accent-red)" /> CAD / Slicer File References
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">STL File Storage URL / Key</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.stlFileUrl}
                    onChange={(e) => setFormData({ ...formData, stlFileUrl: e.target.value })}
                    placeholder="https://.../part.stl"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">3MF / Project File URL</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.threeMfUrl}
                    onChange={(e) => setFormData({ ...formData, threeMfUrl: e.target.value })}
                    placeholder="https://.../part.3mf"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: COMMERCIALS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <div className="card-title" style={{ marginBottom: 14 }}>
                <DollarSign size={16} color="var(--accent-red)" /> Commercial Pricing & Margins
              </div>

              <div className="form-group">
                <label className="form-label">Standard Production Cost (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.productionCost}
                  onChange={(e) => setFormData({ ...formData, productionCost: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Catalog Selling Price (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                />
              </div>

              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  marginTop: 10,
                  fontSize: 13,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Estimated Profit / Unit:</span>
                  <span style={{ fontWeight: 600, color: 'var(--status-success)' }}>
                    {formatCurrency(selling - cost)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Gross Margin:</span>
                  <span style={{ fontWeight: 800, color: marginPercent >= 50 ? 'var(--status-success)' : 'var(--accent-red)' }}>
                    {marginPercent}%
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
                  {loading ? 'Registering...' : 'Register Product & Release v1.0 →'}
                </button>
                <Link
                  href="/products"
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
