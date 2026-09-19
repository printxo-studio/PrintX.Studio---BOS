'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FlaskConical,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Sliders,
  Gauge,
  Tag,
  Check,
  X,
  RotateCcw,
  Boxes,
  FileCheck,
  Edit2,
  Trash2,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KPICard } from '@/components/ui/KPICard';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/calculations';

const RND_STATUSES = [
  { id: 'ALL', name: 'All Stages' },
  { id: 'IDEA', name: 'Idea / Proposed' },
  { id: 'PLANNING', name: 'Planning & Protocol' },
  { id: 'EXPERIMENTING', name: 'Active Experimentation' },
  { id: 'TESTING', name: 'Mechanical Testing' },
  { id: 'ANALYZING', name: 'Data Analysis' },
  { id: 'VALIDATED', name: 'Validated (Successful)' },
  { id: 'IMPLEMENTED', name: 'Implemented in Production' },
  { id: 'REJECTED', name: 'Hypothesis Rejected' },
];

export default function RndPage() {
  const router = useRouter();
  const [experiments, setExperiments] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedExp, setSelectedExp] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);

  // Forms
  const [newExpForm, setNewExpForm] = useState({
    title: 'Carbon Fiber Annealing & Interlayer Shear Strength Optimization',
    objective: 'Increase Z-axis layer tensile strength from 28 MPa to >45 MPa using high-temperature convection annealing.',
    hypothesis: 'Baking printed PA-CF components at 130°C for 4 hours will relax internal residual stresses and induce secondary polymer crystallization.',
    productId: '',
    material: 'PA-CF',
    variablesTested: 'Annealing temperature (110°C, 130°C, 150°C) and ramp-down cooling rate.',
    controlValues: 'Unannealed as-printed tensile bar: 28.4 MPa yield strength.',
    testValues: '130°C for 4h followed by 0.5°C/min slow chamber cooling.',
    measurements: 'Measured yield tensile strength: 49.2 MPa (+73% increase). Dimensional shrinkage: 0.4% in X/Y, 0.2% in Z.',
    resultsSummary: 'Exceeded target strength. Zero visual warping or surface blister formation.',
    failureOccurred: false,
    cost: '3450',
    conclusion: 'Protocol validated. Mandatory for all aerospace drone components before delivery.',
    recommendedSettings: 'Oven: 130°C | Dwell: 240 mins | Cooling: Chamber slow cool to <50°C',
    status: 'VALIDATED',
  });

  const [editExpForm, setEditExpForm] = useState({
    id: '',
    title: '',
    objective: '',
    hypothesis: '',
    productId: '',
    material: 'PA-CF',
    variablesTested: '',
    measurements: '',
    resultsSummary: '',
    cost: '0',
    conclusion: '',
    recommendedSettings: '',
    status: 'PLANNING',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [expRes, prodRes] = await Promise.all([
        fetch(`/api/rnd?status=${statusFilter}`),
        fetch('/api/products'),
      ]);

      if (expRes.ok) setExperiments(await expRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
    } catch (err) {
      console.error('Failed to load R&D data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleCreateExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/rnd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpForm),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/rnd/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEdit = (exp: any) => {
    setEditExpForm({
      id: exp.id,
      title: exp.title || '',
      objective: exp.objective || '',
      hypothesis: exp.hypothesis || '',
      productId: exp.productId || '',
      material: exp.material || 'PA-CF',
      variablesTested: exp.variablesTested || '',
      measurements: exp.measurements || '',
      resultsSummary: exp.resultsSummary || '',
      cost: String(exp.cost ?? 0),
      conclusion: exp.conclusion || '',
      recommendedSettings: exp.recommendedSettings || '',
      status: exp.status || 'PLANNING',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/rnd/${editExpForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editExpForm),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update experiment');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating experiment');
    }
  };

  const handleDeleteExperiment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this R&D experiment?')) return;
    try {
      const res = await fetch(`/api/rnd/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete experiment');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting experiment');
    }
  };

  // KPIs
  const totalExperiments = experiments.length;
  const activeExps = experiments.filter((e) =>
    ['PLANNING', 'EXPERIMENTING', 'TESTING', 'ANALYZING'].includes(e.status)
  ).length;
  const validatedExps = experiments.filter((e) =>
    ['VALIDATED', 'IMPLEMENTED'].includes(e.status)
  ).length;
  const totalRndCost = experiments.reduce((sum, e) => sum + (e.cost || 0), 0);

  // Filtered by Search
  const filteredExperiments = experiments.filter((e) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      e.experimentCode.toLowerCase().includes(q) ||
      e.title.toLowerCase().includes(q) ||
      e.objective.toLowerCase().includes(q) ||
      e.material.toLowerCase().includes(q) ||
      (e.product && e.product.name.toLowerCase().includes(q));
    return matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
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
              Precision Engineering
            </span>
            <span style={{ color: 'var(--text-tertiary)' }}>•</span>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              Section 24: R&D Workspace & Process Innovation
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
            R&D / Labs Experiments
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Scientific method experiments, hypothesis validation, tensile strength tests, and conversion to production profiles.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setIsAddModalOpen(true)}
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
            New Experiment
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
          label="Total Experiments"
          value={totalExperiments}
          subtext="Documented lab trials"
          icon={FlaskConical}
        />
        <KPICard
          label="Active Testing"
          value={activeExps}
          subtext="Currently running in lab"
          icon={Sparkles}
        />
        <KPICard
          label="Validated Innovations"
          value={validatedExps}
          subtext="Ready for production rollout"
          icon={CheckCircle2}
        />
        <KPICard
          label="Total R&D Investment"
          value={formatCurrency(totalRndCost)}
          subtext="Material & testing expenditures"
          icon={TrendingUp}
        />
      </div>

      {/* Section 24 Architecture Rule Alert */}
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
        <FileCheck size={20} color="var(--accent-red)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Section 24 Continuous Improvement Pipeline:</strong> When an
          experiment reaches <strong style={{ color: 'var(--accent-green, #10b981)' }}>VALIDATED</strong>, promote it
          directly into a <strong>New Calibration Setting</strong>, a <strong>Production Print Profile</strong>, or a{' '}
          <strong>Product Version Revision</strong> with automated change log traceability.
        </div>
      </div>

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
              placeholder="Search hypothesis, objective, material..."
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
              {RND_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          Showing {filteredExperiments.length} experiments
        </div>
      </div>

      {/* Experiments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            Loading experimental registry...
          </div>
        ) : filteredExperiments.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            No experiments found matching filters.
          </div>
        ) : (
          filteredExperiments.map((exp) => {
            const isValidated = exp.status === 'VALIDATED' || exp.status === 'IMPLEMENTED';

            return (
              <div
                key={exp.id}
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
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: 12,
                          color: 'var(--accent-red)',
                        }}
                      >
                        {exp.experimentCode}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 4,
                          backgroundColor: 'var(--bg-surface-elevated)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {exp.material}
                      </span>
                      {exp.product && (
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          Product: {exp.product.name}
                        </span>
                      )}
                    </div>
                    <h3
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        marginTop: 4,
                      }}
                    >
                      {exp.title}
                    </h3>
                  </div>

                  <StatusBadge
                    status={exp.status}
                    variant={
                      exp.status === 'VALIDATED' || exp.status === 'IMPLEMENTED'
                        ? 'success'
                        : exp.status === 'REJECTED'
                        ? 'danger'
                        : 'warning'
                    }
                  />
                </div>

                {/* Hypothesis & Objective */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12,
                    backgroundColor: 'var(--bg-canvas)',
                    padding: 14,
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 13,
                  }}
                >
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
                      Objective
                    </span>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
                      {exp.objective}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
                      Hypothesis
                    </span>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
                      {exp.hypothesis || 'Standard process optimization test.'}
                    </p>
                  </div>
                </div>

                {/* Measurements & Conclusion */}
                {exp.measurements && (
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Experimental Measurements: </strong>
                    {exp.measurements}
                  </div>
                )}

                {exp.recommendedSettings && (
                  <div
                    style={{
                      fontSize: 12,
                      padding: '8px 12px',
                      borderRadius: 4,
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      color: 'var(--accent-green, #10b981)',
                      fontWeight: 600,
                    }}
                  >
                    Recommended Protocol: {exp.recommendedSettings}
                  </div>
                )}

                {/* Action Bar */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 10,
                    borderTop: '1px solid var(--border-subtle)',
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    Cost incurred: <strong>{formatCurrency(exp.cost || 0)}</strong>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    {isValidated && (
                      <>
                        <Link
                          href={`/calibrations`}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 4,
                            color: 'var(--accent-red)',
                            fontSize: 12,
                            fontWeight: 600,
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <Gauge size={13} />
                          → Promote to Calibration
                        </Link>

                        <Link
                          href={`/print-profiles`}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: 'rgba(16, 185, 129, 0.12)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: 4,
                            color: 'var(--accent-green, #10b981)',
                            fontSize: 12,
                            fontWeight: 600,
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <Sliders size={13} />
                          → Promote to Print Profile
                        </Link>
                      </>
                    )}

                    <select
                      value={exp.status}
                      onChange={(e) => handleUpdateStatus(exp.id, e.target.value)}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: 'var(--bg-canvas)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 4,
                        fontSize: 12,
                        color: 'var(--text-primary)',
                        outline: 'none',
                      }}
                    >
                      {RND_STATUSES.filter((s) => s.id !== 'ALL').map((s) => (
                        <option key={s.id} value={s.id}>
                          Set: {s.name}
                        </option>
                      ))}
                    </select>

                    <button
                      title="Edit Experiment"
                      onClick={() => handleOpenEdit(exp)}
                      style={{
                        padding: '6px 9px',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 4,
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Edit2 size={13} />
                    </button>

                    <button
                      title="Delete Experiment"
                      onClick={() => handleDeleteExperiment(exp.id)}
                      style={{
                        padding: '6px 9px',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 4,
                        color: 'var(--accent-red)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* NEW EXPERIMENT MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New R&D Lab Experiment"
      >
        <form onSubmit={handleCreateExperiment} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Experiment Title
            </label>
            <input
              type="text"
              required
              value={newExpForm.title}
              onChange={(e) => setNewExpForm({ ...newExpForm, title: e.target.value })}
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
              Research Objective
            </label>
            <textarea
              rows={2}
              required
              value={newExpForm.objective}
              onChange={(e) => setNewExpForm({ ...newExpForm, objective: e.target.value })}
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
              Hypothesis (Scientific Assertion)
            </label>
            <textarea
              rows={2}
              value={newExpForm.hypothesis}
              onChange={(e) => setNewExpForm({ ...newExpForm, hypothesis: e.target.value })}
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
                Material
              </label>
              <input
                type="text"
                required
                value={newExpForm.material}
                onChange={(e) => setNewExpForm({ ...newExpForm, material: e.target.value })}
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
                Estimated Lab Cost (₹)
              </label>
              <input
                type="number"
                value={newExpForm.cost}
                onChange={(e) => setNewExpForm({ ...newExpForm, cost: e.target.value })}
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
                Control Baseline Values
              </label>
              <input
                type="text"
                placeholder="e.g. Standard 215°C print"
                value={newExpForm.controlValues}
                onChange={(e) => setNewExpForm({ ...newExpForm, controlValues: e.target.value })}
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
                Test Variation Values
              </label>
              <input
                type="text"
                placeholder="e.g. 235°C with 40% fan"
                value={newExpForm.testValues}
                onChange={(e) => setNewExpForm({ ...newExpForm, testValues: e.target.value })}
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
              Initial Stage
            </label>
            <select
              value={newExpForm.status}
              onChange={(e) => setNewExpForm({ ...newExpForm, status: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                color: 'var(--text-primary)',
              }}
            >
              <option value="IDEA">IDEA</option>
              <option value="PLANNING">PLANNING</option>
              <option value="EXPERIMENTING">EXPERIMENTING</option>
              <option value="VALIDATED">VALIDATED</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
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
              Save Experiment
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT EXPERIMENT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit R&D Experiment"
      >
        <form onSubmit={handleUpdateExperiment} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Experiment Title
            </label>
            <input
              type="text"
              required
              value={editExpForm.title}
              onChange={(e) => setEditExpForm({ ...editExpForm, title: e.target.value })}
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
                Material
              </label>
              <input
                type="text"
                value={editExpForm.material}
                onChange={(e) => setEditExpForm({ ...editExpForm, material: e.target.value })}
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
                Stage / Status
              </label>
              <select
                value={editExpForm.status}
                onChange={(e) => setEditExpForm({ ...editExpForm, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 4,
                  color: 'var(--text-primary)',
                }}
              >
                {RND_STATUSES.filter((s) => s.id !== 'ALL').map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Objective
            </label>
            <textarea
              rows={2}
              value={editExpForm.objective}
              onChange={(e) => setEditExpForm({ ...editExpForm, objective: e.target.value })}
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
              Hypothesis
            </label>
            <textarea
              rows={2}
              value={editExpForm.hypothesis}
              onChange={(e) => setEditExpForm({ ...editExpForm, hypothesis: e.target.value })}
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
                Variables Tested
              </label>
              <input
                type="text"
                value={editExpForm.variablesTested}
                onChange={(e) => setEditExpForm({ ...editExpForm, variablesTested: e.target.value })}
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
                Cost Incurred (₹)
              </label>
              <input
                type="number"
                value={editExpForm.cost}
                onChange={(e) => setEditExpForm({ ...editExpForm, cost: e.target.value })}
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
              Measurements & Data
            </label>
            <textarea
              rows={2}
              value={editExpForm.measurements}
              onChange={(e) => setEditExpForm({ ...editExpForm, measurements: e.target.value })}
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
              Conclusion & Recommendations
            </label>
            <textarea
              rows={2}
              value={editExpForm.conclusion}
              onChange={(e) => setEditExpForm({ ...editExpForm, conclusion: e.target.value })}
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
              Recommended Production Settings
            </label>
            <input
              type="text"
              value={editExpForm.recommendedSettings}
              onChange={(e) => setEditExpForm({ ...editExpForm, recommendedSettings: e.target.value })}
              placeholder="e.g. Bed 110°C, Nozzle 280°C, Chamber 60°C"
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                handleDeleteExperiment(editExpForm.id);
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
              Delete Experiment
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
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
    </div>
  );
}
