'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Cpu,
  ShieldCheck,
  Disc,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  Layers,
  Users,
  Target,
  AlertOctagon,
  PieChart as PieChartIcon,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { KPICard } from '@/components/ui/KPICard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency } from '@/lib/calculations';

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function AnalyticsPage() {
  const [range, setRange] = useState<'7d' | '30d' | '90d' | 'all'>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'commercial' | 'production' | 'margins' | 'quality'>('commercial');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async (selectedRange: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics?range=${selectedRange}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);

  const exportCSV = () => {
    if (!data) return;
    const rows = [
      ['PrintXO BOS - Business Analytics Export'],
      ['Timeframe', data.timeframe],
      ['Generated At', new Date().toISOString()],
      [],
      ['COMMERCIAL METRICS'],
      ['Total Revenue (INR)', data.summary.totalRevenue],
      ['Total Expenses (INR)', data.summary.totalExpenses],
      ['Net Operating Profit (INR)', data.summary.netOperatingProfit],
      ['Operating Profit Margin (%)', data.summary.profitMarginPct],
      ['Average Order Value (INR)', data.summary.averageOrderValue],
      ['Quote Conversion Rate (%)', data.summary.quoteConversionRatePct],
      ['Pipeline Value (INR)', data.summary.pipelineValue],
      [],
      ['PRODUCTION METRICS'],
      ['Total Print Hours', data.summary.totalPrintHours],
      ['Total Jobs Run', data.summary.totalJobs],
      ['Completed Jobs', data.summary.completedJobs],
      ['Failed Jobs', data.summary.failedJobs],
      ['Job Success Rate (%)', data.summary.jobSuccessRatePct],
      ['Scrap / Waste Rate (%)', data.summary.scrapRatePct],
      [],
      ['QUALITY & COST OF QUALITY'],
      ['First Pass Yield (%)', data.summary.firstPassYieldPct],
      ['Total Cost of Quality (INR)', data.summary.totalCostOfQuality],
      ['Open Complaints', data.quality.openComplaints],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `printxo-analytics-${range}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !data) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 12px auto' }} />
        <div>Computing analytics & aggregated data...</div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const charts = data?.charts || {};
  const rankings = data?.rankings || {};
  const quality = data?.quality || {};
  const focusedMaterialUsage = (charts.materialUsageData || []).find((m: any) => m.material === selectedMaterial) || {
    material: selectedMaterial,
    weightG: 0,
    scrapG: 0,
    estimatedCost: 0,
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: 16,
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
              <BarChart3 size={20} color="var(--accent-red)" />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Enterprise Analytics Hub</h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Operational Cockpit, Machine Fleet Performance, Unit Economics & Quality Intelligence
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Timeframe selector */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: 3,
            }}
          >
            {(['7d', '30d', '90d', 'all'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setRange(t)}
                className={`btn btn-sm ${range === t ? 'btn-primary' : 'btn-ghost'}`}
                style={{
                  padding: '4px 12px',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-xs)',
                }}
              >
                {t === '7d' ? '7 Days' : t === '30d' ? '30 Days' : t === '90d' ? 'Quarter' : 'All Time'}
              </button>
            ))}
          </div>

          <button
            onClick={exportCSV}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Top Universal KPI Ribbon */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <KPICard
          label="Net Operating Revenue"
          value={formatCurrency(summary.totalRevenue || 0)}
          subtext={`Profit: ${formatCurrency(summary.netOperatingProfit || 0)} (${summary.profitMarginPct || 0}%)`}
          icon={DollarSign}
          accentColor="var(--accent-red)"
        />
        <KPICard
          label="Total Machine Hours"
          value={`${summary.totalPrintHours || 0} hrs`}
          subtext={`${summary.completedJobs || 0} jobs completed • ${summary.jobSuccessRatePct || 0}% success`}
          icon={Cpu}
          accentColor="var(--status-info)"
        />
        <KPICard
          label="First Pass Yield (FPY)"
          value={`${summary.firstPassYieldPct || 0}%`}
          subtext={`Scrap Rate: ${summary.scrapRatePct || 0}% • CoQ: ${formatCurrency(summary.totalCostOfQuality || 0)}`}
          icon={ShieldCheck}
          accentColor={summary.firstPassYieldPct >= 90 ? 'var(--status-success)' : 'var(--status-warning)'}
        />
        <KPICard
          label="Quote Conversion Rate"
          value={`${summary.quoteConversionRatePct || 0}%`}
          subtext={`Pipeline Value: ${formatCurrency(summary.pipelineValue || 0)}`}
          icon={Target}
          accentColor="#8b5cf6"
        />
      </div>

      {/* Section Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: 24,
        }}
      >
        {[
          { id: 'commercial', label: 'Commercial & Revenue', icon: TrendingUp },
          { id: 'production', label: 'Farm & Fleet Efficiency', icon: Cpu },
          { id: 'margins', label: 'Product Margins & Profitability', icon: Layers },
          { id: 'quality', label: 'TQM & Cost of Quality (CoQ)', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: 600,
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--accent-red)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Icon size={15} color={isActive ? 'var(--accent-red)' : 'var(--text-muted)'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: COMMERCIAL & REVENUE */}
      {/* ========================================================================= */}
      {activeTab === 'commercial' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Revenue vs Expenses Chart & Customer Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Revenue & Profit Trajectory</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Monthly top-line billing vs operational expenditures
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444' }} /> Revenue
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3b82f6' }} /> Expenses
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} /> Net Profit
                  </span>
                </div>
              </div>

              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.monthlyRevenueData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="var(--text-muted)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `₹${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-surface-elevated)',
                        borderColor: 'var(--border-subtle)',
                        borderRadius: 6,
                        color: 'var(--text-primary)',
                        fontSize: 12,
                      }}
                      formatter={(val: any) => [formatCurrency(Number(val)), '']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                    <Area type="monotone" dataKey="expenses" stroke="#3b82f6" strokeWidth={1.5} fillOpacity={0} name="Expenses" />
                    <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProf)" name="Net Profit" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Customer Segments */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px 0' }}>Customer Segment Share</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
                B2B, Institutional, Makers & Direct
              </p>

              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.customerSegmentData || []}
                      dataKey="revenue"
                      nameKey="segment"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {(charts.customerSegmentData || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-surface-elevated)',
                        borderColor: 'var(--border-subtle)',
                        borderRadius: 6,
                        color: 'var(--text-primary)',
                        fontSize: 12,
                      }}
                      formatter={(val: any) => [formatCurrency(Number(val)), 'Revenue']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                {(charts.customerSegmentData || []).map((seg: any, idx: number) => (
                  <div key={seg.segment} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: COLORS[idx % COLORS.length] }} />
                      {seg.segment}
                    </span>
                    <span style={{ fontWeight: 600 }}>
                      {formatCurrency(seg.revenue)} ({seg.sharePct}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer LTV Table */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Top Client Lifetime Value (LTV)</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Highest contributing accounts, repeat velocity and rating
                </p>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Repeat Customer Rate: <strong style={{ color: 'var(--status-success)' }}>{summary.repeatCustomerRatePct || 0}%</strong>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px 12px' }}>Customer / Company</th>
                    <th style={{ padding: '8px 12px' }}>Segment</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Orders Placed</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Average Order Value</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Lifetime Value (LTV)</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Satisfaction</th>
                  </tr>
                </thead>
                <tbody>
                  {(rankings.customerLtvRankings || []).map((client: any) => (
                    <tr key={client.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{client.company}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{client.name} &bull; {client.code}</div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <StatusBadge status={client.type} />
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>{client.totalOrders}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(client.avgOrderValue)}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: 'var(--accent-red)' }}>
                        {formatCurrency(client.lifetimeValue)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{ color: '#f59e0b', fontWeight: 600 }}>★ {client.rating.toFixed(1)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FARM & FLEET EFFICIENCY */}
      {/* ========================================================================= */}
      {activeTab === 'production' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Printer Hours & Utilization */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Machine Farm Fleet Utilization</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Print hours delivered, job counts and success rate per machine
                </p>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Farm Failure Rate: <strong style={{ color: summary.jobFailureRatePct > 10 ? 'var(--status-danger)' : 'var(--status-success)' }}>
                  {summary.jobFailureRatePct}%
                </strong>
              </div>
            </div>

            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.printerStats || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="code" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} unit="h" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-surface-elevated)',
                      borderColor: 'var(--border-subtle)',
                      borderRadius: 6,
                      color: 'var(--text-primary)',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="totalLifetimeHours" fill="var(--border-strong)" name="Lifetime Hours" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="periodHours" fill="var(--accent-red)" name="Selected Period Hours" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Material Consumption & Spool Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px 0' }}>Polymer & Material Consumption</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                    {selectedMaterial === 'ALL'
                      ? 'Filament consumed across all polymer types (PLA, PETG, ABS, PA-CF, TPU)'
                      : `Machine & consumption breakdown for ${selectedMaterial}`}
                  </p>
                </div>

                {/* Material Select Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Polymer:</label>
                  <select
                    className="form-input"
                    style={{ padding: '4px 10px', fontSize: 12, borderRadius: 6, minWidth: 125, height: 32 }}
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                  >
                    <option value="ALL">All Polymers</option>
                    {(charts.availableMaterials || ['PLA', 'PETG', 'ABS', 'PA-CF', 'TPU']).map((mat: string) => (
                      <option key={mat} value={mat}>
                        {mat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Polymer KPI Badges for Selected Material */}
              {selectedMaterial !== 'ALL' && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                  <div style={{ padding: '4px 10px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 6, border: '1px solid var(--border-subtle)', fontSize: 11.5 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Consumed: </span>
                    <strong style={{ color: '#3b82f6' }}>{focusedMaterialUsage.weightG}g</strong>
                  </div>
                  <div style={{ padding: '4px 10px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 6, border: '1px solid var(--border-subtle)', fontSize: 11.5 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Purge / Scrap: </span>
                    <strong style={{ color: '#ef4444' }}>{focusedMaterialUsage.scrapG}g</strong>
                  </div>
                  <div style={{ padding: '4px 10px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 6, border: '1px solid var(--border-subtle)', fontSize: 11.5 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Est. Cost: </span>
                    <strong style={{ color: 'var(--status-success)' }}>{formatCurrency(focusedMaterialUsage.estimatedCost)}</strong>
                  </div>
                </div>
              )}

              {/* Dynamic Graph */}
              <div style={{ width: '100%', height: 230 }}>
                <ResponsiveContainer width="100%" height="100%">
                  {selectedMaterial === 'ALL' ? (
                    <BarChart data={charts.materialUsageData || []} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
                      <XAxis type="number" stroke="var(--text-muted)" fontSize={11} unit="g" />
                      <YAxis type="category" dataKey="material" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-surface-elevated)',
                          borderColor: 'var(--border-subtle)',
                          borderRadius: 6,
                          color: 'var(--text-primary)',
                          fontSize: 12,
                        }}
                        formatter={(val: any) => [`${val} grams`, 'Consumed']}
                      />
                      <Bar dataKey="weightG" fill="#3b82f6" name="Filament (g)" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="scrapG" fill="#ef4444" name="Scrap Purge (g)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  ) : (
                    <BarChart
                      data={
                        charts.materialPrinterBreakdown && charts.materialPrinterBreakdown[selectedMaterial]?.length > 0
                          ? charts.materialPrinterBreakdown[selectedMaterial]
                          : [{ printerCode: 'Farm Total', weightG: focusedMaterialUsage.weightG, scrapG: focusedMaterialUsage.scrapG }]
                      }
                      margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                      <XAxis dataKey="printerCode" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                      <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} unit="g" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-surface-elevated)',
                          borderColor: 'var(--border-subtle)',
                          borderRadius: 6,
                          color: 'var(--text-primary)',
                          fontSize: 12,
                        }}
                        formatter={(val: any, name: any) => [`${val} grams`, name === 'weightG' ? `${selectedMaterial} Filament` : 'Scrap Purge']}
                      />
                      <Bar dataKey="weightG" fill="#3b82f6" name={`${selectedMaterial} (g)`} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="scrapG" fill="#ef4444" name="Scrap Purge (g)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Farm Performance Grid */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px 0' }}>Fleet Reliability Breakdown</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
                Individual machine uptime and run outcomes
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(charts.printerStats || []).map((prt: any) => (
                  <div
                    key={prt.id}
                    style={{
                      padding: '12px 14px',
                      backgroundColor: 'var(--bg-canvas)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {prt.name}
                        <StatusBadge status={prt.status} />
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        Model: {prt.model} &bull; Code: {prt.code}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                        {prt.totalLifetimeHours} hrs logged
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--status-success)', marginTop: 2 }}>
                        {prt.successRate}% Success rate
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PRODUCT MARGINS & UNIT ECONOMICS */}
      {/* ========================================================================= */}
      {activeTab === 'margins' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Margin Ranking Table */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Product Margins & Contribution Analysis</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Unit selling price, estimated manufacturing cost, gross margin % and cumulative profits
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px 12px' }}>Product Details</th>
                    <th style={{ padding: '8px 12px' }}>Category</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Unit Selling Price</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Unit Prod Cost</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Unit Profit</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Gross Margin</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Units Sold</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {(rankings.productMargins || []).map((p: any) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.sku}</div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.category}</span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(p.sellingPrice)}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: 'var(--text-muted)' }}>{formatCurrency(p.productionCost)}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: 'var(--status-success)', fontWeight: 600 }}>
                        {formatCurrency(p.unitProfit)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: p.marginPct >= 50 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: p.marginPct >= 50 ? 'var(--status-success)' : 'var(--status-warning)',
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          {p.marginPct}%
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>{p.unitsSold}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: 'var(--accent-red)' }}>
                        {formatCurrency(p.totalProfit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: QUALITY & COST OF QUALITY (CoQ) */}
      {/* ========================================================================= */}
      {activeTab === 'quality' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* CoQ Header Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div className="card" style={{ padding: 18, borderLeft: '3px solid var(--accent-red)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Cost of Quality (CoQ)</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-red)', marginTop: 4 }}>
                {formatCurrency(summary.totalCostOfQuality || 0)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Scrap filaments + rework & defect impact
              </div>
            </div>

            <div className="card" style={{ padding: 18, borderLeft: '3px solid var(--status-success)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>First Pass Yield (FPY)</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--status-success)', marginTop: 4 }}>
                {summary.firstPassYieldPct || 0}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                {quality.passedQC || 0} passed / {quality.totalQC || 0} inspected
              </div>
            </div>

            <div className="card" style={{ padding: 18, borderLeft: '3px solid #f59e0b' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Customer Complaints</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>
                {quality.openComplaints || 0} Open
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                {quality.totalComplaints || 0} logged total ({quality.resolvedComplaints || 0} resolved)
              </div>
            </div>
          </div>

          {/* Defect Pareto Chart */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Defect Pareto Analysis (80/20 Rule)</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Failure modes ranked by financial scrap & rework loss (INR)
                </p>
              </div>
            </div>

            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.defectParetoData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="defectType" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} unit="₹" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-surface-elevated)',
                      borderColor: 'var(--border-subtle)',
                      borderRadius: 6,
                      color: 'var(--text-primary)',
                      fontSize: 12,
                    }}
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Cost Impact']}
                  />
                  <Bar dataKey="totalCost" fill="#ef4444" name="Financial Impact (₹)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
