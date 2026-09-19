'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Printer,
  Plus,
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Flame,
  Settings2,
  Layers,
  Edit2,
  Trash2,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KPICard } from '@/components/ui/KPICard';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, calculatePrinterUtilization } from '@/lib/calculations';

export default function PrinterFarmPage() {
  const router = useRouter();
  const [printers, setPrinters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddPrinterOpen, setIsAddPrinterOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [isEditPrinterOpen, setIsEditPrinterOpen] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<any | null>(null);
  const [editPrinterForm, setEditPrinterForm] = useState<any>({});

  // Forms
  const [newPrinterForm, setNewPrinterForm] = useState({
    name: '',
    manufacturer: 'Bambu Lab',
    model: 'X1-Carbon',
    serialNumber: '',
    location: 'Farm Rack 1',
    nozzleSize: '0.4',
    nozzleType: 'Hardened Steel',
    purchaseCost: '95000',
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    maintenanceType: 'NOZZLE_CHANGE',
    description: 'Replaced 0.4mm nozzle with new hardened steel nozzle',
    cost: '1200',
    performedBy: 'PrintXO Operator',
  });

  const loadPrinters = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/printers');
      if (res.ok) setPrinters(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrinters();
  }, []);

  const handleCreatePrinter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/printers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrinterForm),
      });
      if (res.ok) {
        setIsAddPrinterOpen(false);
        loadPrinters();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrinter) return;
    try {
      const res = await fetch(`/api/printers/${selectedPrinter.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_MAINTENANCE',
          ...maintenanceForm,
        }),
      });
      if (res.ok) {
        setIsMaintenanceOpen(false);
        loadPrinters();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (printerId: string, status: string) => {
    try {
      await fetch(`/api/printers/${printerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      loadPrinters();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEditPrinter = (printer: any) => {
    setEditPrinterForm({
      id: printer.id,
      name: printer.name || '',
      model: printer.model || '',
      serialNumber: printer.serialNumber || '',
      location: printer.location || '',
      status: printer.status || 'AVAILABLE',
      nozzleSize: printer.nozzleSize || 0.4,
      nozzleType: printer.nozzleType || 'Hardened Steel',
      hourlyCostRate: printer.hourlyCostRate || 65,
      ipAddress: printer.ipAddress || '',
      notes: printer.notes || '',
    });
    setIsEditPrinterOpen(true);
  };

  const handleUpdatePrinter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/printers/${editPrinterForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editPrinterForm),
      });
      if (res.ok) {
        setIsEditPrinterOpen(false);
        loadPrinters();
      } else {
        alert('Failed to update printer');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating printer');
    }
  };

  const handleDeletePrinter = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete printer "${name}"? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/printers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadPrinters();
      } else {
        alert('Failed to delete printer. It may have associated print jobs or maintenance history.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting printer');
    }
  };

  // Metrics
  const activePrinters = printers.filter((p) => p.status !== 'OFFLINE' && p.status !== 'ERROR');
  const printingCount = printers.filter((p) => p.status === 'PRINTING').length;
  const totalFarmHours = printers.reduce((sum, p) => sum + (p.totalPrintHours || 0), 0);
  const totalMaintenanceCost = printers.reduce((sum, p) => sum + (p.maintenanceCost || 0), 0);
  const totalJobsCompleted = printers.reduce((sum, p) => sum + (p.successfulJobs || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Printer size={22} color="var(--accent-red)" /> Printer Farm Command
          </h1>
          <p className="page-subtitle">
            Fleet Management &bull; Real-time Machine Status &bull; Runtime Telemetry &bull; Preventive Maintenance
          </p>
        </div>

        <button
          onClick={() => setIsAddPrinterOpen(true)}
          className="btn btn-primary btn-sm"
        >
          <Plus size={15} /> Add Machine to Farm
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard
          label="Farm Machine Fleet"
          value={`${activePrinters.length} / ${printers.length}`}
          subtext={`${printingCount} machines printing now`}
          icon={Printer}
          accentColor="var(--status-success)"
        />
        <KPICard
          label="Farm Runtime Logged"
          value={`${totalFarmHours.toFixed(1)} hrs`}
          subtext="Cumulative production runtime"
          icon={Clock}
          accentColor="var(--status-purple)"
        />
        <KPICard
          label="Successful Farm Jobs"
          value={totalJobsCompleted}
          subtext="Total completed build plates"
          icon={CheckCircle2}
          accentColor="var(--status-info)"
        />
        <KPICard
          label="Maintenance Expense"
          value={formatCurrency(totalMaintenanceCost)}
          subtext="Nozzles, belts & hotends"
          icon={Wrench}
        />
      </div>

      {/* PRINTER MACHINE CARDS GRID (Section 15) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 18 }}>
        {printers.map((prt) => {
          const currentJob = prt.printJobs && prt.printJobs[0];
          const failRate = prt.totalJobs > 0 ? Math.round((prt.failedJobs / prt.totalJobs) * 100) : 0;

          return (
            <div
              key={prt.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 14,
                borderTop: `3px solid ${
                  prt.status === 'PRINTING'
                    ? 'var(--status-purple)'
                    : prt.status === 'AVAILABLE'
                    ? 'var(--status-success)'
                    : prt.status === 'MAINTENANCE'
                    ? 'var(--status-warning)'
                    : 'var(--border-default)'
                }`,
              }}
            >
              {/* Card Header */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: 13, color: 'var(--accent-red)' }}>
                    {prt.printerCode}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <select
                      value={prt.status}
                      onChange={(e) => handleStatusChange(prt.id, e.target.value)}
                      style={{
                        backgroundColor: 'var(--bg-surface-elevated)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 4,
                        padding: '2px 6px',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="PRINTING">Printing</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="CALIBRATION">Calibration</option>
                      <option value="OFFLINE">Offline</option>
                    </select>
                  </div>
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {prt.name}
                </h3>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {prt.manufacturer} {prt.model} &bull; {prt.location || 'Rack 1'}
                </div>
              </div>

              {/* Active Print Job Box */}
              <div
                style={{
                  padding: 12,
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: 12,
                }}
              >
                {prt.status === 'PRINTING' && currentJob ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: 'var(--status-purple)' }}>● Printing Job:</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{currentJob.jobCode}</span>
                    </div>
                    <div style={{ fontWeight: 600 }}>{currentJob.product?.name || 'Custom Part'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      Spool: {currentJob.filamentSpool?.brand} {currentJob.filamentSpool?.material} ({currentJob.filamentSpool?.color})
                    </div>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--status-success)' }} />
                    Idle / Bed Cleared & Ready for Next Job
                  </div>
                )}
              </div>

              {/* Machine Specs & Stats */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8,
                  fontSize: 11.5,
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  padding: '8px 10px',
                  borderRadius: 4,
                }}
              >
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>NOZZLE</div>
                  <div style={{ fontWeight: 700 }}>{prt.nozzleSize}mm</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>RUNTIME</div>
                  <div style={{ fontWeight: 700 }}>{prt.totalPrintHours}h</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>FAIL RATE</div>
                  <div style={{ fontWeight: 700, color: failRate > 5 ? 'var(--status-danger)' : 'inherit' }}>
                    {failRate}%
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
                <button
                  onClick={() => {
                    setSelectedPrinter(prt);
                    setIsMaintenanceOpen(true);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 11, padding: '3px 8px' }}
                >
                  <Wrench size={12} /> Log Service
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={() => handleOpenEditPrinter(prt)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: 11, padding: '3px 7px', color: 'var(--text-secondary)' }}
                    title="Edit Printer"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => handleDeletePrinter(prt.id, prt.name)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: 11, padding: '3px 7px', color: 'var(--accent-red)' }}
                    title="Delete Printer"
                  >
                    <Trash2 size={12} />
                  </button>
                  <button
                    onClick={() => router.push(`/production/new-job?printerId=${prt.id}`)}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: 11, padding: '3px 8px' }}
                  >
                    <Plus size={12} /> Dispatch
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD PRINTER MODAL */}
      <Modal
        isOpen={isAddPrinterOpen}
        onClose={() => setIsAddPrinterOpen(false)}
        title="Register New Farm Printer"
      >
        <form onSubmit={handleCreatePrinter}>
          <div className="form-group">
            <label className="form-label">Printer Name / Identifier *</label>
            <input
              type="text"
              required
              className="form-control"
              value={newPrinterForm.name}
              onChange={(e) => setNewPrinterForm({ ...newPrinterForm, name: e.target.value })}
              placeholder="e.g. Bambu Lab P1S #3"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Manufacturer</label>
              <input
                type="text"
                className="form-control"
                value={newPrinterForm.manufacturer}
                onChange={(e) => setNewPrinterForm({ ...newPrinterForm, manufacturer: e.target.value })}
                placeholder="Bambu Lab / Prusa / Creality / Voron"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Model</label>
              <input
                type="text"
                className="form-control"
                value={newPrinterForm.model}
                onChange={(e) => setNewPrinterForm({ ...newPrinterForm, model: e.target.value })}
                placeholder="X1-Carbon / MK4 / K1 Max"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Farm Location</label>
              <input
                type="text"
                className="form-control"
                value={newPrinterForm.location}
                onChange={(e) => setNewPrinterForm({ ...newPrinterForm, location: e.target.value })}
                placeholder="Farm Rack 1 - Middle"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nozzle Size (mm)</label>
              <input
                type="number"
                step="0.2"
                className="form-control"
                value={newPrinterForm.nozzleSize}
                onChange={(e) => setNewPrinterForm({ ...newPrinterForm, nozzleSize: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddPrinterOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Machine →
            </button>
          </div>
        </form>
      </Modal>

      {/* LOG MAINTENANCE MODAL (Section 15) */}
      {selectedPrinter && (
        <Modal
          isOpen={isMaintenanceOpen}
          onClose={() => setIsMaintenanceOpen(false)}
          title={`Log Maintenance: ${selectedPrinter.name}`}
        >
          <form onSubmit={handleAddMaintenance}>
            <div className="form-group">
              <label className="form-label">Maintenance Type *</label>
              <select
                className="form-control"
                value={maintenanceForm.maintenanceType}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, maintenanceType: e.target.value })}
              >
                <option value="NOZZLE_CHANGE">Nozzle Replacement</option>
                <option value="BELT_TENSION">Belt Tensioning & Alignment</option>
                <option value="ROD_LUBRICATION">Linear Rod & Lead Screw Lubrication</option>
                <option value="HOTEND_REPLACE">Complete Hotend Replacement</option>
                <option value="EXTRUDER_CLEAN">Extruder Gear Cleaning</option>
                <option value="ROUTINE">Routine General Calibration & Service</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Service Description *</label>
              <textarea
                required
                className="form-control"
                rows={2}
                value={maintenanceForm.description}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Part / Service Cost (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={maintenanceForm.cost}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Technician / Operator</label>
                <input
                  type="text"
                  className="form-control"
                  value={maintenanceForm.performedBy}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, performedBy: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsMaintenanceOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Record Maintenance Log
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* EDIT PRINTER MODAL */}
      <Modal
        isOpen={isEditPrinterOpen}
        onClose={() => setIsEditPrinterOpen(false)}
        title="Edit Printer Hardware & Settings"
      >
        <form onSubmit={handleUpdatePrinter}>
          <div className="form-group">
            <label className="form-label">Printer Name / Identifier *</label>
            <input
              type="text"
              required
              className="form-control"
              value={editPrinterForm.name || ''}
              onChange={(e) => setEditPrinterForm({ ...editPrinterForm, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Model</label>
              <input
                type="text"
                className="form-control"
                value={editPrinterForm.model || ''}
                onChange={(e) => setEditPrinterForm({ ...editPrinterForm, model: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Serial Number</label>
              <input
                type="text"
                className="form-control"
                value={editPrinterForm.serialNumber || ''}
                onChange={(e) => setEditPrinterForm({ ...editPrinterForm, serialNumber: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Location / Rack</label>
              <input
                type="text"
                className="form-control"
                value={editPrinterForm.location || ''}
                onChange={(e) => setEditPrinterForm({ ...editPrinterForm, location: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-control"
                value={editPrinterForm.status || 'AVAILABLE'}
                onChange={(e) => setEditPrinterForm({ ...editPrinterForm, status: e.target.value })}
              >
                <option value="AVAILABLE">Available</option>
                <option value="PRINTING">Printing</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="CALIBRATION">Calibration</option>
                <option value="OFFLINE">Offline</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Nozzle Size (mm)</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                value={editPrinterForm.nozzleSize || ''}
                onChange={(e) => setEditPrinterForm({ ...editPrinterForm, nozzleSize: parseFloat(e.target.value) || 0.4 })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nozzle Type</label>
              <input
                type="text"
                className="form-control"
                value={editPrinterForm.nozzleType || ''}
                onChange={(e) => setEditPrinterForm({ ...editPrinterForm, nozzleType: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hourly Rate (₹/h)</label>
              <input
                type="number"
                step="1"
                className="form-control"
                value={editPrinterForm.hourlyCostRate || ''}
                onChange={(e) => setEditPrinterForm({ ...editPrinterForm, hourlyCostRate: parseFloat(e.target.value) || 65 })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">IP Address / Webhook</label>
            <input
              type="text"
              className="form-control"
              value={editPrinterForm.ipAddress || ''}
              onChange={(e) => setEditPrinterForm({ ...editPrinterForm, ipAddress: e.target.value })}
              placeholder="e.g. 192.168.1.55"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="form-control"
              rows={2}
              value={editPrinterForm.notes || ''}
              onChange={(e) => setEditPrinterForm({ ...editPrinterForm, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditPrinterOpen(false)}
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
