'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Store,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Tag,
  Layers,
  Ruler,
  Palette,
  DollarSign,
  Package,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  LayoutGrid,
  Table as TableIcon,
  X,
  Upload,
  Star,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/calculations';

interface Listing {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: string;
  productType: string;
  description: string;
  sellingPrice: number;
  compareAtPrice: number | null;
  productionCost: number;
  estimatedMargin: number;
  stockQuantity: number;
  isPublished: boolean;
  status: string;
  dimensions: string;
  materialName: string;
  colorOptions: string[];
  imageUrl: string;
  images: Array<{ url: string; altText?: string }>;
  rating?: number;
  avgRating?: number;
  reviewsCount?: number;
  reviewCount?: number;
  reviews?: Array<{
    id: string;
    rating: number;
    authorName?: string;
    reviewerName?: string;
    comment: string;
    createdAt: string;
    feedbackType?: string;
    isVerified?: boolean;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export default function ListingsManagementPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LIVE' | 'DRAFT' | 'LOW_STOCK'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [rndModalListing, setRndModalListing] = useState<Listing | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<any>({
    name: '',
    sku: '',
    slug: '',
    category: 'Functional & Engineering',
    sellingPrice: 999,
    compareAtPrice: '',
    productionCost: 250,
    stockQuantity: 50,
    isPublished: true,
    dimensions: '120 x 85 x 65 mm',
    materialName: 'PLA+',
    colorOptions: ['Matte Black', 'Studio Crimson', 'Signal White'],
    imageUrl: '',
    images: [] as Array<{ url: string; altText?: string }>,
    description: '',
  });

  const [newColorInput, setNewColorInput] = useState('');
  const [newImageUrlInput, setNewImageUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/listings');
      if (res.ok) {
        const data = await res.json();
        setListings(data.listings || []);
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // KPIs
  const totalCount = listings.length;
  const liveCount = listings.filter((l) => l.isPublished).length;
  const draftCount = listings.filter((l) => !l.isPublished).length;
  const lowStockCount = listings.filter((l) => l.stockQuantity <= 10).length;
  const totalCatalogValue = listings.reduce((sum, l) => sum + l.sellingPrice * l.stockQuantity, 0);

  // Filtered Listings
  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = l.name.toLowerCase().includes(q);
        const matchSku = l.sku.toLowerCase().includes(q);
        const matchSlug = l.slug?.toLowerCase().includes(q);
        const matchCat = l.category?.toLowerCase().includes(q);
        const matchMat = l.materialName?.toLowerCase().includes(q);
        if (!matchName && !matchSku && !matchSlug && !matchCat && !matchMat) return false;
      }

      // Status Filter
      if (statusFilter === 'LIVE' && !l.isPublished) return false;
      if (statusFilter === 'DRAFT' && l.isPublished) return false;
      if (statusFilter === 'LOW_STOCK' && l.stockQuantity > 10) return false;

      // Category Filter
      if (categoryFilter !== 'ALL' && l.category !== categoryFilter) return false;

      return true;
    });
  }, [listings, searchQuery, statusFilter, categoryFilter]);

  // Unique Categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    listings.forEach((l) => {
      if (l.category) set.add(l.category);
    });
    return Array.from(set);
  }, [listings]);

  // Toggle Live/Draft Status
  const handleTogglePublish = async (listing: Listing) => {
    const newStatus = !listing.isPublished;
    // Optimistic UI update
    setListings((prev) =>
      prev.map((l) => (l.id === listing.id ? { ...l, isPublished: newStatus } : l))
    );

    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: newStatus }),
      });

      if (!res.ok) {
        // Rollback
        setListings((prev) =>
          prev.map((l) => (l.id === listing.id ? { ...l, isPublished: !newStatus } : l))
        );
        showToast('❌ Failed to update publish status');
      } else {
        showToast(
          newStatus
            ? `✓ "${listing.name}" is now LIVE on customer storefront!`
            : `✓ "${listing.name}" is now saved as DRAFT (hidden from website)`
        );
      }
    } catch (e) {
      console.error(e);
      showToast('❌ Network error updating listing status');
    }
  };

  // Quick Stock Adjustment
  const handleAdjustStock = async (listing: Listing, delta: number) => {
    const newStock = Math.max(0, listing.stockQuantity + delta);
    setListings((prev) =>
      prev.map((l) => (l.id === listing.id ? { ...l, stockQuantity: newStock } : l))
    );

    try {
      await fetch(`/api/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQuantity: newStock }),
      });
    } catch (e) {
      console.error('Failed to adjust stock', e);
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData({
      name: '',
      sku: '',
      slug: '',
      category: 'Functional & Engineering',
      sellingPrice: 999,
      compareAtPrice: '',
      productionCost: 250,
      stockQuantity: 50,
      isPublished: true,
      dimensions: '120 x 85 x 65 mm',
      materialName: 'PLA+',
      colorOptions: ['Matte Black', 'Studio Crimson', 'Signal White'],
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
          altText: 'Primary Angle',
        },
      ],
      description: '',
    });
    setNewColorInput('');
    setNewImageUrlInput('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (listing: Listing) => {
    setModalMode('edit');
    setFormData({
      id: listing.id,
      name: listing.name || '',
      sku: listing.sku || '',
      slug: listing.slug || '',
      category: listing.category || 'Functional & Engineering',
      sellingPrice: listing.sellingPrice || 0,
      compareAtPrice: listing.compareAtPrice || '',
      productionCost: listing.productionCost || 0,
      stockQuantity: listing.stockQuantity ?? 50,
      isPublished: listing.isPublished !== false,
      dimensions: listing.dimensions || '',
      materialName: listing.materialName || 'PLA+',
      colorOptions: Array.isArray(listing.colorOptions) ? [...listing.colorOptions] : [],
      imageUrl: listing.imageUrl || '',
      images: Array.isArray(listing.images) ? [...listing.images] : [],
      description: listing.description || '',
    });
    setNewColorInput('');
    setNewImageUrlInput('');
    setIsModalOpen(true);
  };

  // Save Listing (Create or Update)
  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = modalMode === 'create' ? '/api/listings' : `/api/listings/${formData.id}`;
      const method = modalMode === 'create' ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchListings();
        showToast(
          modalMode === 'create'
            ? `✓ Listing "${formData.name}" created successfully!`
            : `✓ Listing "${formData.name}" updated successfully!`
        );
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save listing');
      }
    } catch (err: any) {
      console.error(err);
      alert('Error saving listing: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Listing
  const handleDeleteListing = async (listing: Listing) => {
    if (
      !confirm(
        `Are you sure you want to delete listing "${listing.name}" (${listing.sku})? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/listings/${listing.id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchListings();
        showToast(`✓ Listing "${listing.name}" deleted`);
      } else {
        alert('Failed to delete listing');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting listing');
    }
  };

  // Color helper in modal
  const handleAddColor = () => {
    if (!newColorInput.trim()) return;
    if (!formData.colorOptions.includes(newColorInput.trim())) {
      setFormData({
        ...formData,
        colorOptions: [...formData.colorOptions, newColorInput.trim()],
      });
    }
    setNewColorInput('');
  };

  const handleRemoveColor = (colorToRemove: string) => {
    setFormData({
      ...formData,
      colorOptions: formData.colorOptions.filter((c: string) => c !== colorToRemove),
    });
  };

  // Image helper in modal
  const handleAddGalleryImage = () => {
    if (!newImageUrlInput.trim()) return;
    setFormData({
      ...formData,
      images: [...formData.images, { url: newImageUrlInput.trim(), altText: formData.name }],
    });
    setNewImageUrlInput('');
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_: any, idx: number) => idx !== indexToRemove),
    });
  };

  const websiteBaseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            backgroundColor: '#18181b',
            color: '#ffffff',
            border: '1px solid #3f3f46',
            borderRadius: 12,
            padding: '12px 20px',
            fontSize: 13,
            fontWeight: 600,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <CheckCircle2 size={18} color="#22c55e" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Store size={24} color="var(--accent-red)" /> Store Listings & Catalog
          </h1>
          <p className="page-subtitle">
            Manage Customer Storefront Listings &bull; Images & Galleries &bull; Pricing & Discounts &bull; Specifications & Dimensions
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={fetchListings}
            className="btn btn-secondary btn-sm"
            title="Refresh from Database"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={handleOpenCreateModal} className="btn btn-primary btn-sm">
            <Plus size={16} /> Create New Listing
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
        }}
      >
        <KPICard
          label="Total Listings"
          value={totalCount}
          icon={Package}
          subtext="All storefront records"
        />
        <KPICard
          label="Live on Storefront"
          value={liveCount}
          icon={CheckCircle2}
          subtext="Currently active & sellable"
          accentColor="#22c55e"
        />
        <KPICard
          label="Draft (Hidden)"
          value={draftCount}
          icon={Layers}
          subtext="Unpublished drafts"
          accentColor="#eab308"
        />
        <KPICard
          label="Low Stock Alert"
          value={lowStockCount}
          icon={AlertTriangle}
          subtext="Under 10 units available"
          accentColor={lowStockCount > 0 ? '#ef4444' : undefined}
        />
        <KPICard
          label="Total Storefront Value"
          value={formatCurrency(totalCatalogValue)}
          icon={DollarSign}
          subtext="Live retail inventory"
        />
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Search listings by name, SKU, material, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: 34,
                paddingRight: 12,
                paddingTop: 7,
                paddingBottom: 7,
                width: '100%',
                fontSize: 13,
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                outline: 'none',
                height: 34,
              }}
            />
          </div>

          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: 4 }}>
            {(['ALL', 'LIVE', 'DRAFT', 'LOW_STOCK'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 12, padding: '5px 12px', height: 34 }}
              >
                {st === 'ALL'
                  ? 'All'
                  : st === 'LIVE'
                  ? 'Live'
                  : st === 'DRAFT'
                  ? 'Draft'
                  : 'Low Stock'}
              </button>
            ))}
          </div>

          {/* Category Dropdown - Dark Themed */}
          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                fontSize: 12.5,
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                outline: 'none',
                minWidth: 150,
                height: 34,
              }}
            >
              <option value="ALL" style={{ background: '#141416', color: '#fff' }}>All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c} style={{ background: '#141416', color: '#fff' }}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => setViewMode('grid')}
            className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 10px' }}
            title="Grid View"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 10px' }}
            title="Table View"
          >
            <TableIcon size={15} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <div>Loading store listings from database...</div>
        </div>
      ) : filteredListings.length === 0 ? (
        <div
          style={{
            padding: 48,
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
          }}
        >
          <Store size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            No Listings Found
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {searchQuery
              ? 'Try modifying your search or filter criteria.'
              : 'Create your first store listing to publish products to your website!'}
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="btn btn-primary btn-sm"
            style={{ marginTop: 16 }}
          >
            <Plus size={14} /> Create New Listing
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 16,
          }}
        >
          {filteredListings.map((listing) => (
            <div
              key={listing.id}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            >
              {/* Card Image Container */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16/10',
                  backgroundColor: '#09090b',
                  overflow: 'hidden',
                }}
              >
                {listing.imageUrl ? (
                  <img
                    src={listing.imageUrl}
                    alt=""
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                      const fb = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                      if (fb) fb.style.display = 'flex';
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : null}
                <div
                  style={{
                    display: listing.imageUrl ? 'none' : 'flex',
                    width: '100%',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-red)',
                    backgroundColor: '#141416',
                  }}
                >
                  <Package size={36} />
                </div>

                {/* Status Badge Over Image */}
                <div style={{ position: 'absolute', top: 10, left: 10 }}>
                  <button
                    onClick={() => handleTogglePublish(listing)}
                    style={{
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      backgroundColor: listing.isPublished ? 'rgba(34, 197, 94, 0.9)' : 'rgba(234, 179, 8, 0.9)',
                      color: '#000000',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    title="Click to toggle live storefront visibility"
                  >
                    {listing.isPublished ? <Eye size={12} /> : <EyeOff size={12} />}
                    {listing.isPublished ? 'STOREFRONT LIVE' : 'DRAFT (HIDDEN)'}
                  </button>
                </div>

                {/* Stock Badge Over Image */}
                <div style={{ position: 'absolute', top: 10, right: 10 }}>
                  <span
                    style={{
                      backgroundColor: listing.stockQuantity <= 10 ? 'rgba(239, 68, 68, 0.9)' : 'rgba(24, 24, 27, 0.85)',
                      color: '#ffffff',
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      backdropFilter: 'blur(4px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    Stock: {listing.stockQuantity}
                  </span>
                </div>

                {/* Multi-image indicator */}
                {listing.images && listing.images.length > 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontSize: 10,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <ImageIcon size={10} /> {listing.images.length} photos
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: 11,
                        color: 'var(--accent-red)',
                        fontWeight: 700,
                      }}
                    >
                      {listing.sku}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {listing.category}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginTop: 4,
                      lineHeight: 1.3,
                    }}
                  >
                    {listing.name}
                  </h3>
                </div>

                {listing.description && (
                  <p
                    style={{
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {listing.description}
                  </p>
                )}

                {/* Specs Pill Bar */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 11 }}>
                  <span
                    style={{
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-default)',
                      padding: '2px 6px',
                      borderRadius: 4,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {listing.materialName}
                  </span>
                  {listing.dimensions && (
                    <span
                      style={{
                        backgroundColor: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-default)',
                        padding: '2px 6px',
                        borderRadius: 4,
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {listing.dimensions}
                    </span>
                  )}
                </div>

                {/* Colors Bar */}
                {listing.colorOptions && listing.colorOptions.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Colors:</span>
                    {listing.colorOptions.slice(0, 3).map((col, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: 10,
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          padding: '1px 6px',
                          borderRadius: 10,
                          color: '#e4e4e7',
                        }}
                      >
                        {col}
                      </span>
                    ))}
                    {listing.colorOptions.length > 3 && (
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        +{listing.colorOptions.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Price & Margin */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    paddingTop: 8,
                    borderTop: '1px solid var(--border-default)',
                    marginTop: 'auto',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                        {formatCurrency(listing.sellingPrice)}
                      </span>
                      {listing.compareAtPrice && listing.compareAtPrice > listing.sellingPrice && (
                        <span
                          style={{
                            fontSize: 12,
                            color: 'var(--text-muted)',
                            textDecoration: 'line-through',
                          }}
                        >
                          {formatCurrency(listing.compareAtPrice)}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Cost: {formatCurrency(listing.productionCost)} &bull; {listing.estimatedMargin}% margin
                    </div>
                  </div>

                  {/* Inline Stock Counter */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button
                      onClick={() => handleAdjustStock(listing, -1)}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        border: '1px solid var(--border-default)',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        color: '#fff',
                        cursor: 'pointer',
                      }}
                      title="Decrement stock"
                    >
                      -
                    </button>
                    <span style={{ fontSize: 12, fontWeight: 700, minWidth: 28, textAlign: 'center' }}>
                      {listing.stockQuantity}
                    </span>
                    <button
                      onClick={() => handleAdjustStock(listing, 1)}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        border: '1px solid var(--border-default)',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        color: '#fff',
                        cursor: 'pointer',
                      }}
                      title="Increment stock"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  borderTop: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <a
                  href={`${websiteBaseUrl}/products/${listing.slug || listing.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 11, padding: '4px 8px' }}
                  title="View live product listing on storefront"
                >
                  Storefront <ExternalLink size={11} />
                </a>

                <div style={{ display: 'flex', gap: 6 }}>
                  {listing.reviewCount && listing.reviewCount > 0 ? (
                    <button
                      onClick={() => setRndModalListing(listing)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 8px', fontSize: 11, color: '#eab308' }}
                      title="Customer R&D Reviews"
                    >
                      <Star size={11} fill="#eab308" /> {listing.avgRating?.toFixed(1)} ({listing.reviewCount})
                    </button>
                  ) : null}
                  <button
                    onClick={() => handleOpenEditModal(listing)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 8px', fontSize: 11 }}
                    title="Edit listing details"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteListing(listing)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 8px', fontSize: 11, color: 'var(--accent-red)' }}
                    title="Delete listing"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            overflow: 'auto',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface-elevated)' }}>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Thumbnail</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>SKU & Name</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Dimensions / Specs</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Price</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Stock</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Storefront Status</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.map((listing) => (
                <tr
                  key={listing.id}
                  style={{ borderBottom: '1px solid var(--border-default)' }}
                >
                  <td style={{ padding: '10px 14px', width: 64 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 6,
                        overflow: 'hidden',
                        backgroundColor: '#141416',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      {listing.imageUrl ? (
                        <img
                          src={listing.imageUrl}
                          alt=""
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                            const fb = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                            if (fb) fb.style.display = 'flex';
                          }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : null}
                      <div
                        style={{
                          display: listing.imageUrl ? 'none' : 'flex',
                          width: '100%',
                          height: '100%',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <Package size={20} />
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{listing.name}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--accent-red)' }}>
                      {listing.sku} &bull; <span style={{ color: 'var(--text-muted)' }}>/{listing.slug}</span>
                    </div>
                    {listing.reviewCount && listing.reviewCount > 0 ? (
                      <button
                        onClick={() => setRndModalListing(listing)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          marginTop: 4,
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontSize: 11,
                          backgroundColor: 'rgba(234, 179, 8, 0.12)',
                          border: '1px solid rgba(234, 179, 8, 0.3)',
                          color: '#eab308',
                          cursor: 'pointer',
                        }}
                        title="View customer R&D feedback"
                      >
                        <Star size={10} fill="#eab308" />
                        <span>{listing.avgRating?.toFixed(1) || '5.0'} ({listing.reviewCount} R&D)</span>
                      </button>
                    ) : null}
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontSize: 12 }}>
                    {listing.category}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12 }}>
                    <div>{listing.dimensions}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{listing.materialName}</div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatCurrency(listing.sellingPrice)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {listing.estimatedMargin}% margin
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button
                        onClick={() => handleAdjustStock(listing, -1)}
                        style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid var(--border-default)', background: 'transparent', color: '#fff', cursor: 'pointer' }}
                      >
                        -
                      </button>
                      <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>
                        {listing.stockQuantity}
                      </span>
                      <button
                        onClick={() => handleAdjustStock(listing, 1)}
                        style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid var(--border-default)', background: 'transparent', color: '#fff', cursor: 'pointer' }}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <button
                      onClick={() => handleTogglePublish(listing)}
                      style={{
                        cursor: 'pointer',
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        backgroundColor: listing.isPublished ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                        color: listing.isPublished ? '#22c55e' : '#eab308',
                        border: listing.isPublished ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(234, 179, 8, 0.4)',
                      }}
                    >
                      {listing.isPublished ? '● LIVE' : '○ DRAFT'}
                    </button>
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                      {listing.reviewCount && listing.reviewCount > 0 ? (
                        <button
                          onClick={() => setRndModalListing(listing)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 6px', color: '#eab308' }}
                          title="R&D Feedback"
                        >
                          <MessageSquare size={12} />
                        </button>
                      ) : null}
                      <a
                        href={`${websiteBaseUrl}/products/${listing.slug || listing.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 6px' }}
                        title="Storefront link"
                      >
                        <ExternalLink size={12} />
                      </a>
                      <button
                        onClick={() => handleOpenEditModal(listing)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 6px' }}
                        title="Edit listing"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteListing(listing)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 6px', color: 'var(--accent-red)' }}
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT LISTING MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Create Storefront Listing' : `Edit Listing: ${formData.name}`}
        maxWidth="760px"
      >
        <form onSubmit={handleSaveListing} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* SECTION 1: PRIMARY DETAILS */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-red)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              1. Basic Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Listing Title *</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="e.g. Voron Aerodynamic Stealthburner Cowl"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                    setFormData({
                      ...formData,
                      name,
                      slug: modalMode === 'create' ? autoSlug : formData.slug,
                    });
                  }}
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>SKU Code</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. PRX-AERO-01"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  style={{ width: '100%', marginTop: 4, fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>URL Slug (Storefront Path)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. voron-aerodynamic-stealthburner"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  style={{ width: '100%', marginTop: 4, fontFamily: 'monospace' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Storefront Category</label>
                <select
                  className="input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', marginTop: 4 }}
                >
                  <option value="Functional & Engineering">Functional & Engineering</option>
                  <option value="Robotics & Automation">Robotics & Automation</option>
                  <option value="Aerospace & Drones">Aerospace & Drones</option>
                  <option value="Aesthetic & Architectural">Aesthetic & Architectural</option>
                  <option value="Studio Equipment">Studio Equipment</option>
                  <option value="Desk & Office">Desk & Office</option>
                  <option value="Home & Decor">Home & Decor</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: PRICING & INVENTORY */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-red)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              2. Pricing & Inventory
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Selling Price (₹) *</label>
                <input
                  type="number"
                  step="1"
                  required
                  className="input"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', marginTop: 4, fontWeight: 700 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Compare At Price (₹)</label>
                <input
                  type="number"
                  step="1"
                  className="input"
                  placeholder="Original price for discount"
                  value={formData.compareAtPrice || ''}
                  onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Production Cost (₹)</label>
                <input
                  type="number"
                  step="1"
                  className="input"
                  value={formData.productionCost}
                  onChange={(e) => setFormData({ ...formData, productionCost: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Stock Quantity</label>
                <input
                  type="number"
                  step="1"
                  className="input"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                  style={{ width: '100%', marginTop: 4, fontWeight: 700 }}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: MEDIA & IMAGES */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-red)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              3. Images & Media
            </h4>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Primary Hero Image URL *</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  style={{ flex: 1 }}
                />
                {formData.imageUrl && (
                  <div style={{ width: 40, height: 40, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border-default)' }}>
                    <img src={formData.imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            </div>

            {/* Additional Images */}
            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Additional Gallery Images</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Paste image URL to append to gallery..."
                  value={newImageUrlInput}
                  onChange={(e) => setNewImageUrlInput(e.target.value)}
                  style={{ flex: 1, fontSize: 12 }}
                />
                <button
                  type="button"
                  onClick={handleAddGalleryImage}
                  className="btn btn-secondary btn-sm"
                >
                  <Plus size={14} /> Add Image
                </button>
              </div>

              {formData.images && formData.images.length > 0 && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                  {formData.images.map((img: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        width: 64,
                        height: 64,
                        borderRadius: 8,
                        overflow: 'hidden',
                        border: '1px solid var(--border-default)',
                        backgroundColor: '#000',
                      }}
                    >
                      <img src={img.url} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        style={{
                          position: 'absolute',
                          top: 2,
                          right: 2,
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          backgroundColor: 'rgba(239, 68, 68, 0.9)',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                        }}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: SPECIFICATIONS & COLORS */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-red)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              4. Dimensions & Material Specifications
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Physical Dimensions (L x W x H mm)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. 140 x 95 x 65 mm"
                  value={formData.dimensions}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Material Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Carbon Fiber Nylon (PA-CF)"
                  value={formData.materialName}
                  onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>
            </div>

            {/* Colors */}
            <div style={{ marginTop: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Filament Colors Offered</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Stealth Grey"
                  value={newColorInput}
                  onChange={(e) => setNewColorInput(e.target.value)}
                  style={{ flex: 1, fontSize: 12 }}
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="btn btn-secondary btn-sm"
                >
                  <Plus size={14} /> Add Color
                </button>
              </div>

              {formData.colorOptions && formData.colorOptions.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                  {formData.colorOptions.map((c: string) => (
                    <span
                      key={c}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        backgroundColor: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-default)',
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 12,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {c}
                      <X
                        size={12}
                        onClick={() => handleRemoveColor(c)}
                        style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 5: DESCRIPTION */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-red)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              5. Marketing Description
            </h4>
            <textarea
              className="input"
              rows={4}
              placeholder="Detailed description of features, mechanical properties, applications, and tolerances..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ width: '100%', fontSize: 13 }}
            />
          </div>

          {/* SECTION 6: PUBLISHING STATUS TOGGLE */}
          <div
            style={{
              padding: 14,
              borderRadius: 8,
              backgroundColor: formData.isPublished ? 'rgba(34, 197, 94, 0.08)' : 'rgba(234, 179, 8, 0.08)',
              border: formData.isPublished ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(234, 179, 8, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: formData.isPublished ? '#22c55e' : '#eab308' }}>
                {formData.isPublished ? '● Live on Storefront' : '○ Draft (Hidden from Customers)'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                {formData.isPublished
                  ? 'This listing is visible for customer browsing, cart addition, and purchase.'
                  : 'This listing is private and will not appear in the customer website catalog.'}
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                style={{ width: 18, height: 18, accentColor: 'var(--accent-red)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                Publish Live
              </span>
            </label>
          </div>

          {/* Modal Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 12, borderTop: '1px solid var(--border-default)' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting
                ? 'Saving...'
                : modalMode === 'create'
                ? 'Create Storefront Listing'
                : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* R&D CUSTOMER FEEDBACK MODAL */}
      <Modal
        isOpen={!!rndModalListing}
        onClose={() => setRndModalListing(null)}
        title={`R&D Customer Feedback: ${rndModalListing?.name}`}
        maxWidth="680px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-surface-elevated)',
              padding: 14,
              borderRadius: 8,
              border: '1px solid var(--border-default)',
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Average Customer Rating</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={18}
                      fill={s <= Math.round(rndModalListing?.avgRating || 0) ? '#eab308' : 'none'}
                      color="#eab308"
                    />
                  ))}
                </div>
                <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
                  {rndModalListing?.avgRating ? rndModalListing.avgRating.toFixed(1) : '0.0'}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  ({rndModalListing?.reviewCount || 0} reviews)
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>SKU & Catalog Path</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-red)', marginTop: 4 }}>
                {rndModalListing?.sku}
              </div>
            </div>
          </div>

          <div style={{ maxHeight: 420, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(!rndModalListing?.reviews || rndModalListing.reviews.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                <MessageSquare size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                <div>No customer ratings or R&D feedback submitted yet for this product.</div>
                <div style={{ fontSize: 12, marginTop: 4, color: 'var(--text-secondary)' }}>
                  Customer reviews submitted via the storefront will appear here with verification status.
                </div>
              </div>
            ) : (
              rndModalListing.reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 8,
                    padding: 14,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={12}
                            fill={s <= rev.rating ? '#eab308' : 'none'}
                            color="#eab308"
                          />
                        ))}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                        {rev.authorName}
                      </span>
                      {rev.isVerified && (
                        <span
                          style={{
                            fontSize: 10,
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            color: '#22c55e',
                            padding: '1px 6px',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <ShieldCheck size={10} /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {rev.comment && (
                    <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {rev.comment}
                    </p>
                  )}

                  {rev.feedbackType && rev.feedbackType !== 'GENERAL' && (
                    <div style={{ marginTop: 8 }}>
                      <span
                        style={{
                          fontSize: 10,
                          padding: '2px 6px',
                          borderRadius: 4,
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: 'var(--accent-red)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          fontWeight: 600,
                        }}
                      >
                        R&D Tag: {rev.feedbackType}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border-default)' }}>
            <button
              onClick={() => setRndModalListing(null)}
              className="btn btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
