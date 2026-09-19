'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Plus,
  ArrowRight,
  Printer,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  FileText,
  Building,
  Receipt,
  Edit2,
  Trash2,
} from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KPICard } from '@/components/ui/KPICard';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, calculateProfit } from '@/lib/calculations';

export default function FinanceHubPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'expenses'>('invoices');

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isEditInvoiceOpen, setIsEditInvoiceOpen] = useState(false);
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false);

  // Form states
  const [paymentForm, setPaymentForm] = useState({
    invoiceId: '',
    customerId: '',
    amount: '',
    paymentMethod: 'UPI',
    referenceNumber: '',
    notes: '',
  });

  const [expenseForm, setExpenseForm] = useState({
    category: 'FILAMENT',
    amount: '',
    description: '',
    supplierName: '',
    paymentMethod: 'UPI',
    referenceNumber: '',
  });

  const [editInvoiceForm, setEditInvoiceForm] = useState({
    id: '',
    status: 'ISSUED',
    dueDate: '',
    notes: '',
  });

  const [editExpenseForm, setEditExpenseForm] = useState({
    id: '',
    category: 'FILAMENT',
    amount: '',
    description: '',
    supplierName: '',
    paymentMethod: 'UPI',
    referenceNumber: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [invRes, payRes, expRes, custRes] = await Promise.all([
        fetch('/api/finance/invoices'),
        fetch('/api/finance/payments'),
        fetch('/api/finance/expenses'),
        fetch('/api/crm/customers'),
      ]);

      if (invRes.ok) setInvoices(await invRes.json());
      if (payRes.ok) setPayments(await payRes.json());
      if (expRes.ok) setExpenses(await expRes.json());
      if (custRes.ok) setCustomers(await custRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Commercial Metrics
  const totalBilled = invoices
    .filter((inv) => inv.status !== 'CANCELLED')
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalReceivables = invoices
    .filter((inv) => inv.status === 'ISSUED' || inv.status === 'PARTIALLY_PAID')
    .reduce((sum, inv) => sum + inv.balanceDue, 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netCashFlow = totalCollected - totalExpenses;

  // Record Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/finance/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm),
      });
      if (res.ok) {
        setIsPaymentModalOpen(false);
        setPaymentForm({ invoiceId: '', customerId: '', amount: '', paymentMethod: 'UPI', referenceNumber: '', notes: '' });
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Record Expense
  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/finance/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseForm),
      });
      if (res.ok) {
        setIsExpenseModalOpen(false);
        setExpenseForm({ category: 'FILAMENT', amount: '', description: '', supplierName: '', paymentMethod: 'UPI', referenceNumber: '' });
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEditInvoice = (inv: any) => {
    setEditInvoiceForm({
      id: inv.id,
      status: inv.status || 'ISSUED',
      dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '',
      notes: inv.notes || '',
    });
    setIsEditInvoiceOpen(true);
  };

  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/finance/invoices/${editInvoiceForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editInvoiceForm),
      });
      if (res.ok) {
        setIsEditInvoiceOpen(false);
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update invoice');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating invoice');
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice? Linked payment records may prevent deletion.')) return;
    try {
      const res = await fetch(`/api/finance/invoices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete invoice');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting invoice');
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment record?')) return;
    try {
      const res = await fetch(`/api/finance/payments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete payment');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting payment');
    }
  };

  const handleOpenEditExpense = (exp: any) => {
    setEditExpenseForm({
      id: exp.id,
      category: exp.category || 'FILAMENT',
      amount: String(exp.amount ?? ''),
      description: exp.description || '',
      supplierName: exp.supplierName || '',
      paymentMethod: exp.paymentMethod || 'UPI',
      referenceNumber: exp.referenceNumber || '',
    });
    setIsEditExpenseOpen(true);
  };

  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/finance/expenses/${editExpenseForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editExpenseForm),
      });
      if (res.ok) {
        setIsEditExpenseOpen(false);
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update expense');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating expense');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense record?')) return;
    try {
      const res = await fetch(`/api/finance/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete expense');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting expense');
    }
  };

  // Invoice Columns
  const invoiceColumns: Column<any>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (item) => (
        <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent-red)' }}>
          {item.invoiceNumber}
        </span>
      ),
      sortable: true,
      width: '130px',
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (item) => (
        <div>
          <Link
            href={`/customers/${item.customerId}`}
            style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}
          >
            {item.customer?.name}
          </Link>
          {item.customer?.company && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.customer.company}</div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'date',
      header: 'Issue / Due Date',
      render: (item) => (
        <div style={{ fontSize: 11.5 }}>
          <div>Issued: {new Date(item.invoiceDate).toLocaleDateString()}</div>
          <div style={{ color: 'var(--text-muted)' }}>
            Due: {new Date(item.dueDate).toLocaleDateString()}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'grandTotal',
      header: 'Grand Total',
      render: (item) => (
        <div style={{ fontWeight: 700, fontFamily: 'monospace' }}>
          {formatCurrency(item.grandTotal)}
        </div>
      ),
      sortable: true,
      width: '110px',
    },
    {
      key: 'balanceDue',
      header: 'Balance Due',
      render: (item) => (
        <div
          style={{
            fontWeight: 700,
            fontFamily: 'monospace',
            color: item.balanceDue > 0 ? 'var(--status-warning)' : 'var(--status-success)',
          }}
        >
          {formatCurrency(item.balanceDue)}
        </div>
      ),
      sortable: true,
      width: '110px',
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
      sortable: true,
      width: '110px',
    },
    {
      key: 'actions',
      header: 'Action',
      render: (item) => (
        <div style={{ display: 'flex', gap: 6 }}>
          {item.balanceDue > 0 && (
            <button
              onClick={() => {
                setPaymentForm({
                  invoiceId: item.id,
                  customerId: item.customerId,
                  amount: String(item.balanceDue),
                  paymentMethod: 'UPI',
                  referenceNumber: '',
                  notes: '',
                });
                setIsPaymentModalOpen(true);
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: 11, padding: '3px 8px' }}
            >
              + Pay
            </button>
          )}
          <Link
            href={`/finance/invoices/${item.id}/print`}
            target="_blank"
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 6px' }}
            title="Print Tax Invoice PDF"
          >
            <Printer size={13} />
          </Link>
          <button
            onClick={() => handleOpenEditInvoice(item)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 6px' }}
            title="Edit Invoice"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => handleDeleteInvoice(item.id)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 6px', color: 'var(--status-danger)' }}
            title="Delete Invoice"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
      width: '160px',
    },
  ];

  // Payment Columns
  const paymentColumns: Column<any>[] = [
    {
      key: 'paymentCode',
      header: 'Receipt #',
      render: (item) => <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{item.paymentCode}</span>,
      sortable: true,
      width: '130px',
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600 }}>{item.customer?.name}</div>
          {item.customer?.company && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.customer.company}</div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'paymentDate',
      header: 'Payment Date',
      render: (item) => new Date(item.paymentDate).toLocaleDateString(),
      sortable: true,
      width: '120px',
    },
    {
      key: 'paymentMethod',
      header: 'Method & Ref',
      render: (item) => (
        <div style={{ fontSize: 12 }}>
          <span className="badge badge-neutral" style={{ fontSize: 10 }}>
            {item.paymentMethod}
          </span>
          {item.referenceNumber && (
            <div style={{ fontSize: 10.5, fontFamily: 'monospace', color: 'var(--text-muted)', marginTop: 2 }}>
              {item.referenceNumber}
            </div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'amount',
      header: 'Amount Paid',
      render: (item) => (
        <div style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--status-success)', fontSize: 13 }}>
          {formatCurrency(item.amount)}
        </div>
      ),
      sortable: true,
      width: '120px',
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
      width: '100px',
    },
    {
      key: 'actions',
      header: 'Action',
      render: (item) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => handleDeletePayment(item.id)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 6px', color: 'var(--status-danger)' }}
            title="Delete Payment Record"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
      width: '80px',
    },
  ];

  // Expense Columns
  const expenseColumns: Column<any>[] = [
    {
      key: 'expenseCode',
      header: 'Code',
      render: (item) => <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{item.expenseCode}</span>,
      sortable: true,
      width: '120px',
    },
    {
      key: 'category',
      header: 'Category',
      render: (item) => <StatusBadge status={item.category} />,
      sortable: true,
      width: '120px',
    },
    {
      key: 'description',
      header: 'Description & Supplier',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600 }}>{item.description}</div>
          {item.supplierName && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.supplierName}</div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'expenseDate',
      header: 'Date',
      render: (item) => new Date(item.expenseDate).toLocaleDateString(),
      sortable: true,
      width: '110px',
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (item) => (
        <div style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--status-danger)' }}>
          {formatCurrency(item.amount)}
        </div>
      ),
      sortable: true,
      width: '110px',
    },
    {
      key: 'actions',
      header: 'Action',
      render: (item) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => handleOpenEditExpense(item)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 6px' }}
            title="Edit Expense"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => handleDeleteExpense(item.id)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 6px', color: 'var(--status-danger)' }}
            title="Delete Expense Record"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
      width: '100px',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <CreditCard size={22} color="var(--accent-red)" /> Finance, GST & Cash Flow
          </h1>
          <p className="page-subtitle">
            GST Invoicing &bull; Payment Ledger &bull; Operational Expense Tracking &bull; Balance Due
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="btn btn-secondary btn-sm"
          >
            + Record Expense
          </button>
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="btn btn-primary btn-sm"
          >
            + Record Payment
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard
          label="Total Billed Revenue"
          value={formatCurrency(totalBilled)}
          subtext={`${invoices.length} total tax invoices`}
          icon={DollarSign}
          accentColor="var(--status-success)"
        />
        <KPICard
          label="Outstanding Receivables"
          value={formatCurrency(totalReceivables)}
          subtext="Uncollected invoice balances"
          icon={Clock}
          accentColor={totalReceivables > 0 ? 'var(--status-warning)' : 'var(--status-success)'}
        />
        <KPICard
          label="Operating Expenses"
          value={formatCurrency(totalExpenses)}
          subtext="Filament, electricity, hardware"
          icon={CreditCard}
          accentColor="var(--status-danger)"
        />
        <KPICard
          label="Net Operating Cash"
          value={formatCurrency(netCashFlow)}
          subtext="Total collected minus expenses"
          icon={TrendingUp}
          accentColor={netCashFlow >= 0 ? 'var(--status-success)' : 'var(--status-danger)'}
        />
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'invoices' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          Tax Invoices ({invoices.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Payment Receipts ({payments.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          Expenses ({expenses.length})
        </button>
      </div>

      {/* TAB TABLES */}
      {activeTab === 'invoices' && (
        <DataTable
          columns={invoiceColumns}
          data={invoices}
          searchPlaceholder="Search invoices by number, customer..."
          searchKeys={['invoiceNumber']}
          pageSize={10}
        />
      )}

      {activeTab === 'payments' && (
        <DataTable
          columns={paymentColumns}
          data={payments}
          searchPlaceholder="Search payments by receipt, reference, customer..."
          searchKeys={['paymentCode', 'referenceNumber']}
          pageSize={10}
        />
      )}

      {activeTab === 'expenses' && (
        <DataTable
          columns={expenseColumns}
          data={expenses}
          searchPlaceholder="Search expenses by description, supplier..."
          searchKeys={['description', 'supplierName', 'expenseCode']}
          pageSize={10}
        />
      )}

      {/* RECORD PAYMENT MODAL */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Client Payment Receipt"
      >
        <form onSubmit={handleRecordPayment}>
          <div className="form-group">
            <label className="form-label">Select Client *</label>
            <select
              className="form-control"
              value={paymentForm.customerId}
              onChange={(e) => setPaymentForm({ ...paymentForm, customerId: e.target.value })}
              required
            >
              <option value="">-- Select Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `(${c.company})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Link to Invoice (Optional)</label>
            <select
              className="form-control"
              value={paymentForm.invoiceId}
              onChange={(e) => {
                const invId = e.target.value;
                const inv = invoices.find((i) => i.id === invId);
                setPaymentForm({
                  ...paymentForm,
                  invoiceId: invId,
                  customerId: inv?.customerId || paymentForm.customerId,
                  amount: inv ? String(inv.balanceDue) : paymentForm.amount,
                });
              }}
            >
              <option value="">-- Standalone Advance / General Payment --</option>
              {invoices
                .filter((i) => i.balanceDue > 0)
                .map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.invoiceNumber} &bull; Due: {formatCurrency(i.balanceDue)} ({i.customer.name})
                  </option>
                ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Payment Amount (₹) *</label>
              <input
                type="number"
                required
                className="form-control"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                placeholder="e.g. 8138"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-control"
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
              >
                <option value="UPI">UPI (GPay, PhonePe, Paytm)</option>
                <option value="BANK_TRANSFER">Bank Transfer / NEFT / IMPS</option>
                <option value="CARD">Credit / Debit Card</option>
                <option value="CASH">Cash</option>
                <option value="RAZORPAY">Razorpay Gateway</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Transaction Reference (UTR Number)</label>
            <input
              type="text"
              className="form-control"
              value={paymentForm.referenceNumber}
              onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
              placeholder="e.g. UPI/20260916/9821389102"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsPaymentModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Record & Reconcile Payment →
            </button>
          </div>
        </form>
      </Modal>

      {/* RECORD EXPENSE MODAL */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Record Shop Floor Expense"
      >
        <form onSubmit={handleRecordExpense}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Expense Category *</label>
              <select
                className="form-control"
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
              >
                <option value="FILAMENT">Filament & Materials</option>
                <option value="MACHINE">Machine Parts & Nozzles</option>
                <option value="ELECTRICITY">Electricity & Power</option>
                <option value="MAINTENANCE">Maintenance & Service</option>
                <option value="PACKAGING">Packaging Materials</option>
                <option value="SHIPPING">Shipping & Freight</option>
                <option value="MARKETING">Marketing & Advertising</option>
                <option value="RENT">Workshop Rent</option>
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
                placeholder="e.g. 4500"
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
              placeholder="e.g. 2x Polymaker PA-CF spools & 0.4mm hardened nozzles"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Supplier / Vendor Name</label>
              <input
                type="text"
                className="form-control"
                value={expenseForm.supplierName}
                onChange={(e) => setExpenseForm({ ...expenseForm, supplierName: e.target.value })}
                placeholder="e.g. MakerBazaar India"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-control"
                value={expenseForm.paymentMethod}
                onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
              >
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CARD">Card</option>
                <option value="CASH">Cash</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsExpenseModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Log Expense
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT INVOICE MODAL */}
      <Modal
        isOpen={isEditInvoiceOpen}
        onClose={() => setIsEditInvoiceOpen(false)}
        title="Edit Invoice Details"
      >
        <form onSubmit={handleUpdateInvoice}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Invoice Status *</label>
              <select
                className="form-control"
                value={editInvoiceForm.status}
                onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, status: e.target.value })}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="ISSUED">ISSUED</option>
                <option value="PARTIALLY_PAID">PARTIALLY_PAID</option>
                <option value="PAID">PAID</option>
                <option value="OVERDUE">OVERDUE</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-control"
                value={editInvoiceForm.dueDate}
                onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Internal Notes / Terms</label>
            <textarea
              className="form-control"
              rows={2}
              value={editInvoiceForm.notes}
              onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ color: 'var(--status-danger)' }}
              onClick={() => {
                setIsEditInvoiceOpen(false);
                handleDeleteInvoice(editInvoiceForm.id);
              }}
            >
              <Trash2 size={13} style={{ marginRight: 6 }} /> Delete Invoice
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsEditInvoiceOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Invoice
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* EDIT EXPENSE MODAL */}
      <Modal
        isOpen={isEditExpenseOpen}
        onClose={() => setIsEditExpenseOpen(false)}
        title="Edit Operational Expense"
      >
        <form onSubmit={handleUpdateExpense}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Expense Category *</label>
              <select
                className="form-control"
                value={editExpenseForm.category}
                onChange={(e) => setEditExpenseForm({ ...editExpenseForm, category: e.target.value })}
              >
                <option value="FILAMENT">Filament & Materials</option>
                <option value="MACHINE">Machine Parts & Nozzles</option>
                <option value="ELECTRICITY">Electricity & Power</option>
                <option value="MAINTENANCE">Maintenance & Service</option>
                <option value="PACKAGING">Packaging Materials</option>
                <option value="SHIPPING">Shipping & Freight</option>
                <option value="MARKETING">Marketing & Advertising</option>
                <option value="RENT">Workshop Rent</option>
                <option value="OTHER">Other Operational Expense</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <input
                type="number"
                required
                className="form-control"
                value={editExpenseForm.amount}
                onChange={(e) => setEditExpenseForm({ ...editExpenseForm, amount: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <input
              type="text"
              required
              className="form-control"
              value={editExpenseForm.description}
              onChange={(e) => setEditExpenseForm({ ...editExpenseForm, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Supplier / Vendor Name</label>
              <input
                type="text"
                className="form-control"
                value={editExpenseForm.supplierName}
                onChange={(e) => setEditExpenseForm({ ...editExpenseForm, supplierName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-control"
                value={editExpenseForm.paymentMethod}
                onChange={(e) => setEditExpenseForm({ ...editExpenseForm, paymentMethod: e.target.value })}
              >
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CARD">Card</option>
                <option value="CASH">Cash</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reference Number (UTR / Receipt)</label>
            <input
              type="text"
              className="form-control"
              value={editExpenseForm.referenceNumber}
              onChange={(e) => setEditExpenseForm({ ...editExpenseForm, referenceNumber: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ color: 'var(--status-danger)' }}
              onClick={() => {
                setIsEditExpenseOpen(false);
                handleDeleteExpense(editExpenseForm.id);
              }}
            >
              <Trash2 size={13} style={{ marginRight: 6 }} /> Delete Expense
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsEditExpenseOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
