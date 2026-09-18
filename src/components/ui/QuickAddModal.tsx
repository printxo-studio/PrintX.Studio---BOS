'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Users,
  UserCheck,
  FileText,
  ShoppingBag,
  Box,
  Cpu,
  Disc,
  ShieldCheck,
  AlertCircle,
  FlaskConical,
  Receipt,
  CreditCard,
  DollarSign,
  CheckSquare,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickAddModal({ isOpen, onClose }: QuickAddModalProps) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Form states for quick entity adds
  const [loading, setLoading] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', company: '', phone: '', email: '', requirement: '', budget: '' });
  const [customerForm, setCustomerForm] = useState({ name: '', company: '', phone: '', email: '', gstin: '', city: '' });
  const [expenseForm, setExpenseForm] = useState({ category: 'FILAMENT', amount: '', description: '', paymentMethod: 'UPI' });

  const QUICK_TYPES = [
    { id: 'lead', title: 'New CRM Lead', icon: Users, desc: 'Capture customer requirement & budget', color: '#3b82f6' },
    { id: 'customer', title: 'New Customer', icon: UserCheck, desc: 'Add B2B / client record with GSTIN', color: '#10b981' },
    { id: 'quote', title: 'New Quotation', icon: FileText, desc: 'Calculate pricing & build quote PDF', color: '#f59e0b', directLink: '/quotes/new' },
    { id: 'order', title: 'New Order', icon: ShoppingBag, desc: 'Book direct manufacturing order', color: '#8b5cf6', directLink: '/orders/new' },
    { id: 'printjob', title: 'New Print Job', icon: Cpu, desc: 'Queue slicer job to farm printer', color: '#e11d48', directLink: '/production/new-job' },
    { id: 'spool', title: 'Add Filament Spool', icon: Disc, desc: 'Record new spool batch & dry status', color: '#ec4899', directLink: '/filament' },
    { id: 'qc', title: 'Record QC Inspection', icon: ShieldCheck, desc: 'Dimension, finish & defect log', color: '#14b8a6', directLink: '/quality' },
    { id: 'complaint', title: 'Log Complaint / CAPA', icon: AlertCircle, desc: 'Customer issue & 5-Why root cause', color: '#ef4444', directLink: '/quality' },
    { id: 'rnd', title: 'New R&D Experiment', icon: FlaskConical, desc: 'Test new profiles or resin/filaments', color: '#a855f7', directLink: '/rnd' },
    { id: 'expense', title: 'Record Expense', icon: DollarSign, desc: 'Log material, power, or maintenance costs', color: '#eab308' },
    { id: 'task', title: 'New Task', icon: CheckSquare, desc: 'Assign farm task with due date', color: '#06b6d4', directLink: '/tasks' },
  ];

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadForm),
      });
      if (res.ok) {
        onClose();
        router.push('/crm');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/crm/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerForm),
      });
      if (res.ok) {
        onClose();
        router.push('/customers');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/finance/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseForm),
      });
      if (res.ok) {
        onClose();
        router.push('/finance');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setSelectedType(null);
        onClose();
      }}
      title={
        selectedType === 'lead'
          ? 'Quick Add: CRM Lead'
          : selectedType === 'customer'
          ? 'Quick Add: Customer Master'
          : selectedType === 'expense'
          ? 'Quick Add: Business Expense'
          : 'Quick Add / Action'
      }
      maxWidth={selectedType ? '520px' : '680px'}
    >
      {!selectedType ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {QUICK_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <div
                key={type.id}
                onClick={() => {
                  if (type.directLink) {
                    onClose();
                    router.push(type.directLink);
                  } else {
                    setSelectedType(type.id);
                  }
                }}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = type.color;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon size={18} color={type.color} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{type.title}</span>
                </div>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.4 }}>{type.desc}</span>
              </div>
            );
          })}
        </div>
      ) : selectedType === 'lead' ? (
        <form onSubmit={handleCreateLead}>
          <div className="form-group">
            <label className="form-label">Client Name *</label>
            <input
              type="text"
              required
              className="form-control"
              value={leadForm.name}
              onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
              placeholder="e.g. Ramesh K"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Company</label>
              <input
                type="text"
                className="form-control"
                value={leadForm.company}
                onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                placeholder="e.g. AutoFab Tech"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-control"
                value={leadForm.phone}
                onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                placeholder="+91..."
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={leadForm.email}
              onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
              placeholder="client@company.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Requirement Summary</label>
            <textarea
              className="form-control"
              rows={3}
              value={leadForm.requirement}
              onChange={(e) => setLeadForm({ ...leadForm, requirement: e.target.value })}
              placeholder="Material, quantity, CAD availability, tolerances..."
            />
          </div>
          <div className="form-group">
            <label className="form-label">Estimated Budget (₹)</label>
            <input
              type="number"
              className="form-control"
              value={leadForm.budget}
              onChange={(e) => setLeadForm({ ...leadForm, budget: e.target.value })}
              placeholder="e.g. 25000"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setSelectedType(null)}>
              Back
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </form>
      ) : selectedType === 'customer' ? (
        <form onSubmit={handleCreateCustomer}>
          <div className="form-group">
            <label className="form-label">Customer / Business Name *</label>
            <input
              type="text"
              required
              className="form-control"
              value={customerForm.name}
              onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
              placeholder="e.g. Rahul Mehta"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input
                type="text"
                className="form-control"
                value={customerForm.company}
                onChange={(e) => setCustomerForm({ ...customerForm, company: e.target.value })}
                placeholder="Studio K Designs"
              />
            </div>
            <div className="form-group">
              <label className="form-label">GSTIN</label>
              <input
                type="text"
                className="form-control"
                value={customerForm.gstin}
                onChange={(e) => setCustomerForm({ ...customerForm, gstin: e.target.value })}
                placeholder="29ABCDE1234F1Z5"
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="text"
                className="form-control"
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                placeholder="+91..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-control"
                value={customerForm.city}
                onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                placeholder="Bangalore"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={customerForm.email}
              onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
              placeholder="info@client.com"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setSelectedType(null)}>
              Back
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Save Customer'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleCreateExpense}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-control"
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
              >
                <option value="FILAMENT">Filament & Materials</option>
                <option value="MACHINE">Machine Parts & Upgrades</option>
                <option value="ELECTRICITY">Electricity & Utilities</option>
                <option value="MAINTENANCE">Maintenance & Repairs</option>
                <option value="PACKAGING">Packaging Materials</option>
                <option value="SHIPPING">Shipping & Couriers</option>
                <option value="MARKETING">Marketing & Ads</option>
                <option value="OTHER">Other Operational Expense</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <input
                type="number"
                required
                className="form-control"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                placeholder="e.g. 1800"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <input
              type="text"
              required
              className="form-control"
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              placeholder="e.g. 1kg Polymaker Black PLA Spool"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select
              className="form-control"
              value={expenseForm.paymentMethod}
              onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
            >
              <option value="UPI">UPI (GPay / PhonePe)</option>
              <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
              <option value="CARD">Credit / Debit Card</option>
              <option value="CASH">Cash</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setSelectedType(null)}>
              Back
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Record Expense'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
