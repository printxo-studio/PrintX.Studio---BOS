'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Cpu,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Disc,
  Printer,
  ShoppingBag,
  RotateCcw,
  Check,
  Edit2,
  Trash2,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KPICard } from '@/components/ui/KPICard';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, calculateFailureRate } from '@/lib/calculations';
import { DEFECT_CATALOG } from '@/lib/constants';

export default function ProductionBoardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [printers, setPrinters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Complete Modal
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completeForm, setCompleteForm] = useState({
    actualTimeHours: '',
    actualFilamentG: '',
    wasteFilamentG: '0',
  });

  // Failure Modal
  const [isFailModalOpen, setIsFailModalOpen] = useState(false);
  const [failForm, setFailForm] = useState({
    defectType: 'WARPING',
    failureReason: 'Bed corner lifted after 2 hours of printing',
    actualTimeHours: '2.0',
  });

  // Edit Job Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editJobForm, setEditJobForm] = useState<any>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobsRes, prtRes] = await Promise.all([
        fetch('/api/production/jobs'),
        fetch('/api/printers'),
      ]);
      if (jobsRes.ok) setJobs(await jobsRes.json());
      if (prtRes.ok) setPrinters(await prtRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/production/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'START' }),
      });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    try {
      const res = await fetch(`/api/production/jobs/${selectedJob.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'COMPLETE',
          actualTimeHours: completeForm.actualTimeHours,
          actualFilamentG: completeForm.actualFilamentG,
          wasteFilamentG: completeForm.wasteFilamentG,
        }),
      });
      if (res.ok) {
        setIsCompleteModalOpen(false);
        setSelectedJob(null);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFailJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    try {
      const res = await fetch(`/api/production/jobs/${selectedJob.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'FAIL',
          defectType: failForm.defectType,
          failureReason: failForm.failureReason,
          actualTimeHours: failForm.actualTimeHours,
        }),
      });
      if (res.ok) {
        setIsFailModalOpen(false);
        setSelectedJob(null);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEditJob = (job: any) => {
    setEditJobForm({
      id: job.id,
      jobCode: job.jobCode || '',
      printerId: job.printerId || '',
      quantity: job.quantity || 1,
      operator: job.operator || '',
      status: job.status || 'QUEUED',
      notes: job.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/production/jobs/${editJobForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editJobForm),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        loadData();
      } else {
        alert('Failed to update print job');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating print job');
    }
  };

  const handleDeleteJob = async (id: string, jobCode: string) => {
    if (!confirm(`Are you sure you want to delete print job ${jobCode}?`)) return;
    try {
      const res = await fetch(`/api/production/jobs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      } else {
        alert('Failed to delete print job');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting print job');
    }
  };

  // KPIs
  const printingJobs = jobs.filter((j) => j.status === 'PRINTING');
  const queuedJobs = jobs.filter((j) => ['QUEUED', 'SCHEDULED'].includes(j.status));
  const completedJobs = jobs.filter((j) => j.status === 'COMPLETED');
  const failedJobs = jobs.filter((j) => j.status === 'FAILED');
  const failureRate = calculateFailureRate(failedJobs.length, jobs.length);

  const filteredJobs =
    statusFilter === 'ALL'
      ? jobs
      : jobs.filter((j) => j.status === statusFilter);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Cpu size={22} color="var(--accent-red)" /> Production & Print Farm Operations
          </h1>
          <p className="page-subtitle">
            Manufacturing Execution System (MES) &bull; Job Scheduling &bull; Live Farm Tracking &bull; Material Consumption
          </p>
        </div>

        <Link href="/production/new-job" className="btn btn-primary btn-sm">
          <Plus size={15} /> Queue New Print Job
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard
          label="Printing Now"
          value={printingJobs.length}
          subtext="Active farm printing beds"
          icon={Play}
          accentColor="var(--status-purple)"
        />
        <KPICard
          label="Queued / Scheduled"
          value={queuedJobs.length}
          subtext="Ready for printer assignment"
          icon={Clock}
          accentColor="var(--status-info)"
        />
        <KPICard
          label="Completed Prints"
          value={completedJobs.length}
          subtext="Successfully manufactured"
          icon={CheckCircle2}
          accentColor="var(--status-success)"
        />
        <KPICard
          label="Farm Failure Rate"
          value={`${failureRate}%`}
          subtext={`${failedJobs.length} failed prints recorded`}
          icon={AlertTriangle}
          accentColor={failureRate > 5 ? 'var(--status-danger)' : 'var(--status-success)'}
        />
      </div>

      {/* Filter Tabs */}
      <div className="tabs-container">
        {['ALL', 'PRINTING', 'QUEUED', 'COMPLETED', 'FAILED'].map((st) => (
          <button
            key={st}
            className={`tab-btn ${statusFilter === st ? 'active' : ''}`}
            onClick={() => setStatusFilter(st)}
          >
            {st === 'ALL' ? `All Jobs (${jobs.length})` : `${st} (${jobs.filter((j) => j.status === st).length})`}
          </button>
        ))}
      </div>

      {/* JOBS LIST GRID */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredJobs.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            No print jobs in this category.
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                flexWrap: 'wrap',
                gap: 16,
                borderLeft: `4px solid ${
                  job.status === 'PRINTING'
                    ? 'var(--status-purple)'
                    : job.status === 'COMPLETED'
                    ? 'var(--status-success)'
                    : job.status === 'FAILED'
                    ? 'var(--status-danger)'
                    : 'var(--border-default)'
                }`,
              }}
            >
              {/* Job Identification */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 220 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: 14 }}>
                      {job.jobCode}
                    </span>
                    <StatusBadge status={job.status} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginTop: 3 }}>
                    {job.product?.name || job.notes || 'Custom Manufacturing Job'}
                  </div>
                  {job.order && (
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                      Order: <Link href={`/orders/${job.order.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>{job.order.orderNumber}</Link> &bull; {job.order.customer?.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Machine & Material */}
              <div style={{ fontSize: 12.5, lineHeight: 1.6, minWidth: 200 }}>
                <div>
                  <Printer size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--text-muted)' }} />
                  <strong>Machine: </strong>
                  {job.printer?.name || 'Unassigned Farm Printer'}
                </div>
                <div>
                  <Disc size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--text-muted)' }} />
                  <strong>Spool: </strong>
                  {job.filamentSpool ? `${job.filamentSpool.brand} ${job.filamentSpool.material} (${job.filamentSpool.spoolCode})` : 'Standard Spool'}
                </div>
              </div>

              {/* Specs & Metrics */}
              <div style={{ fontSize: 12, lineHeight: 1.6, minWidth: 160 }}>
                <div>
                  <Clock size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--text-muted)' }} />
                  <strong>Est. Time: </strong> {job.estimatedTimeHours}h
                  {job.actualTimeHours ? ` (Actual: ${job.actualTimeHours}h)` : ''}
                </div>
                <div>
                  <strong>Filament: </strong> {job.estimatedFilamentG}g
                  {job.actualFilamentG ? ` (Used: ${job.actualFilamentG}g)` : ''}
                </div>
              </div>

              {/* Operator Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {job.status === 'QUEUED' && (
                  <button
                    onClick={() => handleStartJob(job.id)}
                    className="btn btn-primary btn-sm"
                  >
                    <Play size={13} /> Start Print
                  </button>
                )}

                {job.status === 'PRINTING' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setCompleteForm({
                          actualTimeHours: String(job.estimatedTimeHours || 2),
                          actualFilamentG: String(job.estimatedFilamentG || 50),
                          wasteFilamentG: '0',
                        });
                        setIsCompleteModalOpen(true);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--status-success)', borderColor: 'var(--status-success-border)' }}
                    >
                      <Check size={13} /> Mark Completed
                    </button>
                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setIsFailModalOpen(true);
                      }}
                      className="btn btn-danger btn-sm"
                    >
                      <AlertTriangle size={13} /> Fail Job
                    </button>
                  </>
                )}

                {job.status === 'COMPLETED' && (
                  <span className="badge badge-success" style={{ fontSize: 11 }}>
                    ✓ Manufactured ({job.actualTimeHours}h &bull; {job.actualFilamentG}g)
                  </span>
                )}

                {job.status === 'FAILED' && (
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-danger" style={{ fontSize: 11 }}>
                      Failed: {job.failureReason}
                    </span>
                  </div>
                )}

                <button
                  title="Edit Job"
                  onClick={() => handleOpenEditJob(job)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '4px 6px', color: 'var(--text-secondary)' }}
                >
                  <Edit2 size={13} />
                </button>
                <button
                  title="Delete Job"
                  onClick={() => handleDeleteJob(job.id, job.jobCode)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '4px 6px', color: 'var(--accent-red)' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* COMPLETE PRINT JOB MODAL */}
      {selectedJob && (
        <Modal
          isOpen={isCompleteModalOpen}
          onClose={() => setIsCompleteModalOpen(false)}
          title={`Complete Print Job: ${selectedJob.jobCode}`}
        >
          <form onSubmit={handleCompleteJob}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
              Record actual print metrics. Filament weight will be automatically deducted from spool{' '}
              <strong>{selectedJob.filamentSpool?.spoolCode || 'assigned spool'}</strong>, and printer runtime stats will be incremented.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Actual Print Time (Hours) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  className="form-control"
                  value={completeForm.actualTimeHours}
                  onChange={(e) => setCompleteForm({ ...completeForm, actualTimeHours: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Actual Filament Used (Grams) *</label>
                <input
                  type="number"
                  required
                  className="form-control"
                  value={completeForm.actualFilamentG}
                  onChange={(e) => setCompleteForm({ ...completeForm, actualFilamentG: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Purge / Support Waste (Grams)</label>
              <input
                type="number"
                className="form-control"
                value={completeForm.wasteFilamentG}
                onChange={(e) => setCompleteForm({ ...completeForm, wasteFilamentG: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsCompleteModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Confirm & Auto-Deduct Filament →
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* REPORT FAILURE MODAL */}
      {selectedJob && (
        <Modal
          isOpen={isFailModalOpen}
          onClose={() => setIsFailModalOpen(false)}
          title={`Report Print Failure: ${selectedJob.jobCode}`}
        >
          <form onSubmit={handleFailJob}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
              Per Section 21 & 22: Failures are logged for Pareto defect analytics and quality traceability.
            </p>

            <div className="form-group">
              <label className="form-label">Defect Classification *</label>
              <select
                className="form-control"
                value={failForm.defectType}
                onChange={(e) => setFailForm({ ...failForm, defectType: e.target.value })}
              >
                {DEFECT_CATALOG.map((def) => (
                  <option key={def.id} value={def.id}>
                    {def.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Root Cause / Shop Floor Observation *</label>
              <textarea
                required
                className="form-control"
                rows={2}
                value={failForm.failureReason}
                onChange={(e) => setFailForm({ ...failForm, failureReason: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Runtime Before Abort (Hours)</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                value={failForm.actualTimeHours}
                onChange={(e) => setFailForm({ ...failForm, actualTimeHours: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsFailModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-danger">
                Log Defect & Terminate Job
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* EDIT PRINT JOB MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Job: ${editJobForm.jobCode || ''}`}
      >
        <form onSubmit={handleUpdateJob} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Assigned Printer
              </label>
              <select
                value={editJobForm.printerId || ''}
                onChange={(e) => setEditJobForm({ ...editJobForm, printerId: e.target.value })}
                className="form-control"
              >
                <option value="">Unassigned</option>
                {printers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.model})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Status
              </label>
              <select
                value={editJobForm.status || 'QUEUED'}
                onChange={(e) => setEditJobForm({ ...editJobForm, status: e.target.value })}
                className="form-control"
              >
                <option value="QUEUED">QUEUED</option>
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="PRINTING">PRINTING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="FAILED">FAILED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Quantity
              </label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={editJobForm.quantity || 1}
                onChange={(e) => setEditJobForm({ ...editJobForm, quantity: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Operator
              </label>
              <input
                type="text"
                className="form-control"
                value={editJobForm.operator || ''}
                onChange={(e) => setEditJobForm({ ...editJobForm, operator: e.target.value })}
                placeholder="Operator name"
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Job Notes / Instructions
            </label>
            <textarea
              className="form-control"
              rows={2}
              value={editJobForm.notes || ''}
              onChange={(e) => setEditJobForm({ ...editJobForm, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
