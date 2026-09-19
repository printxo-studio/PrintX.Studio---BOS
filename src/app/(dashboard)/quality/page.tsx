'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  RotateCcw,
  Printer,
  ShoppingBag,
  TrendingDown,
  Check,
  X,
  FileCheck,
  Eye,
  Sliders,
  HelpCircle,
  BarChart3,
  MessageSquareWarning,
  Workflow,
  Sparkles,
  Edit2,
  Trash2,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KPICard } from '@/components/ui/KPICard';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, calculateFirstPassYield } from '@/lib/calculations';
import { DEFECT_CATALOG } from '@/lib/constants';

export default function QualityTqmPage() {
  const [activeTab, setActiveTab] = useState<'INSPECTIONS' | 'DEFECTS' | 'COMPLAINTS' | 'CAPA'>('INSPECTIONS');

  // Data states
  const [inspections, setInspections] = useState<any[]>([]);
  const [defectStats, setDefectStats] = useState<{ defects: any[]; paretoData: any[]; totalDefects: number; totalScrapCost: number }>({
    defects: [],
    paretoData: [],
    totalDefects: 0,
    totalScrapCost: 0,
  });
  const [complaints, setComplaints] = useState<any[]>([]);
  const [capas, setCapas] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [stageFilter, setStageFilter] = useState('ALL');
  const [resultFilter, setResultFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddQcOpen, setIsAddQcOpen] = useState(false);
  const [isAddComplaintOpen, setIsAddComplaintOpen] = useState(false);
  const [isAddCapaOpen, setIsAddCapaOpen] = useState(false);
  const [isEditQcOpen, setIsEditQcOpen] = useState(false);
  const [editQcForm, setEditQcForm] = useState<any>({});
  const [isEditComplaintOpen, setIsEditComplaintOpen] = useState(false);
  const [editComplaintForm, setEditComplaintForm] = useState<any>({});
  const [isEditCapaOpen, setIsEditCapaOpen] = useState(false);
  const [editCapaForm, setEditCapaForm] = useState<any>({});
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Forms
  const [newQcForm, setNewQcForm] = useState({
    orderId: '',
    productId: '',
    inspectionStage: 'FINAL',
    specification: 'Dimensional Accuracy (Outer Diameter & Flange)',
    requiredValue: '25.00mm',
    actualValue: '25.04mm',
    tolerance: '±0.10mm',
    result: 'PASSED',
    severity: 'MINOR',
    defectType: '',
    rootCause: '',
    reworkRequired: false,
    reprintRequired: false,
    inspector: 'PrintXO Quality Lead',
    notes: 'Flange thickness and mounting holes within specification. Interlayer bond solid.',
  });

  const [newComplaintForm, setNewComplaintForm] = useState({
    customerId: '',
    orderId: '',
    issueTitle: 'Dimension out of spec on mounting bracket',
    severity: 'HIGH',
    description: 'Client reports hole spacing is 48.5mm instead of specified 48.0mm, preventing chassis mounting.',
    status: 'OPEN',
    owner: 'PrintXO Quality Lead',
  });

  const [newCapaForm, setNewCapaForm] = useState({
    problemStatement: 'Hole shrinkage on cylindrical bosses due to thermal contraction on ABS prints.',
    containmentAction: 'Quarantine current lot PRX-ROBO-BRK-V2 and re-measure with calibrated bore micrometer.',
    rootCauseMethod: '5_WHY',
    rootCauseAnalysis: 'Why 1: Hole was undersized by 0.5mm -> Why 2: Slicer hole horizontal expansion was left at 0 -> Why 3: Slicer profile did not account for ABS 1.8% thermal contraction -> Why 4: First time printing in ABS without shrinkage compensation -> Why 5: No standard shrinkage offset check in SOP-ABS-01.',
    correctiveAction: 'Apply +0.25mm Hole Horizontal Expansion in OrcaSlicer ABS profile.',
    preventiveAction: 'Update SOP-ABS-01 to require shrinkage test calibration coupon for all tight-tolerance press-fits.',
    owner: 'PrintXO Quality Lead',
    dueDate: '',
  });

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [qcRes, defRes, cmpRes, capaRes, ordRes, prodRes, custRes] = await Promise.all([
        fetch('/api/quality/inspections'),
        fetch('/api/quality/defects'),
        fetch('/api/quality/complaints'),
        fetch('/api/quality/capa'),
        fetch('/api/orders'),
        fetch('/api/products'),
        fetch('/api/crm/customers'),
      ]);

      if (qcRes.ok) setInspections(await qcRes.json());
      if (defRes.ok) setDefectStats(await defRes.json());
      if (cmpRes.ok) setComplaints(await cmpRes.json());
      if (capaRes.ok) setCapas(await capaRes.json());
      if (ordRes.ok) setOrders(await ordRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
      if (custRes.ok) {
        const custData = await custRes.json();
        setCustomers(custData);
        if (custData.length > 0 && !newComplaintForm.customerId) {
          setNewComplaintForm((prev) => ({ ...prev, customerId: custData[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load quality data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleCreateQc = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/quality/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQcForm),
      });
      if (res.ok) {
        setIsAddQcOpen(false);
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/quality/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComplaintForm),
      });
      if (res.ok) {
        setIsAddComplaintOpen(false);
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCapa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/quality/capa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCapaForm),
      });
      if (res.ok) {
        setIsAddCapaOpen(false);
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateComplaintStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/quality/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolution: status === 'RESOLVED' ? 'Replaced parts sent via Express' : undefined }),
      });
      if (res.ok) loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCapaStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/quality/capa/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Inspection Edit/Delete
  const handleOpenEditQc = (item: any) => {
    setEditQcForm({
      id: item.id,
      qcCode: item.qcCode,
      result: item.result || 'PASSED',
      defectType: item.defectType || '',
      severity: item.severity || 'MINOR',
      reworkRequired: item.reworkRequired || false,
      reprintRequired: item.reprintRequired || false,
      rootCause: item.rootCause || '',
      correctiveAction: item.correctiveAction || '',
      preventiveAction: item.preventiveAction || '',
      notes: item.notes || '',
    });
    setIsEditQcOpen(true);
  };

  const handleUpdateQc = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/quality/inspections/${editQcForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editQcForm),
      });
      if (res.ok) {
        setIsEditQcOpen(false);
        loadAllData();
      } else {
        alert('Failed to update inspection');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating inspection');
    }
  };

  const handleDeleteQc = async (id: string, qcCode: string) => {
    if (!confirm(`Are you sure you want to delete inspection ${qcCode}?`)) return;
    try {
      const res = await fetch(`/api/quality/inspections/${id}`, { method: 'DELETE' });
      if (res.ok) loadAllData();
      else alert('Failed to delete inspection');
    } catch (err) {
      console.error(err);
      alert('Error deleting inspection');
    }
  };

  // Complaint Edit/Delete
  const handleOpenEditComplaint = (c: any) => {
    setEditComplaintForm({
      id: c.id,
      complaintCode: c.complaintCode,
      issueTitle: c.issueTitle || '',
      status: c.status || 'OPEN',
      severity: c.severity || 'HIGH',
      resolution: c.resolution || '',
      notes: c.notes || '',
      owner: c.owner || '',
    });
    setIsEditComplaintOpen(true);
  };

  const handleUpdateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/quality/complaints/${editComplaintForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editComplaintForm),
      });
      if (res.ok) {
        setIsEditComplaintOpen(false);
        loadAllData();
      } else {
        alert('Failed to update complaint');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating complaint');
    }
  };

  const handleDeleteComplaint = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete complaint ${code}?`)) return;
    try {
      const res = await fetch(`/api/quality/complaints/${id}`, { method: 'DELETE' });
      if (res.ok) loadAllData();
      else alert('Failed to delete complaint');
    } catch (err) {
      console.error(err);
      alert('Error deleting complaint');
    }
  };

  // CAPA Edit/Delete
  const handleOpenEditCapa = (capa: any) => {
    setEditCapaForm({
      id: capa.id,
      capaCode: capa.capaCode,
      status: capa.status || 'OPEN',
      containmentAction: capa.containmentAction || '',
      rootCauseAnalysis: capa.rootCauseAnalysis || '',
      correctiveAction: capa.correctiveAction || '',
      preventiveAction: capa.preventiveAction || '',
      notes: capa.notes || '',
    });
    setIsEditCapaOpen(true);
  };

  const handleUpdateCapa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/quality/capa/${editCapaForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCapaForm),
      });
      if (res.ok) {
        setIsEditCapaOpen(false);
        loadAllData();
      } else {
        alert('Failed to update CAPA');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating CAPA');
    }
  };

  const handleDeleteCapa = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete CAPA record ${code}?`)) return;
    try {
      const res = await fetch(`/api/quality/capa/${id}`, { method: 'DELETE' });
      if (res.ok) loadAllData();
      else alert('Failed to delete CAPA');
    } catch (err) {
      console.error(err);
      alert('Error deleting CAPA');
    }
  };

  // KPIs
  const totalPassed = inspections.filter((i) => i.result === 'PASSED').length;
  const fpyRate = inspections.length > 0 ? calculateFirstPassYield(totalPassed, inspections.length) : 100;
  const openComplaints = complaints.filter((c) => c.status !== 'CLOSED' && c.status !== 'RESOLVED').length;
  const activeCapas = capas.filter((c) => c.status !== 'CLOSED').length;

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
              Total Quality Management (TQM)
            </span>
            <span style={{ color: 'var(--text-tertiary)' }}>•</span>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              Sections 20, 21, 22, 23
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
            Quality & Defect Management
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Incoming/In-process/Final QC inspections, defect Pareto analytics, customer complaint tracking, and 8D CAPA resolution.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {activeTab === 'INSPECTIONS' && (
            <button
              onClick={() => setIsAddQcOpen(true)}
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
              Log QC Inspection
            </button>
          )}

          {activeTab === 'COMPLAINTS' && (
            <button
              onClick={() => setIsAddComplaintOpen(true)}
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
              Log Customer Complaint
            </button>
          )}

          {activeTab === 'CAPA' && (
            <button
              onClick={() => setIsAddCapaOpen(true)}
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
              Initiate CAPA Ticket
            </button>
          )}
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
          label="First Pass Yield (FPY)"
          value={`${fpyRate}%`}
          subtext={`${totalPassed} of ${inspections.length} passed first time`}
          icon={ShieldCheck}
        />
        <KPICard
          label="Total QC Inspections"
          value={inspections.length}
          subtext="Certified shop floor checks"
          icon={CheckCircle2}
        />
        <KPICard
          label="Logged Defects & Scrap"
          value={formatCurrency(defectStats.totalScrapCost)}
          subtext={`${defectStats.totalDefects} scrap incidents tracked`}
          icon={AlertTriangle}
        />
        <KPICard
          label="Open Complaints / CAPA"
          value={`${openComplaints} / ${activeCapas}`}
          subtext="Active corrective action tracks"
          icon={Workflow}
        />
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          gap: 24,
        }}
      >
        <button
          onClick={() => setActiveTab('INSPECTIONS')}
          style={{
            padding: '12px 0',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'INSPECTIONS' ? 'var(--accent-red)' : 'transparent'}`,
            color: activeTab === 'INSPECTIONS' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <FileCheck size={16} />
          QC Inspections ({inspections.length})
        </button>

        <button
          onClick={() => setActiveTab('DEFECTS')}
          style={{
            padding: '12px 0',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'DEFECTS' ? 'var(--accent-red)' : 'transparent'}`,
            color: activeTab === 'DEFECTS' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <BarChart3 size={16} />
          Defect Pareto Analytics
        </button>

        <button
          onClick={() => setActiveTab('COMPLAINTS')}
          style={{
            padding: '12px 0',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'COMPLAINTS' ? 'var(--accent-red)' : 'transparent'}`,
            color: activeTab === 'COMPLAINTS' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <MessageSquareWarning size={16} />
          Customer Complaints ({complaints.length})
        </button>

        <button
          onClick={() => setActiveTab('CAPA')}
          style={{
            padding: '12px 0',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'CAPA' ? 'var(--accent-red)' : 'transparent'}`,
            color: activeTab === 'CAPA' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Workflow size={16} />
          CAPA 8D Problem Solving ({capas.length})
        </button>
      </div>

      {/* TAB 1: QC INSPECTIONS */}
      {activeTab === 'INSPECTIONS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Table */}
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
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>QC Code</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Stage</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Specification & Tolerances</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Required vs Actual</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Result</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Defect / Action</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Inspector</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inspections.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                        No QC inspections recorded yet.
                      </td>
                    </tr>
                  ) : (
                    inspections.map((i) => (
                      <tr
                        key={i.id}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          fontSize: 13,
                          transition: 'background-color 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-canvas)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                            {i.qcCode}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                            {new Date(i.inspectionDate).toLocaleDateString()}
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 4,
                              backgroundColor: 'var(--bg-surface-elevated)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {i.inspectionStage}
                          </span>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {i.specification || 'Dimensional Accuracy'}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                            Tolerance: {i.tolerance || '±0.10mm'}
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Req: {i.requiredValue || '-'}</span>
                            <span style={{ color: 'var(--text-tertiary)' }}>→</span>
                            <span
                              style={{
                                fontWeight: 700,
                                color: i.result === 'PASSED' ? 'var(--accent-green, #10b981)' : 'var(--accent-red)',
                              }}
                            >
                              Act: {i.actualValue || '-'}
                            </span>
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <StatusBadge
                            status={i.result}
                            variant={i.result === 'PASSED' ? 'success' : 'danger'}
                          />
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          {i.defectType ? (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                padding: '2px 6px',
                                borderRadius: 4,
                                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                color: 'var(--accent-red)',
                              }}
                            >
                              {i.defectType}
                            </span>
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--accent-green, #10b981)' }}>None (Conforming)</span>
                          )}
                          {i.reprintRequired && (
                            <div style={{ fontSize: 11, color: 'var(--accent-red)', marginTop: 2, fontWeight: 600 }}>
                              Reprint Mandated
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                          {i.inspector || 'Staff'}
                        </td>

                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                            <button
                              onClick={() => handleOpenEditQc(i)}
                              title="Edit Inspection"
                              style={{
                                padding: '4px 6px',
                                backgroundColor: 'var(--bg-surface-elevated)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 4,
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                              }}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteQc(i.id, i.qcCode)}
                              title="Delete Inspection"
                              style={{
                                padding: '4px 6px',
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
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEFECT PARETO ANALYTICS */}
      {activeTab === 'DEFECTS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 20,
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              Section 21: Pareto Analysis of Failure Modes (80/20 Rule)
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Identifies the highest frequency causes of scrap and dimensional rework across printer farm operations.
            </p>

            {defectStats.paretoData.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                No defects currently recorded. System is operating at 100% first-pass quality!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {defectStats.paretoData.map((item, idx) => (
                  <div key={item.type} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        #{idx + 1} {item.name}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        <strong>{item.count} occurrences</strong> ({item.percentage}% of all defects) •{' '}
                        <strong style={{ color: 'var(--accent-red)' }}>{formatCurrency(item.totalCost)} scrap cost</strong>
                      </span>
                    </div>

                    <div
                      style={{
                        width: '100%',
                        height: 8,
                        backgroundColor: 'var(--bg-canvas)',
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${item.percentage}%`,
                          height: '100%',
                          backgroundColor: idx === 0 ? 'var(--accent-red)' : 'var(--accent-yellow, #f59e0b)',
                          borderRadius: 4,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMER COMPLAINTS */}
      {activeTab === 'COMPLAINTS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Code</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Customer</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Issue Title & Description</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Severity</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Resolution</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                        Zero customer complaints on file. Excellent quality rating!
                      </td>
                    </tr>
                  ) : (
                    complaints.map((c) => (
                      <tr
                        key={c.id}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          fontSize: 13,
                          transition: 'background-color 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-canvas)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                            {c.complaintCode}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                            {new Date(c.date).toLocaleDateString()}
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {c.customer?.name}
                          </div>
                          {c.customer?.company && (
                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                              {c.customer.company}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {c.issueTitle}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                            {c.description}
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 4,
                              backgroundColor:
                                c.severity === 'CRITICAL' || c.severity === 'HIGH'
                                  ? 'rgba(239, 68, 68, 0.15)'
                                  : 'rgba(245, 158, 11, 0.15)',
                              color:
                                c.severity === 'CRITICAL' || c.severity === 'HIGH'
                                  ? 'var(--accent-red)'
                                  : 'var(--accent-yellow, #f59e0b)',
                            }}
                          >
                            {c.severity}
                          </span>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <StatusBadge status={c.status} />
                        </td>

                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                          {c.resolution || 'Investigation under review'}
                        </td>

                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                            {c.status !== 'RESOLVED' && c.status !== 'CLOSED' && (
                              <button
                                onClick={() => handleUpdateComplaintStatus(c.id, 'RESOLVED')}
                                style={{
                                  padding: '5px 8px',
                                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                  border: '1px solid rgba(16, 185, 129, 0.4)',
                                  borderRadius: 4,
                                  color: 'var(--accent-green, #10b981)',
                                  fontSize: 11,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Mark Resolved
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setNewCapaForm({
                                  ...newCapaForm,
                                  problemStatement: `Customer Complaint ${c.complaintCode}: ${c.issueTitle}. ${c.description}`,
                                });
                                setIsAddCapaOpen(true);
                              }}
                              style={{
                                padding: '5px 8px',
                                backgroundColor: 'var(--bg-surface-elevated)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 4,
                                color: 'var(--accent-red)',
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Escalate to CAPA
                            </button>

                            <button
                              title="Edit Complaint"
                              onClick={() => handleOpenEditComplaint(c)}
                              style={{
                                padding: '5px 7px',
                                backgroundColor: 'var(--bg-surface-elevated)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 4,
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                              }}
                            >
                              <Edit2 size={12} />
                            </button>

                            <button
                              title="Delete Complaint"
                              onClick={() => handleDeleteComplaint(c.id, c.complaintCode)}
                              style={{
                                padding: '5px 7px',
                                backgroundColor: 'var(--bg-surface-elevated)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 4,
                                color: 'var(--accent-red)',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CAPA (CORRECTIVE & PREVENTIVE ACTION) */}
      {activeTab === 'CAPA' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Workflow size={20} color="var(--accent-red)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Section 23 8D CAPA Methodology:</strong> Problem →
              Containment → Root Cause Analysis (5-Whys) → Corrective Action → Preventive Action → Verification → Closure.
            </div>
          </div>

          {capas.length === 0 ? (
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 40,
                textAlign: 'center',
                color: 'var(--text-tertiary)',
              }}
            >
              No active CAPA investigations open. Quality processes are conforming.
            </div>
          ) : (
            capas.map((capa) => (
              <div
                key={capa.id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-red)' }}>
                        {capa.capaCode}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                        Owner: {capa.owner || 'Quality Lead'}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                      {capa.problemStatement}
                    </h3>
                  </div>

                  <StatusBadge status={capa.status} />
                </div>

                {/* 5 Whys Root Cause */}
                {capa.rootCauseAnalysis && (
                  <div
                    style={{
                      backgroundColor: 'var(--bg-canvas)',
                      padding: 14,
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 13,
                    }}
                  >
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Root Cause Analysis (5-Whys Method)
                    </span>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                      {capa.rootCauseAnalysis}
                    </p>
                  </div>
                )}

                {/* Actions Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                  <div
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.05)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      padding: 12,
                      borderRadius: 4,
                    }}
                  >
                    <strong style={{ color: 'var(--accent-red)' }}>Corrective Action (Direct Fix):</strong>
                    <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                      {capa.correctiveAction}
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.05)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      padding: 12,
                      borderRadius: 4,
                    }}
                  >
                    <strong style={{ color: 'var(--accent-green, #10b981)' }}>Preventive Action (Systemic Prevention):</strong>
                    <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                      {capa.preventiveAction}
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 8,
                    paddingTop: 10,
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      onClick={() => handleOpenEditCapa(capa)}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 4,
                        fontSize: 12,
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                      title="Edit CAPA"
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCapa(capa.id, capa.capaCode)}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 4,
                        fontSize: 12,
                        color: 'var(--accent-red)',
                        cursor: 'pointer',
                      }}
                      title="Delete CAPA"
                    >
                      <Trash2 size={13} />
                    </button>
                    {capa.status !== 'CLOSED' && (
                      <button
                        onClick={() => handleUpdateCapaStatus(capa.id, 'CLOSED')}
                        style={{
                          padding: '6px 14px',
                          backgroundColor: 'var(--accent-green, #10b981)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Verify & Close CAPA
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL: LOG QC INSPECTION */}
      <Modal
        isOpen={isAddQcOpen}
        onClose={() => setIsAddQcOpen(false)}
        title="Log Quality Inspection (QC)"
      >
        <form onSubmit={handleCreateQc} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Inspection Stage
              </label>
              <select
                value={newQcForm.inspectionStage}
                onChange={(e) => setNewQcForm({ ...newQcForm, inspectionStage: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              >
                <option value="INCOMING">INCOMING (Raw Material / Spool Check)</option>
                <option value="IN_PROCESS">IN_PROCESS (Mid-print Layer Verification)</option>
                <option value="FINAL">FINAL (Post-Processing & Dimension Check)</option>
                <option value="CUSTOMER_RETURN">CUSTOMER_RETURN</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Result
              </label>
              <select
                value={newQcForm.result}
                onChange={(e) => setNewQcForm({ ...newQcForm, result: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              >
                <option value="PASSED">PASSED (Conforming)</option>
                <option value="FAILED">FAILED (Non-Conforming)</option>
                <option value="REWORK_REQUIRED">REWORK_REQUIRED</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Specification Tested
            </label>
            <input
              type="text"
              required
              value={newQcForm.specification}
              onChange={(e) => setNewQcForm({ ...newQcForm, specification: e.target.value })}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Required Value
              </label>
              <input
                type="text"
                placeholder="25.00mm"
                value={newQcForm.requiredValue}
                onChange={(e) => setNewQcForm({ ...newQcForm, requiredValue: e.target.value })}
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
                Actual Value
              </label>
              <input
                type="text"
                placeholder="25.04mm"
                value={newQcForm.actualValue}
                onChange={(e) => setNewQcForm({ ...newQcForm, actualValue: e.target.value })}
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
                Tolerance
              </label>
              <input
                type="text"
                value={newQcForm.tolerance}
                onChange={(e) => setNewQcForm({ ...newQcForm, tolerance: e.target.value })}
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

          {newQcForm.result === 'FAILED' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Defect Category
                </label>
                <select
                  value={newQcForm.defectType}
                  onChange={(e) => setNewQcForm({ ...newQcForm, defectType: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 4,
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="">Select Failure Mode</option>
                  {DEFECT_CATALOG.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Reprint Required?
                </label>
                <select
                  value={newQcForm.reprintRequired ? 'YES' : 'NO'}
                  onChange={(e) => setNewQcForm({ ...newQcForm, reprintRequired: e.target.value === 'YES' })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 4,
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="NO">No (Rework / Scuff Polish)</option>
                  <option value="YES">Yes (Full Reprint Mandated)</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Inspection Notes / Caliper Readings
            </label>
            <textarea
              rows={2}
              value={newQcForm.notes}
              onChange={(e) => setNewQcForm({ ...newQcForm, notes: e.target.value })}
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
              onClick={() => setIsAddQcOpen(false)}
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
              Save QC Record
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: LOG CUSTOMER COMPLAINT */}
      <Modal
        isOpen={isAddComplaintOpen}
        onClose={() => setIsAddComplaintOpen(false)}
        title="Log Customer Quality Complaint"
      >
        <form onSubmit={handleCreateComplaint} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Customer
            </label>
            <select
              required
              value={newComplaintForm.customerId}
              onChange={(e) => setNewComplaintForm({ ...newComplaintForm, customerId: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                color: 'var(--text-primary)',
              }}
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `(${c.company})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Issue Title
              </label>
              <input
                type="text"
                required
                value={newComplaintForm.issueTitle}
                onChange={(e) => setNewComplaintForm({ ...newComplaintForm, issueTitle: e.target.value })}
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
                Severity
              </label>
              <select
                value={newComplaintForm.severity}
                onChange={(e) => setNewComplaintForm({ ...newComplaintForm, severity: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Detailed Description of Non-Conformance
            </label>
            <textarea
              rows={3}
              required
              value={newComplaintForm.description}
              onChange={(e) => setNewComplaintForm({ ...newComplaintForm, description: e.target.value })}
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
              onClick={() => setIsAddComplaintOpen(false)}
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
              Log Complaint
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: INITIATE CAPA TICKET */}
      <Modal
        isOpen={isAddCapaOpen}
        onClose={() => setIsAddCapaOpen(false)}
        title="Initiate CAPA Investigation (8D)"
      >
        <form onSubmit={handleCreateCapa} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Problem Statement (Non-Conformance)
            </label>
            <textarea
              rows={2}
              required
              value={newCapaForm.problemStatement}
              onChange={(e) => setNewCapaForm({ ...newCapaForm, problemStatement: e.target.value })}
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

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Containment Action (Immediate Action to Protect Customer)
            </label>
            <input
              type="text"
              required
              value={newCapaForm.containmentAction}
              onChange={(e) => setNewCapaForm({ ...newCapaForm, containmentAction: e.target.value })}
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
              Root Cause Analysis (5-Whys Method)
            </label>
            <textarea
              rows={3}
              required
              value={newCapaForm.rootCauseAnalysis}
              onChange={(e) => setNewCapaForm({ ...newCapaForm, rootCauseAnalysis: e.target.value })}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Corrective Action (Direct Solution)
              </label>
              <textarea
                rows={2}
                required
                value={newCapaForm.correctiveAction}
                onChange={(e) => setNewCapaForm({ ...newCapaForm, correctiveAction: e.target.value })}
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

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Preventive Action (Systemic Protection)
              </label>
              <textarea
                rows={2}
                required
                value={newCapaForm.preventiveAction}
                onChange={(e) => setNewCapaForm({ ...newCapaForm, preventiveAction: e.target.value })}
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
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => setIsAddCapaOpen(false)}
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
              Initiate CAPA
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT QC INSPECTION MODAL */}
      <Modal
        isOpen={isEditQcOpen}
        onClose={() => setIsEditQcOpen(false)}
        title={`Edit Inspection: ${editQcForm.qcCode || ''}`}
      >
        <form onSubmit={handleUpdateQc} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Result
              </label>
              <select
                value={editQcForm.result || 'PASSED'}
                onChange={(e) => setEditQcForm({ ...editQcForm, result: e.target.value })}
                className="input"
                style={{ width: '100%' }}
              >
                <option value="PASSED">PASSED</option>
                <option value="FAILED">FAILED</option>
                <option value="CONDITIONAL_PASS">CONDITIONAL_PASS</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Severity
              </label>
              <select
                value={editQcForm.severity || 'MINOR'}
                onChange={(e) => setEditQcForm({ ...editQcForm, severity: e.target.value })}
                className="input"
                style={{ width: '100%' }}
              >
                <option value="MINOR">MINOR</option>
                <option value="MAJOR">MAJOR</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Defect Classification (if any)
            </label>
            <select
              value={editQcForm.defectType || ''}
              onChange={(e) => setEditQcForm({ ...editQcForm, defectType: e.target.value })}
              className="input"
              style={{ width: '100%' }}
            >
              <option value="">None (Conforming)</option>
              {DEFECT_CATALOG.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={Boolean(editQcForm.reworkRequired)}
                onChange={(e) => setEditQcForm({ ...editQcForm, reworkRequired: e.target.checked })}
              />
              Rework Required
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={Boolean(editQcForm.reprintRequired)}
                onChange={(e) => setEditQcForm({ ...editQcForm, reprintRequired: e.target.checked })}
              />
              Reprint Required
            </label>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Inspection Notes / Root Cause
            </label>
            <textarea
              className="input"
              rows={2}
              value={editQcForm.notes || ''}
              onChange={(e) => setEditQcForm({ ...editQcForm, notes: e.target.value })}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsEditQcOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Save QC Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT COMPLAINT MODAL */}
      <Modal
        isOpen={isEditComplaintOpen}
        onClose={() => setIsEditComplaintOpen(false)}
        title={`Edit Complaint: ${editComplaintForm.complaintCode || ''}`}
      >
        <form onSubmit={handleUpdateComplaint} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Issue Title *
            </label>
            <input
              type="text"
              required
              className="input"
              value={editComplaintForm.issueTitle || ''}
              onChange={(e) => setEditComplaintForm({ ...editComplaintForm, issueTitle: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Status
              </label>
              <select
                value={editComplaintForm.status || 'OPEN'}
                onChange={(e) => setEditComplaintForm({ ...editComplaintForm, status: e.target.value })}
                className="input"
                style={{ width: '100%' }}
              >
                <option value="OPEN">OPEN</option>
                <option value="INVESTIGATING">INVESTIGATING</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Severity
              </label>
              <select
                value={editComplaintForm.severity || 'HIGH'}
                onChange={(e) => setEditComplaintForm({ ...editComplaintForm, severity: e.target.value })}
                className="input"
                style={{ width: '100%' }}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Resolution Notes
            </label>
            <textarea
              className="input"
              rows={2}
              value={editComplaintForm.resolution || ''}
              onChange={(e) => setEditComplaintForm({ ...editComplaintForm, resolution: e.target.value })}
              placeholder="How this issue was resolved..."
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsEditComplaintOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Save Complaint Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT CAPA MODAL */}
      <Modal
        isOpen={isEditCapaOpen}
        onClose={() => setIsEditCapaOpen(false)}
        title={`Edit CAPA: ${editCapaForm.capaCode || ''}`}
      >
        <form onSubmit={handleUpdateCapa} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Status
            </label>
            <select
              value={editCapaForm.status || 'OPEN'}
              onChange={(e) => setEditCapaForm({ ...editCapaForm, status: e.target.value })}
              className="input"
              style={{ width: '100%' }}
            >
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="VERIFICATION">VERIFICATION</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Immediate Containment Action
            </label>
            <textarea
              className="input"
              rows={2}
              value={editCapaForm.containmentAction || ''}
              onChange={(e) => setEditCapaForm({ ...editCapaForm, containmentAction: e.target.value })}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Root Cause Analysis (5-Whys)
            </label>
            <textarea
              className="input"
              rows={3}
              value={editCapaForm.rootCauseAnalysis || ''}
              onChange={(e) => setEditCapaForm({ ...editCapaForm, rootCauseAnalysis: e.target.value })}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Corrective Action
            </label>
            <textarea
              className="input"
              rows={2}
              value={editCapaForm.correctiveAction || ''}
              onChange={(e) => setEditCapaForm({ ...editCapaForm, correctiveAction: e.target.value })}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Preventive Action
            </label>
            <textarea
              className="input"
              rows={2}
              value={editCapaForm.preventiveAction || ''}
              onChange={(e) => setEditCapaForm({ ...editCapaForm, preventiveAction: e.target.value })}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsEditCapaOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Save CAPA Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
