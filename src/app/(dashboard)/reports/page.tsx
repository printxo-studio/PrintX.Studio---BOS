'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  RefreshCw,
  DollarSign,
  Cpu,
  ShieldCheck,
  Building2,
  TrendingUp,
  Flame,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency } from '@/lib/calculations';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('MONTHLY');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      let url = `/api/reports?type=${reportType}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    if (!data) return;
    const k = data.kpis;
    const rows = [
      ['PRINTXO - BUSINESS REPORT EXPORT'],
      ['Report Type', data.reportType],
      ['Period', `${data.period.formattedStart} to ${data.period.formattedEnd}`],
      ['Generated At', new Date().toISOString()],
      [],
      ['KEY PERFORMANCE INDICATORS'],
      ['Gross Revenue (INR)', k.totalRevenue],
      ['Taxable Billings (INR)', k.taxableAmount],
      ['GST Collected (INR)', k.totalGst],
      ['Collections Paid (INR)', k.totalCollections],
      ['Total Expenses (INR)', k.totalExpenses],
      ['Net Operating Profit (INR)', k.netProfit],
      ['Operating Margin (%)', k.profitMargin],
      ['Machine Runtime Hours', k.totalPrintHours],
      ['Power Consumed (kWh)', k.totalPowerKwh],
      ['Electricity Cost (INR)', k.totalElectricityCost],
      ['First Pass Yield (%)', k.fpy],
      ['Total Cost of Quality (INR)', k.totalCostOfQuality],
      [],
      ['INVOICES SUMMARY'],
      ['Invoice #', 'Customer', 'Date', 'Taxable', 'GST', 'Total', 'Status'],
      ...(data.tables.invoices || []).map((i: any) => [
        i.invoiceNumber,
        i.customer,
        new Date(i.date).toLocaleDateString('en-IN'),
        i.taxableAmount,
        i.tax,
        i.grandTotal,
        i.status,
      ]),
      [],
      ['EXPENSES SUMMARY'],
      ['Code', 'Category', 'Description', 'Amount', 'Date'],
      ...(data.tables.expenses || []).map((e: any) => [
        e.code,
        e.category,
        `"${e.description.replace(/"/g, '""')}"`,
        e.amount,
        new Date(e.date).toLocaleDateString('en-IN'),
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `printxo-report-${reportType.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `printxo-report-${reportType.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const kpis = data?.kpis || {};
  const company = data?.company || {};
  const tables = data?.tables || {};

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Non-printable Control Bar */}
      <div className="no-print" style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--accent-red-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileText size={20} color="var(--accent-red)" />
              </div>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Business Report Generator</h1>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Operational Flash, Weekly Business Review (WBR) & Monthly Executive Statements
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={handlePrint}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Printer size={14} />
              Print / Save PDF
            </button>
            <button
              onClick={exportCSV}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Download size={14} />
              CSV
            </button>
            <button
              onClick={exportJSON}
              className="btn btn-ghost btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              JSON
            </button>
          </div>
        </div>

        {/* Filters Strip */}
        <div
          className="card"
          style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          {/* Preset Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setReportType(t);
                  setStartDate('');
                  setEndDate('');
                }}
                className={`btn btn-sm ${reportType === t ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: 12, fontWeight: 600 }}
              >
                {t === 'DAILY' ? 'Daily Operations Flash' : t === 'WEEKLY' ? 'Weekly Review (WBR)' : 'Monthly P&L Statement'}
              </button>
            ))}
          </div>

          {/* Custom Date Range */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Custom:</span>
            <input
              type="date"
              className="form-input"
              style={{ fontSize: 12, padding: '4px 8px', width: 'auto' }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>to</span>
            <input
              type="date"
              className="form-input"
              style={{ fontSize: 12, padding: '4px 8px', width: 'auto' }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <button onClick={fetchReport} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px' }}>
              <RefreshCw size={13} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw className="animate-spin" size={28} style={{ margin: '0 auto 12px auto' }} />
          <div>Synthesizing report & aggregating database records...</div>
        </div>
      ) : data ? (
        /* Printable Report Document Container */
        <div
          className="printable-report"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '40px',
          }}
        >
          {/* Official Letterhead */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '2px solid var(--accent-red)',
              paddingBottom: '20px',
              marginBottom: '28px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 6,
                    backgroundColor: 'var(--accent-red)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Flame size={20} color="#ffffff" />
                </div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0, letterSpacing: '0.04em' }}>
                    {company.name} <span style={{ color: 'var(--accent-red)' }}>BOS</span>
                  </h2>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {company.legalName} &bull; GSTIN: <strong>{company.gstin}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                {data.reportTitle}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Period: <strong>{data.period.formattedStart}</strong> to <strong>{data.period.formattedEnd}</strong>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                Generated: {new Date().toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Executive Narrative Callout */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: 'var(--bg-canvas)',
              borderLeft: '4px solid var(--accent-red)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '28px',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-red)', marginBottom: 4 }}>
              Executive Summary & Operational Context
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, margin: 0, color: 'var(--text-primary)' }}>
              {data.executiveNarrative}
            </p>
          </div>

          {/* KPI Summary Matrix */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
              marginBottom: '32px',
            }}
          >
            <div style={{ padding: '14px', backgroundColor: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Gross Invoiced Revenue</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-red)', marginTop: 4 }}>
                {formatCurrency(kpis.totalRevenue || 0)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                GST: {formatCurrency(kpis.totalGst || 0)}
              </div>
            </div>

            <div style={{ padding: '14px', backgroundColor: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Net Operating Profit</div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: kpis.netProfit >= 0 ? 'var(--status-success)' : 'var(--status-danger)',
                  marginTop: 4,
                }}
              >
                {formatCurrency(kpis.netProfit || 0)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Margin: {kpis.profitMargin}%
              </div>
            </div>

            <div style={{ padding: '14px', backgroundColor: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Fleet Production Hours</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                {kpis.totalPrintHours || 0} hrs
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                {kpis.completedJobs || 0} finished / {kpis.totalJobs || 0} jobs
              </div>
            </div>

            <div style={{ padding: '14px', backgroundColor: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>First Pass Yield (FPY)</div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: kpis.fpy >= 90 ? 'var(--status-success)' : 'var(--status-warning)',
                  marginTop: 4,
                }}
              >
                {kpis.fpy}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                CoQ: {formatCurrency(kpis.totalCostOfQuality || 0)}
              </div>
            </div>
          </div>

          {/* Detailed Tables Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Table 1: Commercial Billings */}
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <DollarSign size={16} color="var(--accent-red)" />
                Commercial Billings & Invoices
              </h3>
              {(tables.invoices || []).length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '12px 0' }}>No invoices recorded during this period.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '8px' }}>Invoice #</th>
                      <th style={{ padding: '8px' }}>Customer</th>
                      <th style={{ padding: '8px' }}>Date</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Taxable Amount</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>GST</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Grand Total</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tables.invoices.map((inv: any) => (
                      <tr key={inv.invoiceNumber} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '8px', fontWeight: 600 }}>{inv.invoiceNumber}</td>
                        <td style={{ padding: '8px' }}>{inv.customer}</td>
                        <td style={{ padding: '8px' }}>{new Date(inv.date).toLocaleDateString('en-IN')}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(inv.taxableAmount)}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(inv.tax)}</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>{formatCurrency(inv.grandTotal)}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <StatusBadge status={inv.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Table 2: Production Jobs Executed */}
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Cpu size={16} color="var(--status-info)" />
                Production & Machine Execution
              </h3>
              {(tables.printJobs || []).length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '12px 0' }}>No print jobs scheduled or run during this period.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '8px' }}>Job Code</th>
                      <th style={{ padding: '8px' }}>Product / Part</th>
                      <th style={{ padding: '8px' }}>Machine</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Runtime</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Polymer Consumed</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tables.printJobs.map((j: any) => (
                      <tr key={j.jobCode} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '8px', fontWeight: 600 }}>{j.jobCode}</td>
                        <td style={{ padding: '8px' }}>{j.product}</td>
                        <td style={{ padding: '8px' }}>{j.printer}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>{j.hours} hrs</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>{j.filamentG} g</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <StatusBadge status={j.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Table 3: Quality Log & TQM */}
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={16} color="var(--status-success)" />
                Quality Assurance & Defect Log
              </h3>
              {(tables.qualityLog || []).length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '12px 0' }}>No QC inspections conducted during this period.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '8px' }}>QC Code</th>
                      <th style={{ padding: '8px' }}>Stage</th>
                      <th style={{ padding: '8px' }}>Specification Tested</th>
                      <th style={{ padding: '8px' }}>Defect Type</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tables.qualityLog.map((q: any) => (
                      <tr key={q.qcCode} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '8px', fontWeight: 600 }}>{q.qcCode}</td>
                        <td style={{ padding: '8px' }}>{q.stage}</td>
                        <td style={{ padding: '8px' }}>{q.specification}</td>
                        <td style={{ padding: '8px' }}>{q.defectType}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <StatusBadge status={q.result} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Official Sign-off Footer */}
          <div
            style={{
              marginTop: '48px',
              paddingTop: '24px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Report Reference: PRX-REP-{Date.now().toString().slice(-6)}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                Confidential &bull; Generated by PRINTXO Business Operating System
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ width: 180, borderBottom: '1px solid var(--border-strong)', marginBottom: 6 }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Authorized Signatory</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>PRINTXO Additive Technologies</div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Print Stylesheet */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          .no-print,
          aside,
          header {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .printable-report {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          .printable-report * {
            color: #000000 !important;
            border-color: #cccccc !important;
            background-color: transparent !important;
          }
          .printable-report table {
            page-break-inside: auto;
          }
          .printable-report tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  );
}
