'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  LayoutGrid,
  List,
  ArrowRight,
  Phone,
  Mail,
  Building,
  UserCheck,
  CheckCircle2,
  Trash2,
  Edit2,
  Filter,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { DataTable, Column } from '@/components/ui/DataTable';
import { formatCurrency } from '@/lib/calculations';

const PIPELINE_STAGES = [
  { key: 'NEW', label: 'New Inquiries', color: 'var(--status-info)' },
  { key: 'CONTACTED', label: 'Contacted', color: 'var(--status-purple)' },
  { key: 'QUALIFIED', label: 'Qualified', color: 'var(--status-warning)' },
  { key: 'QUOTED', label: 'Quoted', color: 'var(--status-info)' },
  { key: 'NEGOTIATION', label: 'Negotiation', color: 'var(--status-warning)' },
  { key: 'WON', label: 'Won / Customer', color: 'var(--status-success)' },
  { key: 'LOST', label: 'Closed / Lost', color: 'var(--status-danger)' },
];

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Lead Form State
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    source: 'WEBSITE',
    priority: 'MEDIUM',
    budget: '',
    requirement: '',
    notes: '',
  });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/crm/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStageChange = async (leadId: string, newStatus: string) => {
    try {
      // Optimistic update
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
      await fetch(`/api/crm/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error('Failed to update stage:', err);
      fetchLeads();
    }
  };

  const handleConvertToCustomer = async (leadId: string) => {
    if (!confirm('Convert this lead into a permanent Customer record?')) return;
    try {
      const res = await fetch(`/api/crm/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CONVERT_TO_CUSTOMER' }),
      });
      if (res.ok) {
        const { customer } = await res.json();
        router.push(`/customers/${customer.id}`);
      }
    } catch (err) {
      console.error('Convert failed:', err);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsNewLeadOpen(false);
        setFormData({
          name: '',
          company: '',
          phone: '',
          email: '',
          source: 'WEBSITE',
          priority: 'MEDIUM',
          budget: '',
          requirement: '',
          notes: '',
        });
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Table columns definition
  const columns: Column<any>[] = [
    {
      key: 'leadCode',
      header: 'Lead Code',
      render: (item) => (
        <span
          style={{ fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
          onClick={() => setSelectedLead(item)}
        >
          {item.leadCode}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'name',
      header: 'Client / Contact',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600 }}>{item.name}</div>
          {item.company && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.company}</div>}
        </div>
      ),
      sortable: true,
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
      key: 'requirement',
      header: 'Requirement',
      render: (item) => (
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {item.requirement || '—'}
        </span>
      ),
    },
    {
      key: 'budget',
      header: 'Budget',
      render: (item) => (
        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>
          {item.budget ? formatCurrency(item.budget) : '—'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (item) => <StatusBadge status={item.priority} />,
      sortable: true,
    },
    {
      key: 'status',
      header: 'Pipeline Stage',
      render: (item) => (
        <select
          value={item.status}
          onChange={(e) => handleStageChange(item.id, e.target.value)}
          className="form-control"
          style={{ padding: '3px 8px', fontSize: 11.5, width: 'auto' }}
        >
          {PIPELINE_STAGES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      ),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div style={{ display: 'flex', gap: 6 }}>
          {item.status !== 'WON' && (
            <button
              onClick={() => handleConvertToCustomer(item.id)}
              className="btn btn-secondary btn-sm"
              title="Convert to Customer"
              style={{ fontSize: 11, padding: '3px 7px' }}
            >
              <UserCheck size={13} color="var(--status-success)" /> Convert
            </button>
          )}
          <button
            onClick={() => setSelectedLead(item)}
            className="btn btn-ghost btn-sm"
            style={{ padding: 4 }}
          >
            <Edit2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Users size={22} color="var(--accent-red)" /> CRM & Sales Pipeline
          </h1>
          <p className="page-subtitle">
            Lead Qualification &bull; Stage Pipeline &bull; Requirement Tracking &bull; Customer Conversion
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* View Toggle */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: 2,
            }}
          >
            <button
              onClick={() => setViewMode('kanban')}
              className="btn btn-ghost btn-sm"
              style={{
                backgroundColor: viewMode === 'kanban' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'kanban' ? 'var(--text-primary)' : 'var(--text-muted)',
                padding: '4px 10px',
              }}
            >
              <LayoutGrid size={14} /> Pipeline
            </button>
            <button
              onClick={() => setViewMode('table')}
              className="btn btn-ghost btn-sm"
              style={{
                backgroundColor: viewMode === 'table' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'table' ? 'var(--text-primary)' : 'var(--text-muted)',
                padding: '4px 10px',
              }}
            >
              <List size={14} /> Table
            </button>
          </div>

          <button
            onClick={() => setIsNewLeadOpen(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus size={15} /> Add New Lead
          </button>
        </div>
      </div>

      {/* Main View */}
      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={leads}
          searchPlaceholder="Search leads by client name, company, requirement..."
          searchKeys={['name', 'company', 'requirement', 'leadCode', 'phone', 'email']}
          pageSize={10}
        />
      ) : (
        /* KANBAN PIPELINE BOARD */
        <div
          style={{
            display: 'flex',
            gap: 14,
            overflowX: 'auto',
            paddingBottom: 20,
            alignItems: 'flex-start',
          }}
        >
          {PIPELINE_STAGES.map((stage) => {
            const stageLeads = leads.filter((l) => l.status === stage.key);
            const totalStageBudget = stageLeads.reduce(
              (sum, l) => sum + (l.budget || 0),
              0
            );

            return (
              <div
                key={stage.key}
                style={{
                  flex: '0 0 280px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: 'calc(100vh - 190px)',
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface)',
                    borderTopLeftRadius: 'var(--radius-md)',
                    borderTopRightRadius: 'var(--radius-md)',
                    borderTop: `3px solid ${stage.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {stage.label}
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                      {stageLeads.length} leads &bull; {formatCurrency(totalStageBudget)}
                    </div>
                  </div>
                  <span
                    style={{
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-default)',
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards Column */}
                <div
                  style={{
                    padding: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    overflowY: 'auto',
                    flex: 1,
                  }}
                >
                  {stageLeads.length === 0 ? (
                    <div
                      style={{
                        padding: '24px 10px',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: 11.5,
                        border: '1px dashed var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      No leads in this stage
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          padding: 12,
                          boxShadow: 'var(--shadow-sm)',
                          transition: 'border-color var(--transition-fast)',
                          cursor: 'pointer',
                        }}
                        onClick={() => setSelectedLead(lead)}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.borderColor = 'var(--border-strong)')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.borderColor = 'var(--border-subtle)')
                        }
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 6,
                          }}
                        >
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-red)' }}>
                            {lead.leadCode}
                          </span>
                          <StatusBadge status={lead.priority} />
                        </div>

                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
                          {lead.name}
                        </div>
                        {lead.company && (
                          <div
                            style={{
                              fontSize: 11.5,
                              color: 'var(--text-muted)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              marginBottom: 8,
                            }}
                          >
                            <Building size={12} /> {lead.company}
                          </div>
                        )}

                        {lead.requirement && (
                          <div
                            style={{
                              fontSize: 11.5,
                              color: 'var(--text-secondary)',
                              lineHeight: 1.4,
                              marginBottom: 10,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {lead.requirement}
                          </div>
                        )}

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderTop: '1px solid var(--border-subtle)',
                            paddingTop: 8,
                            fontSize: 11,
                          }}
                        >
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                            {lead.budget ? formatCurrency(lead.budget) : 'Open Budget'}
                          </span>

                          <div
                            onClick={(e) => e.stopPropagation()}
                            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            {stage.key !== 'WON' && (
                              <button
                                onClick={() => handleConvertToCustomer(lead.id)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '2px 6px', fontSize: 10 }}
                                title="Convert to Customer"
                              >
                                <UserCheck size={11} color="var(--status-success)" />
                              </button>
                            )}
                            <select
                              value={lead.status}
                              onChange={(e) => handleStageChange(lead.id, e.target.value)}
                              style={{
                                backgroundColor: 'var(--bg-surface-elevated)',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 3,
                                fontSize: 10,
                                padding: '2px 4px',
                                outline: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              {PIPELINE_STAGES.map((s) => (
                                <option key={s.key} value={s.key}>
                                  → {s.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE NEW LEAD MODAL */}
      <Modal
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
        title="Add New CRM Lead"
      >
        <form onSubmit={handleCreateLead}>
          <div className="form-group">
            <label className="form-label">Client / Contact Name *</label>
            <input
              type="text"
              required
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Anand Kumar"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Company / Organization</label>
              <input
                type="text"
                className="form-control"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. AeroWings Robotics"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Inquiry Source</label>
              <select
                className="form-control"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              >
                <option value="WEBSITE">Website Form</option>
                <option value="WHATSAPP">WhatsApp Direct</option>
                <option value="REFERRAL">Client Referral</option>
                <option value="SOCIAL">Instagram / LinkedIn</option>
                <option value="EXHIBITION">Exhibition / Expo</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@company.com"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Estimated Budget (₹)</label>
              <input
                type="number"
                className="form-control"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="e.g. 50000"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-control"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent / Rush Order</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Requirement Details</label>
            <textarea
              className="form-control"
              rows={3}
              value={formData.requirement}
              onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
              placeholder="Quantity, material preference (PLA/PETG/PA-CF/TPU), tolerances, design readiness..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsNewLeadOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Add Lead to Pipeline'}
            </button>
          </div>
        </form>
      </Modal>

      {/* LEAD DETAIL MODAL */}
      {selectedLead && (
        <Modal
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          title={`Lead Details: ${selectedLead.leadCode}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>{selectedLead.name}</h2>
                {selectedLead.company && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedLead.company}</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <StatusBadge status={selectedLead.status} />
                <StatusBadge status={selectedLead.priority} />
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                padding: '12px 14px',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12,
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Phone: </span>
                <strong>{selectedLead.phone || '—'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Email: </span>
                <strong>{selectedLead.email || '—'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Source: </span>
                <strong>{selectedLead.source}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Budget: </span>
                <strong style={{ fontFamily: 'monospace' }}>
                  {selectedLead.budget ? formatCurrency(selectedLead.budget) : 'Open'}
                </strong>
              </div>
            </div>

            <div>
              <div className="form-label" style={{ marginBottom: 4 }}>
                Requirement Details
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
                {selectedLead.requirement || 'No specific details provided.'}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 12,
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <button
                onClick={() => {
                  handleConvertToCustomer(selectedLead.id);
                  setSelectedLead(null);
                }}
                className="btn btn-primary btn-sm"
              >
                <UserCheck size={14} /> Convert to Permanent Customer
              </button>

              <button
                onClick={() => {
                  router.push(`/quotes/new?customerId=${selectedLead.customerId || ''}&leadName=${encodeURIComponent(selectedLead.name)}`);
                }}
                className="btn btn-secondary btn-sm"
              >
                Generate Quote for Lead →
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
