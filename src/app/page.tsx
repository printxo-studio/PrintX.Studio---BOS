import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { KPICard } from '@/components/ui/KPICard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Cpu,
  ShieldCheck,
  Disc,
  Clock,
  AlertTriangle,
  ArrowRight,
  Printer,
  ChevronRight,
  Flame,
} from 'lucide-react';
import {
  calculateProfit,
  calculateMargin,
  calculateFailureRate,
  calculateFirstPassYield,
  formatCurrency,
} from '@/lib/calculations';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Real database metrics aggregation
  const [
    totalOrders,
    orders,
    customers,
    printers,
    printJobs,
    filamentSpools,
    qcInspections,
    invoices,
    expenses,
    tasks,
    notifications,
  ] = await Promise.all([
    db.order.count(),
    db.order.findMany({
      include: { customer: true },
      orderBy: { orderDate: 'desc' },
      take: 6,
    }),
    db.customer.findMany(),
    db.printer.findMany(),
    db.printJob.findMany({
      include: { printer: true, product: true },
      orderBy: { createdAt: 'desc' },
    }),
    db.filamentSpool.findMany(),
    db.qualityInspection.findMany(),
    db.invoice.findMany(),
    db.expense.findMany(),
    db.task.findMany({
      where: { status: { not: 'DONE' } },
      orderBy: { dueDate: 'asc' },
      take: 5,
    }),
    db.notification.findMany({
      where: { isRead: false },
      take: 4,
    }),
  ]);

  // Calculations from real data (Section 49)
  const totalRevenue = invoices
    .filter((inv) => inv.status !== 'CANCELLED')
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const estimatedGrossProfit = calculateProfit(totalRevenue, totalExpenses);
  const grossMargin = calculateMargin(estimatedGrossProfit, totalRevenue);
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const activeJobs = printJobs.filter((j) => ['PRINTING', 'SCHEDULED', 'QUEUED'].includes(j.status)).length;
  const completedJobs = printJobs.filter((j) => j.status === 'COMPLETED').length;
  const failedJobs = printJobs.filter((j) => ['FAILED', 'REPRINT'].includes(j.status)).length;
  const totalJobCount = printJobs.length;
  const failureRate = calculateFailureRate(failedJobs, totalJobCount);

  const passedQC = qcInspections.filter((q) => q.result === 'PASSED').length;
  const totalQC = qcInspections.length;
  const firstPassYield = calculateFirstPassYield(passedQC, totalQC);

  const lowStockSpools = filamentSpools.filter(
    (s) => s.status === 'LOW' || s.currentWeightG <= s.reorderLevelG
  ).length;

  const totalFilamentWeightKg = (
    filamentSpools.reduce((sum, s) => sum + s.currentWeightG, 0) / 1000
  ).toFixed(1);

  const pendingPayments = invoices
    .filter((inv) => inv.status === 'ISSUED' || inv.status === 'PARTIALLY_PAID')
    .reduce((sum, inv) => sum + inv.balanceDue, 0);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Flame size={22} color="var(--accent-red)" /> Executive Command Dashboard
          </h1>
          <p className="page-subtitle">
            PRINTXO Additive Operations &bull; Real-time Shop Floor & Business Intelligence
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="badge badge-success" style={{ padding: '6px 12px', fontSize: 12 }}>
            ● Farm Online: {printers.filter((p) => p.status !== 'OFFLINE' && p.status !== 'ERROR').length}/
            {printers.length} Printers
          </div>
          <Link href="/command-center" className="btn btn-secondary btn-sm">
            Daily Command Center <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* SECTION 1: BUSINESS & COMMERCIAL OVERVIEW */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted)',
            marginBottom: 10,
          }}
        >
          Commercial & Revenue Overview
        </div>
        <div className="kpi-grid">
          <KPICard
            label="Total Revenue"
            value={formatCurrency(totalRevenue)}
            subtext="From active invoices"
            icon={DollarSign}
            accentColor="var(--status-success)"
          />
          <KPICard
            label="Gross Profit"
            value={formatCurrency(estimatedGrossProfit)}
            subtext={`${grossMargin}% Gross Margin`}
            icon={TrendingUp}
            accentColor="var(--status-info)"
          />
          <KPICard
            label="Total Orders"
            value={totalOrders}
            subtext={`Avg Order: ${formatCurrency(averageOrderValue)}`}
            icon={ShoppingBag}
          />
          <KPICard
            label="Pending Receivable"
            value={formatCurrency(pendingPayments)}
            subtext="Awaiting client payment"
            icon={DollarSign}
            accentColor="var(--status-warning)"
          />
        </div>
      </div>

      {/* SECTION 2: PRODUCTION & SHOP FLOOR METRICS */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted)',
            marginBottom: 10,
          }}
        >
          Production & Quality Performance
        </div>
        <div className="kpi-grid">
          <KPICard
            label="Active Print Jobs"
            value={activeJobs}
            subtext={`${completedJobs} Completed / ${failedJobs} Failed`}
            icon={Cpu}
            accentColor="var(--status-purple)"
          />
          <KPICard
            label="First Pass Yield (TQM)"
            value={`${firstPassYield}%`}
            subtext="QC passed on 1st inspection"
            icon={ShieldCheck}
            accentColor="var(--status-success)"
          />
          <KPICard
            label="Farm Failure Rate"
            value={`${failureRate}%`}
            subtext="Target: < 5.0%"
            icon={AlertTriangle}
            accentColor={failureRate > 5 ? 'var(--status-danger)' : 'var(--status-success)'}
          />
          <KPICard
            label="Filament Inventory"
            value={`${totalFilamentWeightKg} kg`}
            subtext={`${lowStockSpools} Spools need reorder`}
            icon={Disc}
            accentColor={lowStockSpools > 0 ? 'var(--status-warning)' : undefined}
          />
        </div>
      </div>

      {/* TWO COLUMN GRID: ACTIVE JOBS & RECENT ORDERS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Active Print Farm Status */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Printer size={16} color="var(--accent-red)" />
              <span>Print Farm Status</span>
            </div>
            <Link href="/printers" style={{ fontSize: 12, color: 'var(--accent-red)', textDecoration: 'none' }}>
              View All Printers →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {printers.map((printer) => (
              <div
                key={printer.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{printer.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {printer.location || 'Rack 1'} &bull; {printer.nozzleSize}mm {printer.nozzleType}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-secondary)' }}>
                    <div>{printer.totalPrintHours}h logged</div>
                    <div>{printer.successfulJobs} jobs done</div>
                  </div>
                  <StatusBadge status={printer.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <ShoppingBag size={16} color="var(--accent-red)" />
              <span>Recent Production Orders</span>
            </div>
            <Link href="/orders" style={{ fontSize: 12, color: 'var(--accent-red)', textDecoration: 'none' }}>
              View All Orders →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    <Link href={`/orders/${order.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                      {order.orderNumber}
                    </Link>
                    <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>
                      {order.customer.name}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Due: {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'Immediate'} &bull; Total: ₹
                    {order.totalAmount}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StatusBadge status={order.paymentStatus} label={`Pay: ${order.paymentStatus}`} />
                  <StatusBadge status={order.overallStatus} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LOWER SECTION: CRITICAL TASKS & SYSTEM NOTIFICATIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 20 }}>
        {/* Operational Tasks */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Clock size={16} color="var(--accent-red)" />
              <span>Pending Operational Tasks</span>
            </div>
            <Link href="/tasks" style={{ fontSize: 12, color: 'var(--accent-red)', textDecoration: 'none' }}>
              Manage Tasks →
            </Link>
          </div>

          {tasks.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12.5 }}>
              All daily shop floor tasks completed!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 12.5 }}>{task.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Today'}
                    </div>
                  </div>
                  <StatusBadge status={task.priority} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real-time Alerts */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <AlertTriangle size={16} color="var(--status-warning)" />
              <span>Active Farm Alerts</span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{notifications.length} Unread</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12.5 }}>
                No active warnings. System running within tolerances.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: `3px solid ${n.type === 'LOW_STOCK' ? 'var(--status-warning)' : 'var(--accent-red)'}`,
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-primary)' }}>{n.title}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>{n.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
