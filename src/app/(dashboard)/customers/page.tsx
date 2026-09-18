'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserCheck,
  Plus,
  Building,
  Phone,
  Mail,
  MapPin,
  FileText,
  ShoppingBag,
  ExternalLink,
  Star,
} from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/calculations';

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('ALL');

  // New Customer Form State
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    customerType: 'B2B',
    phone: '',
    email: '',
    gstin: '',
    address: '',
    city: 'Bangalore',
    state: 'Karnataka',
    notes: '',
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/crm/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/crm/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsNewModalOpen(false);
        setFormData({
          name: '',
          company: '',
          customerType: 'B2B',
          phone: '',
          email: '',
          gstin: '',
          address: '',
          city: 'Bangalore',
          state: 'Karnataka',
          notes: '',
        });
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCustomers =
    typeFilter === 'ALL'
      ? customers
      : customers.filter((c) => c.customerType === typeFilter);

  const columns: Column<any>[] = [
    {
      key: 'customerCode',
      header: 'Code',
      render: (item) => (
        <Link
          href={`/customers/${item.id}`}
          style={{
            fontWeight: 700,
            color: 'var(--accent-red)',
            textDecoration: 'none',
          }}
        >
          {item.customerCode}
        </Link>
      ),
      sortable: true,
      width: '110px',
    },
    {
      key: 'name',
      header: 'Customer / Business',
      render: (item) => (
        <div>
          <Link
            href={`/customers/${item.id}`}
            style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}
          >
            {item.name}
          </Link>
          {item.company && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.company}</div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'customerType',
      header: 'Type',
      render: (item) => <StatusBadge status={item.customerType} />,
      sortable: true,
      width: '100px',
    },
    {
      key: 'contact',
      header: 'Contact Info',
      render: (item) => (
        <div style={{ fontSize: 11.5 }}>
          {item.phone && <div>{item.phone}</div>}
          {item.email && <div style={{ color: 'var(--text-muted)' }}>{item.email}</div>}
        </div>
      ),
    },
    {
      key: 'city',
      header: 'Location',
      render: (item) => (
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {item.city || '—'}, {item.state || 'India'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'gstin',
      header: 'GSTIN',
      render: (item) => (
        <span style={{ fontFamily: 'monospace', fontSize: 11.5 }}>
          {item.gstin || '—'}
        </span>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Star size={12} color="#f59e0b" fill="#f59e0b" />
          <span style={{ fontWeight: 600, fontSize: 12 }}>{item.rating || 5.0}</span>
        </div>
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
          href={`/customers/${item.id}`}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: 11, padding: '3px 8px' }}
        >
          View 360° <ExternalLink size={11} />
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
            <UserCheck size={22} color="var(--accent-red)" /> Customer Master Directory
          </h1>
          <p className="page-subtitle">
            B2B Client Registry &bull; Commercial History &bull; GSTIN Compliance &bull; Lifetime Value
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="btn btn-primary btn-sm"
        >
          <Plus size={15} /> Add New Customer
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="tabs-container">
        {['ALL', 'B2B', 'B2C', 'INSTITUTIONAL', 'MAKER'].map((type) => (
          <button
            key={type}
            className={`tab-btn ${typeFilter === type ? 'active' : ''}`}
            onClick={() => setTypeFilter(type)}
          >
            {type === 'ALL' ? 'All Customers' : type}
          </button>
        ))}
      </div>

      {/* Customers Data Table */}
      <DataTable
        columns={columns}
        data={filteredCustomers}
        searchPlaceholder="Search customers by name, company, code, GSTIN, phone, city..."
        searchKeys={['name', 'company', 'customerCode', 'gstin', 'phone', 'email', 'city']}
        pageSize={10}
      />

      {/* NEW CUSTOMER MODAL */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Create Customer Master Record"
      >
        <form onSubmit={handleCreateCustomer}>
          <div className="form-group">
            <label className="form-label">Customer / Primary Contact *</label>
            <input
              type="text"
              required
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Rahul Mehta"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Studio K Architecture"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Customer Type</label>
              <select
                className="form-control"
                value={formData.customerType}
                onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
              >
                <option value="B2B">B2B (Corporate / Industrial)</option>
                <option value="B2C">B2C (Direct Consumer)</option>
                <option value="INSTITUTIONAL">Institutional / Research</option>
                <option value="MAKER">Maker / Hobbyist</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="text"
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="client@domain.com"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">GSTIN (for Tax Invoices)</label>
              <input
                type="text"
                className="form-control"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                placeholder="29ABCDE1234F1Z5"
              />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-control"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Bangalore"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Billing & Shipping Address</label>
            <textarea
              className="form-control"
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street, Industrial Area, Pincode..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Internal Engineering / Client Notes</label>
            <textarea
              className="form-control"
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Material preferences, QA tolerances, payment terms..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsNewModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Customer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
