'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  Printer,
  Cpu,
  AlertTriangle,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  Flame,
  ArrowRight,
  RefreshCw,
  Sliders,
  ShieldAlert,
  Package,
  FileText,
  Activity,
  PlusCircle,
  Truck,
  Disc,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency } from '@/lib/calculations';

export default function CommandCenterPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchCommandState = async () => {
    try {
      const res = await fetch('/api/command-center');
      const json = await res.json();
      if (json.success) {
        setData(json);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('Error fetching command center telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandState();
  }, []);

  // 15-second telemetry polling
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchCommandState();
    }, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (loading && !data) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw className="animate-spin" size={28} style={{ margin: '0 auto 12px auto' }} />
        <div>Connecting to Print Farm Telemetry...</div>
      </div>
    );
  }

  const fleetStatus = data?.fleetStatus || { total: 0, printing: 0, available: 0, maintenance: 0, error: 0 };
  const todaysPulse = data?.todaysPulse || {};
  const printers = data?.printers || [];
  const activeJobs = data?.activeJobs || [];
  const lowSpools = data?.lowSpools || [];
  const urgentTasks = data?.urgentTasks || [];
  const criticalCapas = data?.criticalCapas || [];

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header & Cockpit Telemetry Strip */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px var(--accent-red-glow)',
            }}
          >
            <Zap size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                Executive Command Center
              </h1>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--status-success)',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  padding: '2px 8px',
                  borderRadius: 20,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: 'var(--status-success)',
                    boxShadow: '0 0 8px var(--status-success)',
                  }}
                />
                LIVE WAR ROOM
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Real-time Fleet Telemetry, Power Consumption, Production In-Flight & Quality Alert Radar
            </p>
          </div>
        </div>

        {/* Live Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Updated: {lastRefreshed.toLocaleTimeString()}
          </div>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`btn btn-sm ${autoRefresh ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Activity size={13} color={autoRefresh ? 'var(--status-success)' : 'var(--text-muted)'} />
            {autoRefresh ? 'Auto-Polling ON (15s)' : 'Polling Paused'}
          </button>

          <button
            onClick={fetchCommandState}
            className="btn btn-ghost btn-sm"
            style={{ padding: 6 }}
            title="Force Telemetry Sync"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Telemetry Dashboard Ribbon */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
          marginBottom: 24,
        }}
      >
        <div
          className="card"
          style={{
            padding: '16px 18px',
            backgroundColor: 'var(--bg-surface)',
            borderLeft: '3px solid var(--accent-red)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Active Farm Fleet
            </span>
            <Printer size={16} color="var(--accent-red)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>
            {fleetStatus.printing} <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>/ {fleetStatus.total} Machines</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--status-success)', marginTop: 4 }}>
            {fleetStatus.available} Available &bull; {fleetStatus.maintenance} Maint / Cal
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '16px 18px',
            backgroundColor: 'var(--bg-surface)',
            borderLeft: '3px solid #3b82f6',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Instant Electrical Draw
            </span>
            <Flame size={16} color="#3b82f6" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>
            {data?.activeWatts || 0} <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>Watts</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Est. Cost: <strong>₹{data?.hourlyElectricityCost || 0} / hr</strong> (@ ₹9.5/kWh)
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '16px 18px',
            backgroundColor: 'var(--bg-surface)',
            borderLeft: '3px solid var(--status-success)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Today's Production
            </span>
            <CheckCircle2 size={16} color="var(--status-success)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>
            {todaysPulse.jobsCompleted || 0} <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>Jobs Done</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Purge/Scrap: <strong>{todaysPulse.wasteG || 0}g</strong>
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '16px 18px',
            backgroundColor: 'var(--bg-surface)',
            borderLeft: '3px solid #f59e0b',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Urgent Attention
            </span>
            <AlertTriangle size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4, color: '#f59e0b' }}>
            {urgentTasks.length + criticalCapas.length + lowSpools.length}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            {lowSpools.length} Low spools &bull; {criticalCapas.length} Active CAPAs
          </div>
        </div>
      </div>

      {/* Printer Farm Grid - Live Machine Cards */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Farm Machine Floor (Telemetry Matrix)</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Real-time nozzle temperatures, current print jobs, and progress telemetry
            </p>
          </div>
          <Link href="/production/new-job" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <PlusCircle size={14} />
            Dispatch New Job
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 16,
          }}
        >
          {printers.map((prt: any) => {
            const isPrinting = prt.status === 'PRINTING';
            const isAvailable = prt.status === 'AVAILABLE';
            const isMaintenance = prt.status === 'MAINTENANCE' || prt.status === 'CALIBRATION';

            return (
              <div
                key={prt.id}
                className="card"
                style={{
                  padding: 18,
                  backgroundColor: 'var(--bg-surface)',
                  border: isPrinting
                    ? '1px solid rgba(239, 68, 68, 0.4)'
                    : '1px solid var(--border-subtle)',
                  boxShadow: isPrinting ? '0 0 15px rgba(239, 68, 68, 0.08)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>
                          {prt.name}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {prt.code} &bull; {prt.model} &bull; {prt.location}
                      </div>
                    </div>
                    <StatusBadge status={prt.status} />
                  </div>

                  {/* Machine Telemetry Details */}
                  <div
                    style={{
                      display: 'flex',
                      gap: 12,
                      fontSize: 11,
                      color: 'var(--text-secondary)',
                      padding: '8px 10px',
                      backgroundColor: 'var(--bg-canvas)',
                      borderRadius: 'var(--radius-xs)',
                      marginBottom: 12,
                    }}
                  >
                    <div>Nozzle: <strong>{prt.nozzleSize}mm ({prt.nozzleType})</strong></div>
                    <div>Bed: <strong>PEI Textured</strong></div>
                  </div>

                  {/* Active Job Details if Printing */}
                  {isPrinting && prt.activeJob ? (
                    <div
                      style={{
                        padding: '12px',
                        backgroundColor: 'rgba(239, 68, 68, 0.05)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        marginBottom: 12,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <strong style={{ color: 'var(--accent-red)' }}>{prt.activeJob.jobCode}</strong>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          ETA ~{prt.activeJob.remainingHours}h remaining
                        </span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {prt.activeJob.productName}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        Client: {prt.activeJob.customerName} &bull; Spool: {prt.activeJob.material} ({prt.activeJob.color})
                      </div>

                      {/* Progress Bar */}
                      <div style={{ marginTop: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                          <span style={{ color: 'var(--text-muted)' }}>Extrusion Progress</span>
                          <span style={{ fontWeight: 700, color: 'var(--accent-red)' }}>
                            {prt.activeJob.progressPct}%
                          </span>
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: 6,
                            borderRadius: 4,
                            backgroundColor: 'var(--border-subtle)',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${prt.activeJob.progressPct}%`,
                              height: '100%',
                              backgroundColor: 'var(--accent-red)',
                              boxShadow: '0 0 8px var(--accent-red)',
                              transition: 'width 0.4s ease',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : isAvailable ? (
                    <div
                      style={{
                        padding: '16px 12px',
                        textAlign: 'center',
                        backgroundColor: 'var(--bg-canvas)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-muted)',
                        fontSize: 12,
                        marginBottom: 12,
                      }}
                    >
                      <CheckCircle2 size={20} color="var(--status-success)" style={{ margin: '0 auto 6px auto' }} />
                      Clean Bed &bull; Calibrated &bull; Ready for Dispatch
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '16px 12px',
                        textAlign: 'center',
                        backgroundColor: 'var(--bg-canvas)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--status-warning)',
                        fontSize: 12,
                        marginBottom: 12,
                      }}
                    >
                      <AlertTriangle size={20} color="var(--status-warning)" style={{ margin: '0 auto 6px auto' }} />
                      Maintenance / Routine Service Scheduled
                    </div>
                  )}
                </div>

                {/* Card Action Controls */}
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  {isPrinting ? (
                    <Link
                      href="/production"
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, fontSize: 11.5, textAlign: 'center' }}
                    >
                      View Job Telemetry
                    </Link>
                  ) : (
                    <Link
                      href="/production/new-job"
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, fontSize: 11.5, textAlign: 'center' }}
                    >
                      Dispatch Job
                    </Link>
                  )}
                  <Link
                    href="/printers"
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 11.5, padding: '4px 10px' }}
                  >
                    Diagnostics
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lower Multi-Column Command Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        {/* Left Column: Active Print Jobs In-Flight */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Active Jobs In-Flight</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Currently printing work orders across the facility
              </p>
            </div>
            <Link href="/production" className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>
              Production MES →
            </Link>
          </div>

          {activeJobs.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No active print jobs in execution. Printer farm is idle.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activeJobs.map((job: any) => (
                <div
                  key={job.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'var(--accent-red-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Cpu size={20} color="var(--accent-red)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                        {job.jobCode} &bull; {job.product?.name || 'Custom Spec'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        Machine: <strong>{job.printer?.name}</strong> &bull; Client: {job.order?.customer?.company || 'Direct'}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <StatusBadge status={job.status} />
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      Est: {job.estimatedTimeHours} hrs &bull; {job.estimatedFilamentG}g
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Urgent Action Radar & Quick Launcher */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick Action Cockpit Launcher */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px 0' }}>Quick Operational Dispatch</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Link
                href="/production/new-job"
                className="btn btn-secondary btn-sm"
                style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}
              >
                <Cpu size={15} color="var(--accent-red)" />
                Launch Print Job
              </Link>
              <Link
                href="/quotes"
                className="btn btn-secondary btn-sm"
                style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}
              >
                <FileText size={15} color="#3b82f6" />
                Draft Fast Quote
              </Link>
              <Link
                href="/quality"
                className="btn btn-secondary btn-sm"
                style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}
              >
                <ShieldAlert size={15} color="var(--status-warning)" />
                Log QC Inspection
              </Link>
              <Link
                href="/shipping"
                className="btn btn-secondary btn-sm"
                style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}
              >
                <Truck size={15} color="#10b981" />
                Dispatch Shipment
              </Link>
            </div>
          </div>

          {/* Critical Radar - Low Spools & CAPAs */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px 0' }}>
              Critical Alerts & Exception Radar
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Spool Warnings */}
              {lowSpools.map((spool: any) => (
                <div
                  key={spool.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Disc size={16} color="#f59e0b" />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>
                        {spool.spoolCode} ({spool.brand} {spool.material})
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                        Dry Cabinet &bull; Only {spool.currentWeightG}g remaining
                      </div>
                    </div>
                  </div>
                  <Link href="/filament" style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b', textDecoration: 'none' }}>
                    Reload →
                  </Link>
                </div>
              ))}

              {/* CAPA Warnings */}
              {criticalCapas.map((capa: any) => (
                <div
                  key={capa.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={16} color="var(--accent-red)" />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-red)' }}>
                        {capa.capaCode}: 8D Corrective Action
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                        {capa.problemStatement.slice(0, 48)}...
                      </div>
                    </div>
                  </div>
                  <Link href="/quality" style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-red)', textDecoration: 'none' }}>
                    Review →
                  </Link>
                </div>
              ))}

              {lowSpools.length === 0 && criticalCapas.length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--status-success)', padding: 10, textAlign: 'center' }}>
                  ✓ All materials and quality metrics are within nominal limits.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
