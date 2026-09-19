'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Cpu,
  Layers,
  History,
  ShieldCheck,
  ShoppingBag,
  Plus,
  ArrowLeft,
  Calendar,
  FileCode,
  Tag,
  GitBranch,
  Edit2,
  Trash2,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/calculations';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'manufacturing' | 'versions' | 'jobs' | 'qc' | 'orders'>('manufacturing');
  const [isNewVersionModalOpen, setIsNewVersionModalOpen] = useState(false);
  const [versionForm, setVersionForm] = useState({ version: '', changeLog: '', stlFileUrl: '', threeMfUrl: '' });
  const [releasing, setReleasing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});

  const fetchProduct = async () => {
    if (!params.id) return;
    try {
      const res = await fetch(`/api/products/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const handleReleaseVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    setReleasing(true);
    try {
      const res = await fetch(`/api/products/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'NEW_VERSION',
          version: versionForm.version || `${(parseFloat(product.currentVersion) + 0.1).toFixed(1)}`,
          changeLog: versionForm.changeLog,
          stlFileUrl: versionForm.stlFileUrl,
          threeMfUrl: versionForm.threeMfUrl,
        }),
      });
      if (res.ok) {
        setIsNewVersionModalOpen(false);
        setVersionForm({ version: '', changeLog: '', stlFileUrl: '', threeMfUrl: '' });
        fetchProduct();
      }
    } catch (err) {
      console.error(err);
    } finally {
        setReleasing(false);
    }
  };

  const handleOpenEditProduct = () => {
    if (!product) return;
    setEditFormData({
      name: product.name || '',
      sku: product.sku || '',
      category: product.category || '',
      materialName: product.materialName || '',
      status: product.status || 'ACTIVE',
      sellingPrice: product.sellingPrice || 0,
      productionCost: product.productionCost || 0,
      standardPrintTimeHours: product.standardPrintTimeHours || 0,
      standardFilamentGrams: product.standardFilamentGrams || 0,
      recommendedPrinter: product.recommendedPrinter || '',
      nozzleSize: product.nozzleSize || 0.4,
      layerHeight: product.layerHeight || 0.2,
      infillPercent: product.infillPercent || 20,
      wallCount: product.wallCount || 3,
      description: product.description || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/products/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchProduct();
      } else {
        alert('Failed to update product specs');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating product');
    }
  };

  const handleDeleteProduct = async () => {
    if (!confirm(`Are you sure you want to delete product "${product.name}" (${product.sku})? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/products/${params.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/products');
      } else {
        alert('Failed to delete product. It may have associated order items or print jobs.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting product');
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading Product Specs...</div>;
  if (!product) return <div style={{ padding: 40, textAlign: 'center' }}>Product Not Found</div>;

  return (
    <div>
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <Link href="/products">Products</Link>
        <span>/</span>
        <span>{product.sku}</span>
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
              width: 50,
              height: 50,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-red-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-red)',
            }}
          >
            <Box size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800 }}>{product.name}</h1>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: 12,
                  fontWeight: 700,
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  padding: '2px 8px',
                  borderRadius: 4,
                }}
              >
                {product.sku}
              </span>
              <span className="badge badge-accent" style={{ fontSize: 11, fontWeight: 800 }}>
                v{product.currentVersion}
              </span>
              <StatusBadge status={product.status} />
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>
              Category: {product.category || 'Standard Part'} &bull; Selling Price:{' '}
              {formatCurrency(product.sellingPrice)} ({product.estimatedMargin}% margin)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={handleOpenEditProduct}
            className="btn btn-secondary btn-sm"
          >
            <Edit2 size={14} /> Edit Product
          </button>
          {/* Section 12: Release New Revision Action */}
          <button
            onClick={() => setIsNewVersionModalOpen(true)}
            className="btn btn-secondary btn-sm"
          >
            <GitBranch size={14} /> Release Revision (v{(parseFloat(product.currentVersion) + 0.1).toFixed(1)})
          </button>
          <button
            onClick={() => router.push(`/production?productId=${product.id}`)}
            className="btn btn-primary btn-sm"
          >
            <Cpu size={14} /> Queue Print Job
          </button>
          <button
            onClick={handleDeleteProduct}
            className="btn btn-secondary btn-sm"
            style={{ color: 'var(--accent-red)', borderColor: 'var(--border-default)' }}
            title="Delete Product"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'manufacturing' ? 'active' : ''}`}
          onClick={() => setActiveTab('manufacturing')}
        >
          Manufacturing Presets
        </button>
        <button
          className={`tab-btn ${activeTab === 'versions' ? 'active' : ''}`}
          onClick={() => setActiveTab('versions')}
        >
          Revision History ({product.versions?.length || 1})
        </button>
        <button
          className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          Production Jobs ({product.printJobs?.length || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === 'qc' ? 'active' : ''}`}
          onClick={() => setActiveTab('qc')}
        >
          Quality Inspections ({product.inspections?.length || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders ({product.orderItems?.length || 0})
        </button>
      </div>

      {/* TAB CONTENT: MANUFACTURING */}
      {activeTab === 'manufacturing' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Cpu size={16} color="var(--accent-red)" /> Slicer & Print Specifications
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 13 }}>
              <div style={{ padding: 10, backgroundColor: 'var(--bg-surface)', borderRadius: 4 }}>
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Recommended Material:</div>
                <div style={{ fontWeight: 700, marginTop: 2 }}>{product.materialName || 'PLA'}</div>
              </div>
              <div style={{ padding: 10, backgroundColor: 'var(--bg-surface)', borderRadius: 4 }}>
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Recommended Machine:</div>
                <div style={{ fontWeight: 700, marginTop: 2 }}>{product.recommendedPrinter || 'Bambu Lab X1-Carbon'}</div>
              </div>
              <div style={{ padding: 10, backgroundColor: 'var(--bg-surface)', borderRadius: 4 }}>
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Nozzle Diameter:</div>
                <div style={{ fontWeight: 700, marginTop: 2 }}>{product.nozzleSize} mm</div>
              </div>
              <div style={{ padding: 10, backgroundColor: 'var(--bg-surface)', borderRadius: 4 }}>
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Layer Height:</div>
                <div style={{ fontWeight: 700, marginTop: 2 }}>{product.layerHeight} mm</div>
              </div>
              <div style={{ padding: 10, backgroundColor: 'var(--bg-surface)', borderRadius: 4 }}>
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Infill & Wall Loops:</div>
                <div style={{ fontWeight: 700, marginTop: 2 }}>
                  {product.infillPercent}% infill &bull; {product.wallCount} walls
                </div>
              </div>
              <div style={{ padding: 10, backgroundColor: 'var(--bg-surface)', borderRadius: 4 }}>
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Support Structure:</div>
                <div style={{ fontWeight: 700, marginTop: 2 }}>
                  {product.supportRequired ? 'Required (Tree/Auto)' : 'None (Self-supporting)'}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div className="card-title" style={{ fontSize: 13, marginBottom: 8 }}>
                Description & Tolerances
              </div>
              <div
                style={{
                  padding: 12,
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12.5,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                {product.description || 'No special engineering tolerances recorded.'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <div className="card-title" style={{ marginBottom: 12 }}>
                Manufacturing Standards
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Standard Print Time:</span>
                  <span style={{ fontWeight: 700 }}>{product.standardPrintTimeHours} Hours</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Standard Filament Usage:</span>
                  <span style={{ fontWeight: 700 }}>{product.standardFilamentGrams} Grams</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Standard Production Cost:</span>
                  <span style={{ fontFamily: 'monospace' }}>{formatCurrency(product.productionCost)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Catalog Selling Price:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{formatCurrency(product.sellingPrice)}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-default)',
                    paddingTop: 8,
                    fontWeight: 800,
                  }}
                >
                  <span>Gross Margin:</span>
                  <span style={{ color: 'var(--status-success)' }}>{product.estimatedMargin}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: VERSIONS (Section 12) */}
      {activeTab === 'versions' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <History size={16} color="var(--accent-red)" /> Product Revision History (Section 12)
            </div>
            <button
              onClick={() => setIsNewVersionModalOpen(true)}
              className="btn btn-primary btn-sm"
            >
              <Plus size={13} /> Release Revision
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {product.versions.map((v: any) => (
              <div
                key={v.id}
                style={{
                  padding: 14,
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        backgroundColor: 'var(--accent-red-subtle)',
                        border: '1px solid var(--accent-red-border)',
                        color: 'var(--accent-red)',
                        fontWeight: 800,
                        fontSize: 12,
                        padding: '2px 8px',
                        borderRadius: 4,
                      }}
                    >
                      v{v.version} (Rev #{v.revision})
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Released on {new Date(v.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {v.active && <span className="badge badge-success">Production Active</span>}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{v.changeLog}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: JOBS */}
      {activeTab === 'jobs' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Cpu size={16} color="var(--accent-red)" /> Print Farm Execution History
            </div>
          </div>
          {product.printJobs?.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No print jobs logged for this product.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {product.printJobs.map((j: any) => (
                <div
                  key={j.id}
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
                    <div style={{ fontWeight: 600 }}>{j.jobCode}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      Machine: {j.printer?.name} &bull; Time: {j.actualTimeHours || j.estimatedTimeHours}h &bull;{' '}
                      Filament: {j.actualFilamentG || j.estimatedFilamentG}g
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusBadge status={j.status} />
                    <StatusBadge status={j.qcStatus} label={`QC: ${j.qcStatus}`} />
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
          {product.inspections?.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No quality defects or inspection failures on record.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {product.inspections.map((qc: any) => (
                <div
                  key={qc.id}
                  style={{
                    padding: '12px 14px',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>{qc.qcCode} &bull; {qc.specification}</span>
                    <StatusBadge status={qc.result} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ORDERS */}
      {activeTab === 'orders' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <ShoppingBag size={16} color="var(--accent-red)" /> Associated Orders
            </div>
          </div>
          {product.orderItems?.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No customer orders placed for this part yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {product.orderItems.map((oi: any) => (
                <div
                  key={oi.id}
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
                    <div style={{ fontWeight: 600 }}>{oi.order?.orderNumber}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      Quantity: {oi.quantity} &bull; Total: {formatCurrency(oi.lineTotal)}
                    </div>
                  </div>
                  <Link href={`/orders/${oi.order?.id}`} className="btn btn-secondary btn-sm" style={{ fontSize: 11 }}>
                    View Order →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RELEASE REVISION MODAL (Section 12) */}
      <Modal
        isOpen={isNewVersionModalOpen}
        onClose={() => setIsNewVersionModalOpen(false)}
        title={`Release New Revision for ${product.name}`}
      >
        <form onSubmit={handleReleaseVersion}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
            Per Section 12 requirements, product versions are tracked chronologically. Never overwrite existing revisions without creating a new version history entry.
          </p>

          <div className="form-group">
            <label className="form-label">New Version Tag *</label>
            <input
              type="text"
              required
              className="form-control"
              value={versionForm.version}
              onChange={(e) => setVersionForm({ ...versionForm, version: e.target.value })}
              placeholder={`e.g. ${(parseFloat(product.currentVersion) + 0.1).toFixed(1)}`}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Changelog & Modifications *</label>
            <textarea
              required
              className="form-control"
              rows={3}
              value={versionForm.changeLog}
              onChange={(e) => setVersionForm({ ...versionForm, changeLog: e.target.value })}
              placeholder="Wall thickness increased from 3 to 4 loops, mounting hole enlarged to 5.2mm..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Updated STL / 3MF File URL</label>
            <input
              type="text"
              className="form-control"
              value={versionForm.stlFileUrl}
              onChange={(e) => setVersionForm({ ...versionForm, stlFileUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsNewVersionModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={releasing}>
              {releasing ? 'Releasing...' : 'Publish Revision →'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Product & Specs"
      >
        <form onSubmit={handleUpdateProduct} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Product Name *</label>
              <input
                type="text"
                className="input"
                required
                value={editFormData.name || ''}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                style={{ width: '100%', marginTop: 4 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>SKU *</label>
              <input
                type="text"
                className="input"
                required
                value={editFormData.sku || ''}
                onChange={(e) => setEditFormData({ ...editFormData, sku: e.target.value })}
                style={{ width: '100%', marginTop: 4, fontFamily: 'monospace' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Category</label>
              <input
                type="text"
                className="input"
                value={editFormData.category || ''}
                onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                style={{ width: '100%', marginTop: 4 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Material</label>
              <input
                type="text"
                className="input"
                value={editFormData.materialName || ''}
                onChange={(e) => setEditFormData({ ...editFormData, materialName: e.target.value })}
                style={{ width: '100%', marginTop: 4 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Status</label>
              <select
                className="input"
                value={editFormData.status || 'ACTIVE'}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                style={{ width: '100%', marginTop: 4 }}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="DEVELOPMENT">DEVELOPMENT</option>
                <option value="DISCONTINUED">DISCONTINUED</option>
                <option value="PROTOTYPE">PROTOTYPE</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Production Cost (₹)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={editFormData.productionCost || ''}
                onChange={(e) => setEditFormData({ ...editFormData, productionCost: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%', marginTop: 4 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Selling Price (₹)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={editFormData.sellingPrice || ''}
                onChange={(e) => setEditFormData({ ...editFormData, sellingPrice: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%', marginTop: 4 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Print Time (h)</label>
              <input
                type="number"
                step="0.1"
                className="input"
                value={editFormData.standardPrintTimeHours || ''}
                onChange={(e) => setEditFormData({ ...editFormData, standardPrintTimeHours: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%', marginTop: 4 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Weight (g)</label>
              <input
                type="number"
                step="1"
                className="input"
                value={editFormData.standardFilamentGrams || ''}
                onChange={(e) => setEditFormData({ ...editFormData, standardFilamentGrams: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%', marginTop: 4 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Nozzle (mm)</label>
              <input
                type="number"
                step="0.1"
                className="input"
                value={editFormData.nozzleSize || ''}
                onChange={(e) => setEditFormData({ ...editFormData, nozzleSize: parseFloat(e.target.value) || 0.4 })}
                style={{ width: '100%', marginTop: 4 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Layer (mm)</label>
              <input
                type="number"
                step="0.02"
                className="input"
                value={editFormData.layerHeight || ''}
                onChange={(e) => setEditFormData({ ...editFormData, layerHeight: parseFloat(e.target.value) || 0.2 })}
                style={{ width: '100%', marginTop: 4 }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Description / Specs Notes</label>
            <textarea
              className="input"
              rows={3}
              value={editFormData.description || ''}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              style={{ width: '100%', marginTop: 4, resize: 'vertical' }}
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
              Save Specs
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
