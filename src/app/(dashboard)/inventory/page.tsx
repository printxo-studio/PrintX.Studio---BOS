'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Package,
  PlusCircle,
  MinusCircle,
  Edit2,
  Trash2,
  ExternalLink,
  Boxes,
  Truck,
  TrendingDown,
  Warehouse,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KPICard } from '@/components/ui/KPICard';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/calculations';

const CATEGORIES = [
  { id: 'ALL', name: 'All Categories' },
  { id: 'NOZZLES', name: 'Nozzles & Hotends' },
  { id: 'BUILD_PLATES', name: 'Build Plates & Surfaces' },
  { id: 'CONSUMABLES', name: 'Consumables & Adhesives' },
  { id: 'PACKAGING', name: 'Packaging & Shipping Materials' },
  { id: 'SPARE_PARTS', name: 'Belts, Rods & Spare Parts' },
  { id: 'TOOLS', name: 'Workshop Tools & Maintenance' },
  { id: 'CHEMICALS', name: 'Solvents & IPA Cleaning' },
];

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isManageSuppliersOpen, setIsManageSuppliersOpen] = useState(false);
  const [isEditSupplierOpen, setIsEditSupplierOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Forms
  const [newItemForm, setNewItemForm] = useState({
    itemName: '',
    category: 'CONSUMABLES',
    quantity: '10',
    unit: 'PCS',
    unitCost: '150',
    reorderLevel: '5',
    storageLocation: 'Shelf A - Box 2',
    supplierId: '',
    notes: '',
  });

  const [editItemForm, setEditItemForm] = useState({
    id: '',
    itemName: '',
    category: 'CONSUMABLES',
    quantity: '0',
    unit: 'PCS',
    unitCost: '0',
    reorderLevel: '5',
    storageLocation: '',
    supplierId: '',
    notes: '',
  });

  const [newSupplierForm, setNewSupplierForm] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    category: 'Consumables',
    leadTimeDays: '3',
    paymentTerms: 'Net 30',
  });

  const [editSupplierForm, setEditSupplierForm] = useState({
    id: '',
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    category: 'Consumables',
    leadTimeDays: '3',
    paymentTerms: 'Net 30',
  });

  const [adjustDelta, setAdjustDelta] = useState('1');
  const [adjustMode, setAdjustMode] = useState<'ADD' | 'CONSUME'>('ADD');

  const loadData = async () => {
    setLoading(true);
    try {
      const [invRes, supRes] = await Promise.all([
        fetch(`/api/inventory?category=${categoryFilter}&status=${statusFilter}`),
        fetch('/api/suppliers'),
      ]);

      if (invRes.ok) {
        const data = await invRes.json();
        setItems(data.items || []);
        setSummary(data.summary || { totalItems: 0, totalValue: 0, lowStockCount: 0, outOfStockCount: 0 });
      }

      if (supRes.ok) {
        const supData = await supRes.json();
        setSuppliers(supData);
        if (supData.length > 0 && !newItemForm.supplierId) {
          setNewItemForm((prev) => ({ ...prev, supplierId: supData[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter, statusFilter]);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItemForm),
      });
      if (res.ok) {
        setIsAddItemOpen(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSupplierForm),
      });
      if (res.ok) {
        setIsAddSupplierOpen(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickAdjust = async (itemId: string, delta: number) => {
    try {
      const res = await fetch(`/api/inventory/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ADJUST', delta }),
      });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleModalAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    const delta = adjustMode === 'ADD' ? Math.abs(parseFloat(adjustDelta)) : -Math.abs(parseFloat(adjustDelta));
    try {
      const res = await fetch(`/api/inventory/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ADJUST', delta }),
      });
      if (res.ok) {
        setIsAdjustModalOpen(false);
        setSelectedItem(null);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to remove this item from inventory?')) return;
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete item');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting item');
    }
  };

  const handleOpenEditItem = (item: any) => {
    setEditItemForm({
      id: item.id,
      itemName: item.itemName || '',
      category: item.category || 'CONSUMABLES',
      quantity: String(item.quantity ?? 0),
      unit: item.unit || 'PCS',
      unitCost: String(item.unitCost ?? 0),
      reorderLevel: String(item.reorderLevel ?? 5),
      storageLocation: item.storageLocation || '',
      supplierId: item.supplierId || '',
      notes: item.notes || '',
    });
    setIsEditItemOpen(true);
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/inventory/${editItemForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editItemForm),
      });
      if (res.ok) {
        setIsEditItemOpen(false);
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update item');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating inventory item');
    }
  };

  const handleOpenEditSupplier = (supplier: any) => {
    setEditSupplierForm({
      id: supplier.id,
      name: supplier.name || '',
      contactPerson: supplier.contactPerson || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      category: supplier.category || 'Consumables',
      leadTimeDays: String(supplier.leadTimeDays ?? 3),
      paymentTerms: supplier.paymentTerms || 'Net 30',
    });
    setIsEditSupplierOpen(true);
  };

  const handleUpdateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/suppliers/${editSupplierForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editSupplierForm),
      });
      if (res.ok) {
        setIsEditSupplierOpen(false);
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update supplier');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating supplier');
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    try {
      const res = await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete supplier');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting supplier');
    }
  };

  // Filtered by Search
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.storageLocation && item.storageLocation.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.supplier && item.supplier.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const criticalItems = items.filter((i) => i.status === 'CRITICAL' || i.status === 'OUT_OF_STOCK');

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
              Workshop & Supply Chain
            </span>
            <span style={{ color: 'var(--text-tertiary)' }}>•</span>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              Section 17: Multi-category Inventory
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
            Inventory & Consumables
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Manage nozzles, build plates, packaging, spare parts, and workshop consumables with automated reorder alerts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setIsManageSuppliersOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 16px',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Truck size={16} />
            Manage Suppliers ({suppliers.length})
          </button>

          <button
            onClick={() => setIsAddSupplierOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 16px',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={16} />
            Add Supplier
          </button>

          <button
            onClick={() => setIsAddItemOpen(true)}
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
            Add Inventory Item
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
          label="Catalogued SKUs"
          value={summary.totalItems}
          subtext="Workshop inventory lines"
          icon={Boxes}
        />
        <KPICard
          label="Total Inventory Value"
          value={formatCurrency(summary.totalValue)}
          subtext="Total capital tied in stock"
          icon={Warehouse}
        />
        <KPICard
          label="Low Stock Items"
          value={summary.lowStockCount}
          subtext="Approaching reorder threshold"
          icon={AlertTriangle}
        />
        <KPICard
          label="Out of Stock"
          value={summary.outOfStockCount}
          subtext="Zero units available"
          icon={AlertOctagon}
        />
      </div>

      {/* Critical Stock Alert Banner */}
      {criticalItems.length > 0 && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: 16,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <AlertOctagon size={20} color="var(--accent-red)" style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-red)' }}>
              Reorder Recommended: {criticalItems.length} items are critically low or out of stock!
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {criticalItems.map((item) => (
                <span
                  key={item.id}
                  style={{
                    fontSize: 12,
                    padding: '3px 8px',
                    borderRadius: 4,
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    color: 'var(--accent-red)',
                    fontWeight: 600,
                  }}
                >
                  {item.itemName}: {item.quantity} {item.unit} remaining (Reorder @ {item.reorderLevel})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

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
              placeholder="Search by SKU, item name, location, supplier..."
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
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
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
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

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
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="CRITICAL">Critical</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          Showing {filteredItems.length} items
        </div>
      </div>

      {/* Inventory Table */}
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
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>SKU</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Item Description</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Available Stock</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Unit Cost & Value</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Location</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    Loading inventory catalog...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    No items found. Click &quot;Add Inventory Item&quot; to register components.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isCritical = item.status === 'CRITICAL' || item.status === 'OUT_OF_STOCK';
                  const isLow = item.status === 'LOW_STOCK';

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        fontSize: 13,
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-canvas)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* SKU */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                          {item.sku}
                        </div>
                        {item.supplier && (
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                            {item.supplier.name}
                          </div>
                        )}
                      </td>

                      {/* Item Name */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {item.itemName}
                        </div>
                        {item.notes && (
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                            {item.notes}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 4,
                            backgroundColor: 'var(--bg-surface-elevated)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {item.category}
                        </span>
                      </td>

                      {/* Quantity & Quick Adjustment Buttons */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span
                            style={{
                              fontSize: 15,
                              fontWeight: 700,
                              color: isCritical
                                ? 'var(--accent-red)'
                                : isLow
                                ? 'var(--accent-yellow, #f59e0b)'
                                : 'var(--text-primary)',
                              minWidth: 40,
                            }}
                          >
                            {item.quantity} {item.unit}
                          </span>

                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              title="Consume 1 unit"
                              onClick={() => handleQuickAdjust(item.id, -1)}
                              disabled={item.quantity <= 0}
                              style={{
                                padding: '3px 6px',
                                backgroundColor: 'var(--bg-surface-elevated)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 4,
                                color: 'var(--text-secondary)',
                                cursor: item.quantity <= 0 ? 'not-allowed' : 'pointer',
                                opacity: item.quantity <= 0 ? 0.4 : 1,
                              }}
                            >
                              -1
                            </button>
                            <button
                              title="Restock 1 unit"
                              onClick={() => handleQuickAdjust(item.id, 1)}
                              style={{
                                padding: '3px 6px',
                                backgroundColor: 'var(--bg-surface-elevated)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 4,
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                              }}
                            >
                              +1
                            </button>
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                          Reorder trigger: {item.reorderLevel} {item.unit}
                        </div>
                      </td>

                      {/* Cost & Total Value */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {formatCurrency(item.totalValue)}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          @ {formatCurrency(item.unitCost)} / {item.unit}
                        </div>
                      </td>

                      {/* Location */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ color: 'var(--text-secondary)' }}>
                          {item.storageLocation || 'Workshop Floor'}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <StatusBadge
                          status={item.status}
                          variant={
                            item.status === 'IN_STOCK'
                              ? 'success'
                              : item.status === 'LOW_STOCK'
                              ? 'warning'
                              : 'danger'
                          }
                        />
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                          <button
                            title="Quick Stock Adjustment (+/-)"
                            onClick={() => {
                              setSelectedItem(item);
                              setAdjustDelta('5');
                              setIsAdjustModalOpen(true);
                            }}
                            style={{
                              padding: '5px 8px',
                              backgroundColor: 'var(--bg-surface-elevated)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 4,
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            <PlusCircle size={13} />
                            Qty
                          </button>

                          <button
                            title="Edit Inventory Item"
                            onClick={() => handleOpenEditItem(item)}
                            style={{
                              padding: '5px 8px',
                              backgroundColor: 'var(--bg-surface-elevated)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 4,
                              color: 'var(--text-primary)',
                              cursor: 'pointer',
                            }}
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            title="Remove from Catalog"
                            onClick={() => handleDeleteItem(item.id)}
                            style={{
                              padding: '5px 8px',
                              backgroundColor: 'var(--bg-surface-elevated)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 4,
                              color: 'var(--accent-red)',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD INVENTORY ITEM MODAL */}
      <Modal
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        title="Add Inventory Item to Catalog"
      >
        <form onSubmit={handleCreateItem} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Item Name / Description
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 0.4mm Hardened Steel Nozzle (Bambu X1C)"
              value={newItemForm.itemName}
              onChange={(e) => setNewItemForm({ ...newItemForm, itemName: e.target.value })}
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
                Category
              </label>
              <select
                value={newItemForm.category}
                onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              >
                <option value="NOZZLES">Nozzles & Hotends</option>
                <option value="BUILD_PLATES">Build Plates & Surfaces</option>
                <option value="CONSUMABLES">Consumables & Adhesives</option>
                <option value="PACKAGING">Packaging & Shipping</option>
                <option value="SPARE_PARTS">Spare Parts & Hardware</option>
                <option value="TOOLS">Tools & Calibration Gauges</option>
                <option value="CHEMICALS">Solvents & Lubricants</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Unit of Measure
              </label>
              <select
                value={newItemForm.unit}
                onChange={(e) => setNewItemForm({ ...newItemForm, unit: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              >
                <option value="PCS">Pieces (PCS)</option>
                <option value="BOXES">Boxes</option>
                <option value="ROLLS">Rolls</option>
                <option value="KG">Kilograms (KG)</option>
                <option value="LITRES">Litres</option>
                <option value="SETS">Sets</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Initial Stock
              </label>
              <input
                type="number"
                required
                value={newItemForm.quantity}
                onChange={(e) => setNewItemForm({ ...newItemForm, quantity: e.target.value })}
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
                Unit Cost (₹)
              </label>
              <input
                type="number"
                required
                value={newItemForm.unitCost}
                onChange={(e) => setNewItemForm({ ...newItemForm, unitCost: e.target.value })}
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
                Reorder Level
              </label>
              <input
                type="number"
                required
                value={newItemForm.reorderLevel}
                onChange={(e) => setNewItemForm({ ...newItemForm, reorderLevel: e.target.value })}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Storage Location
              </label>
              <input
                type="text"
                placeholder="e.g. Bench B - Drawer 3"
                value={newItemForm.storageLocation}
                onChange={(e) => setNewItemForm({ ...newItemForm, storageLocation: e.target.value })}
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
                Supplier
              </label>
              <select
                value={newItemForm.supplierId}
                onChange={(e) => setNewItemForm({ ...newItemForm, supplierId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              >
                <option value="">None / Walk-in Purchase</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Notes / Technical Specs
            </label>
            <textarea
              rows={2}
              value={newItemForm.notes}
              onChange={(e) => setNewItemForm({ ...newItemForm, notes: e.target.value })}
              placeholder="e.g. Genuine hardened steel, rated up to 300°C for abrasive filaments"
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
              onClick={() => setIsAddItemOpen(false)}
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
              Add Item to Inventory
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD SUPPLIER MODAL */}
      <Modal
        isOpen={isAddSupplierOpen}
        onClose={() => setIsAddSupplierOpen(false)}
        title="Add Vendor / Supplier"
      >
        <form onSubmit={handleCreateSupplier} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Supplier Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. MakerBazaar India / Bambu Store"
              value={newSupplierForm.name}
              onChange={(e) => setNewSupplierForm({ ...newSupplierForm, name: e.target.value })}
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
                Contact Person
              </label>
              <input
                type="text"
                value={newSupplierForm.contactPerson}
                onChange={(e) => setNewSupplierForm({ ...newSupplierForm, contactPerson: e.target.value })}
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
                Phone / WhatsApp
              </label>
              <input
                type="text"
                value={newSupplierForm.phone}
                onChange={(e) => setNewSupplierForm({ ...newSupplierForm, phone: e.target.value })}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Email
              </label>
              <input
                type="email"
                value={newSupplierForm.email}
                onChange={(e) => setNewSupplierForm({ ...newSupplierForm, email: e.target.value })}
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
                Lead Time (Days)
              </label>
              <input
                type="number"
                value={newSupplierForm.leadTimeDays}
                onChange={(e) => setNewSupplierForm({ ...newSupplierForm, leadTimeDays: e.target.value })}
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => setIsAddSupplierOpen(false)}
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
              Save Supplier
            </button>
          </div>
        </form>
      </Modal>

      {/* ADJUST STOCK MODAL */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title={`Stock Adjustment: ${selectedItem?.itemName}`}
      >
        <form onSubmit={handleModalAdjust} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => setAdjustMode('ADD')}
              style={{
                flex: 1,
                padding: '10px 14px',
                backgroundColor: adjustMode === 'ADD' ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-canvas)',
                border: `1px solid ${adjustMode === 'ADD' ? 'var(--accent-green, #10b981)' : 'var(--border-subtle)'}`,
                color: adjustMode === 'ADD' ? 'var(--accent-green, #10b981)' : 'var(--text-secondary)',
                borderRadius: 4,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              + Restock / Receive Delivery
            </button>

            <button
              type="button"
              onClick={() => setAdjustMode('CONSUME')}
              style={{
                flex: 1,
                padding: '10px 14px',
                backgroundColor: adjustMode === 'CONSUME' ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-canvas)',
                border: `1px solid ${adjustMode === 'CONSUME' ? 'var(--accent-red)' : 'var(--border-subtle)'}`,
                color: adjustMode === 'CONSUME' ? 'var(--accent-red)' : 'var(--text-secondary)',
                borderRadius: 4,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              - Consume / Workshop Use
            </button>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Quantity ({selectedItem?.unit || 'Units'})
            </label>
            <input
              type="number"
              step="1"
              required
              value={adjustDelta}
              onChange={(e) => setAdjustDelta(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                color: 'var(--text-primary)',
                fontSize: 16,
                fontWeight: 700,
              }}
            />
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
            Current on-hand: <strong>{selectedItem?.quantity} {selectedItem?.unit}</strong> → New level:{' '}
            <strong>
              {Math.max(
                0,
                (selectedItem?.quantity || 0) +
                  (adjustMode === 'ADD' ? Math.abs(parseFloat(adjustDelta) || 0) : -Math.abs(parseFloat(adjustDelta) || 0))
              )}{' '}
              {selectedItem?.unit}
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
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
              Confirm Adjustment
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT INVENTORY ITEM MODAL */}
      <Modal
        isOpen={isEditItemOpen}
        onClose={() => setIsEditItemOpen(false)}
        title="Edit Inventory Item"
      >
        <form onSubmit={handleUpdateItem} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Item Name / Description
            </label>
            <input
              type="text"
              required
              value={editItemForm.itemName}
              onChange={(e) => setEditItemForm({ ...editItemForm, itemName: e.target.value })}
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
                Category
              </label>
              <select
                value={editItemForm.category}
                onChange={(e) => setEditItemForm({ ...editItemForm, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              >
                <option value="NOZZLES">Nozzles & Hotends</option>
                <option value="BUILD_PLATES">Build Plates & Surfaces</option>
                <option value="CONSUMABLES">Consumables & Adhesives</option>
                <option value="PACKAGING">Packaging & Shipping</option>
                <option value="SPARE_PARTS">Spare Parts & Hardware</option>
                <option value="TOOLS">Tools & Calibration Gauges</option>
                <option value="CHEMICALS">Solvents & Lubricants</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Unit of Measure
              </label>
              <select
                value={editItemForm.unit}
                onChange={(e) => setEditItemForm({ ...editItemForm, unit: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              >
                <option value="PCS">Pieces (PCS)</option>
                <option value="BOXES">Boxes</option>
                <option value="ROLLS">Rolls</option>
                <option value="KG">Kilograms (KG)</option>
                <option value="LITRES">Litres</option>
                <option value="SETS">Sets</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Quantity On-Hand
              </label>
              <input
                type="number"
                step="any"
                required
                value={editItemForm.quantity}
                onChange={(e) => setEditItemForm({ ...editItemForm, quantity: e.target.value })}
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
                Unit Cost (₹)
              </label>
              <input
                type="number"
                step="any"
                required
                value={editItemForm.unitCost}
                onChange={(e) => setEditItemForm({ ...editItemForm, unitCost: e.target.value })}
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
                Reorder Level
              </label>
              <input
                type="number"
                step="any"
                required
                value={editItemForm.reorderLevel}
                onChange={(e) => setEditItemForm({ ...editItemForm, reorderLevel: e.target.value })}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Storage Location
              </label>
              <input
                type="text"
                value={editItemForm.storageLocation}
                onChange={(e) => setEditItemForm({ ...editItemForm, storageLocation: e.target.value })}
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
                Supplier
              </label>
              <select
                value={editItemForm.supplierId}
                onChange={(e) => setEditItemForm({ ...editItemForm, supplierId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              >
                <option value="">None / Direct Vendor</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Notes / Technical Specs
            </label>
            <textarea
              rows={2}
              value={editItemForm.notes}
              onChange={(e) => setEditItemForm({ ...editItemForm, notes: e.target.value })}
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <button
              type="button"
              onClick={() => {
                setIsEditItemOpen(false);
                handleDeleteItem(editItemForm.id);
              }}
              style={{
                padding: '8px 14px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 4,
                color: 'var(--accent-red)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <Trash2 size={14} />
              Delete Item
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setIsEditItemOpen(false)}
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
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* MANAGE SUPPLIERS MODAL */}
      <Modal
        isOpen={isManageSuppliersOpen}
        onClose={() => setIsManageSuppliersOpen(false)}
        title="Suppliers Directory"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {suppliers.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
              No suppliers registered. Use &quot;Add Supplier&quot; to add vendors.
            </div>
          ) : (
            suppliers.map((s) => (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {s.contactPerson && `${s.contactPerson} • `}
                    {s.phone && `${s.phone} • `}
                    {s.email && `${s.email} • `}
                    Lead time: {s.leadTimeDays || 3}d
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    title="Edit Supplier"
                    onClick={() => handleOpenEditSupplier(s)}
                    style={{
                      padding: '5px 8px',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 4,
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    title="Delete Supplier"
                    onClick={() => handleDeleteSupplier(s.id)}
                    style={{
                      padding: '5px 8px',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 4,
                      color: 'var(--accent-red)',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button
              onClick={() => setIsManageSuppliersOpen(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                color: 'var(--text-primary)',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* EDIT SUPPLIER MODAL */}
      <Modal
        isOpen={isEditSupplierOpen}
        onClose={() => setIsEditSupplierOpen(false)}
        title="Edit Supplier Details"
      >
        <form onSubmit={handleUpdateSupplier} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Supplier Name
            </label>
            <input
              type="text"
              required
              value={editSupplierForm.name}
              onChange={(e) => setEditSupplierForm({ ...editSupplierForm, name: e.target.value })}
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
                Contact Person
              </label>
              <input
                type="text"
                value={editSupplierForm.contactPerson}
                onChange={(e) => setEditSupplierForm({ ...editSupplierForm, contactPerson: e.target.value })}
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
                Phone / WhatsApp
              </label>
              <input
                type="text"
                value={editSupplierForm.phone}
                onChange={(e) => setEditSupplierForm({ ...editSupplierForm, phone: e.target.value })}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Email
              </label>
              <input
                type="email"
                value={editSupplierForm.email}
                onChange={(e) => setEditSupplierForm({ ...editSupplierForm, email: e.target.value })}
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
                Lead Time (Days)
              </label>
              <input
                type="number"
                value={editSupplierForm.leadTimeDays}
                onChange={(e) => setEditSupplierForm({ ...editSupplierForm, leadTimeDays: e.target.value })}
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
              Payment Terms
            </label>
            <input
              type="text"
              value={editSupplierForm.paymentTerms}
              onChange={(e) => setEditSupplierForm({ ...editSupplierForm, paymentTerms: e.target.value })}
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => setIsEditSupplierOpen(false)}
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
              Save Supplier
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
