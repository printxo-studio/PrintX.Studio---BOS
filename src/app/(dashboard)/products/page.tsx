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
} from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KPICard } from '@/components/ui/KPICard';
import { formatCurrency } from '@/lib/calculations';

export default function ProductsCataloguePage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

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
      header: 'Action',
      render: (item) => (
        <Link
          href={`/products/${item.id}`}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: 11, padding: '3px 8px' }}
        >
          Specs & CAD <ArrowRight size={11} />
        </Link>
      ),
      width: '110px',
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
    </div>
  );
}
