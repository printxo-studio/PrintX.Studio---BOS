'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Plus,
  ArrowRight,
  Clock,
  Disc,
  DollarSign,
  TrendingUp,
  FileCode,
  Tag,
  Edit2,
  Trash2,
} from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KPICard } from '@/components/ui/KPICard';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/calculations';

export default function ProductsCataloguePage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [publishingSku, setPublishingSku] = useState<string | null>(null);
  const [publishedSkus, setPublishedSkus] = useState<Set<string>>(new Set());

  // Fetch already published products from Website storefront
  useEffect(() => {
    const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';
    fetch(`${websiteUrl}/api/sync/product`)
      .then((r) => r.json())
      .then((data) => {
        if (data.products && Array.isArray(data.products)) {
          setPublishedSkus(new Set(data.products.map((p: any) => p.sku)));
        }
      })
      .catch(() => {});
  }, []);

  const handlePublishToWebsite = async (product: any) => {
    setPublishingSku(product.sku);
    try {
      const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';
      const res = await fetch(`${websiteUrl}/api/sync/product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          name: product.name,
          sku: product.sku,
          description: product.description || `Industrial precision 3D manufactured component in ${product.materialName || 'PLA+'}. Dimensionally verified.`,
          price: product.sellingPrice || 999,
          costPrice: product.productionCost || 250,
          category: product.category || 'Engineering Parts',
          material: product.materialName || 'PLA+',
          standardPrintTimeHours: product.standardPrintTimeHours,
          isFeatured: true,
        }),
      });

      if (res.ok) {
        setPublishedSkus((prev) => new Set([...Array.from(prev), product.sku]));
        alert(`✓ "${product.name}" (${product.sku}) published live to PrintX Studio storefront!`);
      } else {
        alert('Failed to publish product to storefront.');
      }
    } catch (e: any) {
      alert('Error connecting to storefront: ' + e.message);
    } finally {
      setPublishingSku(null);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const totalProducts = products.length;
  const avgMargin =
    totalProducts > 0
      ? Math.round(products.reduce((sum, p) => sum + (p.estimatedMargin || 0), 0) / totalProducts)
      : 0;

  const filteredProducts =
    categoryFilter === 'ALL'
      ? products
      : products.filter((p) => p.category?.toLowerCase().includes(categoryFilter.toLowerCase()));

  const handleOpenEditProduct = (product: any) => {
    setEditFormData({
      id: product.id,
      name: product.name || '',
      sku: product.sku || '',
      category: product.category || '',
      materialName: product.materialName || '',
      status: product.status || 'ACTIVE',
      sellingPrice: product.sellingPrice || 0,
      productionCost: product.productionCost || 0,
      standardPrintTimeHours: product.standardPrintTimeHours || 0,
      standardFilamentGrams: product.standardFilamentGrams || 0,
      description: product.description || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/products/${editFormData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchProducts();
      } else {
        alert('Failed to update product');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating product');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete product "${name}"? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
      } else {
        alert('Failed to delete product. It may have associated order items or print jobs.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting product');
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'sku',
      header: 'SKU',
      render: (item) => (
        <Link
          href={`/products/${item.id}`}
          style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent-red)', textDecoration: 'none' }}
        >
          {item.sku}
        </Link>
      ),
      sortable: true,
      width: '140px',
    },
    {
      key: 'name',
      header: 'Product Name / Category',
      render: (item) => (
        <div>
          <Link
            href={`/products/${item.id}`}
            style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}
          >
            {item.name}
          </Link>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.category || 'Standard Part'}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'currentVersion',
      header: 'Revision',
      render: (item) => (
        <span
          style={{
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 11,
            fontWeight: 700,
            fontFamily: 'monospace',
          }}
        >
          v{item.currentVersion}
        </span>
      ),
      width: '90px',
    },
    {
      key: 'materialName',
      header: 'Material & Slicer',
      render: (item) => (
        <div>
          <span className="badge badge-neutral" style={{ fontSize: 10.5 }}>
            {item.materialName || 'PLA'}
          </span>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            {item.standardPrintTimeHours}h &bull; {item.standardFilamentGrams}g
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'productionCost',
      header: 'Cost / Price',
      render: (item) => (
        <div style={{ fontSize: 12 }}>
          <div style={{ color: 'var(--text-muted)' }}>Cost: {formatCurrency(item.productionCost)}</div>
          <div style={{ fontWeight: 700, fontFamily: 'monospace' }}>
            Sell: {formatCurrency(item.sellingPrice)}
          </div>
        </div>
      ),
      sortable: true,
      width: '120px',
    },
    {
      key: 'estimatedMargin',
      header: 'Margin %',
      render: (item) => (
        <span
          style={{
            fontWeight: 700,
            color: item.estimatedMargin >= 50 ? 'var(--status-success)' : 'var(--text-primary)',
          }}
        >
          {item.estimatedMargin}%
        </span>
      ),
      sortable: true,
      width: '90px',
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
      sortable: true,
      width: '100px',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Link
            href={`/products/${item.id}`}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: 11, padding: '4px 8px' }}
            title="Specs & CAD"
          >
            Specs <ArrowRight size={11} />
          </Link>
          <button
            onClick={() => handleOpenEditProduct(item)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 6px', color: 'var(--text-secondary)' }}
            title="Edit Product"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => handleDeleteProduct(item.id, item.name)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 6px', color: 'var(--accent-red)' }}
            title="Delete Product"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
      width: '180px',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Box size={22} color="var(--accent-red)" /> Product & CAD Master
          </h1>
          <p className="page-subtitle">
            Engineering SKU Registry &bull; Manufacturing Presets &bull; Revision History &bull; CAD Assets
          </p>
        </div>

        <Link href="/products/new" className="btn btn-primary btn-sm">
          <Plus size={15} /> Create New Product
        </Link>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <KPICard
          label="Total Active SKUs"
          value={totalProducts}
          subtext="Standard & custom product lines"
          icon={Box}
        />
        <KPICard
          label="Average Product Margin"
          value={`${avgMargin}%`}
          subtext="Gross margin across catalog"
          icon={TrendingUp}
          accentColor="var(--status-success)"
        />
        <KPICard
          label="Functional Engineering Parts"
          value={products.filter((p) => p.category?.toLowerCase().includes('functional')).length}
          subtext="PA-CF, PETG & high-temp parts"
          icon={FileCode}
          accentColor="var(--status-purple)"
        />
        <KPICard
          label="Standard Print Time"
          value={`${(
            products.reduce((sum, p) => sum + (p.standardPrintTimeHours || 0), 0) / (totalProducts || 1)
          ).toFixed(1)}h avg`}
          subtext="Per standard manufactured unit"
          icon={Clock}
        />
      </div>

      {/* Filter Tabs */}
      <div className="tabs-container">
        {['ALL', 'Functional', 'Robotics', 'Aesthetic', 'Prototype', 'Custom'].map((cat) => (
          <button
            key={cat}
            className={`tab-btn ${categoryFilter === cat ? 'active' : ''}`}
            onClick={() => setCategoryFilter(cat)}
          >
            {cat === 'ALL' ? 'All Products' : cat}
          </button>
        ))}
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        searchPlaceholder="Search products by SKU, name, category, material..."
        searchKeys={['sku', 'name', 'category', 'materialName']}
        pageSize={10}
      />

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
                placeholder="e.g. Functional, Robotics"
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
                placeholder="e.g. PAHT-CF, PETG"
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Print Time (Hours)</label>
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
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Filament Weight (Grams)</label>
              <input
                type="number"
                step="1"
                className="input"
                value={editFormData.standardFilamentGrams || ''}
                onChange={(e) => setEditFormData({ ...editFormData, standardFilamentGrams: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%', marginTop: 4 }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Description / Notes</label>
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
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
