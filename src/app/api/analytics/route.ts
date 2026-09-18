import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  calculateProfit,
  calculateMargin,
  calculateFailureRate,
  calculateFirstPassYield,
} from '@/lib/calculations';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Determine date cutoff
    const now = new Date();
    let startDate = new Date();
    if (range === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else if (range === '30d') {
      startDate.setDate(now.getDate() - 30);
    } else if (range === '90d') {
      startDate.setDate(now.getDate() - 90);
    } else if (range === '1y') {
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      // 'all'
      startDate = new Date(2020, 0, 1);
    }

    // Fetch parallel data from database
    const [
      invoices,
      payments,
      expenses,
      quotes,
      orders,
      printJobs,
      printers,
      filamentSpools,
      products,
      customers,
      qcInspections,
      defects,
      complaints,
    ] = await Promise.all([
      db.invoice.findMany({
        where: { invoiceDate: { gte: startDate } },
        include: { items: true, customer: true },
        orderBy: { invoiceDate: 'asc' },
      }),
      db.payment.findMany({
        where: { paymentDate: { gte: startDate } },
      }),
      db.expense.findMany({
        where: { expenseDate: { gte: startDate } },
        orderBy: { expenseDate: 'asc' },
      }),
      db.quote.findMany({
        where: { date: { gte: startDate } },
        include: { customer: true },
      }),
      db.order.findMany({
        where: { orderDate: { gte: startDate } },
        include: { customer: true, items: true },
      }),
      db.printJob.findMany({
        where: { createdAt: { gte: startDate } },
        include: { printer: true, product: true, filamentSpool: true },
      }),
      db.printer.findMany(),
      db.filamentSpool.findMany(),
      db.product.findMany({
        include: { orderItems: true },
      }),
      db.customer.findMany({
        include: { orders: true, invoices: true },
      }),
      db.qualityInspection.findMany({
        where: { inspectionDate: { gte: startDate } },
        include: { defects: true },
      }),
      db.defect.findMany({
        where: { createdAt: { gte: startDate } },
      }),
      db.complaint.findMany({
        where: { date: { gte: startDate } },
        include: { capas: true },
      }),
    ]);

    // ==========================================
    // 1. COMMERCIAL & REVENUE METRICS
    // ==========================================
    const nonCancelledInvoices = invoices.filter((i) => i.status !== 'CANCELLED');
    const totalRevenue = nonCancelledInvoices.reduce((acc, i) => acc + i.grandTotal, 0);
    const totalTaxCollected = nonCancelledInvoices.reduce(
      (acc, i) => acc + (i.cgstAmount + i.sgstAmount + i.igstAmount),
      0
    );
    const totalPaid = payments.filter((p) => p.status === 'CONFIRMED').reduce((acc, p) => acc + p.amount, 0);
    const totalReceivables = Math.max(0, totalRevenue - totalPaid);

    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const netOperatingProfit = calculateProfit(totalRevenue, totalExpenses);
    const profitMarginPct = calculateMargin(netOperatingProfit, totalRevenue);
    const averageOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

    // Quote conversion metrics
    const totalQuotesCount = quotes.length;
    const acceptedQuotes = quotes.filter((q) => ['ACCEPTED', 'CONVERTED'].includes(q.status));
    const quoteConversionRatePct = totalQuotesCount > 0
      ? Math.round((acceptedQuotes.length / totalQuotesCount) * 100 * 10) / 10
      : 0;
    const pipelineValue = quotes
      .filter((q) => ['DRAFT', 'SENT', 'VIEWED', 'NEGOTIATION'].includes(q.status))
      .reduce((acc, q) => acc + q.grandTotal, 0);

    // Monthly / Periodic Revenue Breakdown
    const monthlyRevenueMap: Record<string, { label: string; revenue: number; expenses: number; profit: number }> = {};
    const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' });

    nonCancelledInvoices.forEach((inv) => {
      const key = monthFormatter.format(new Date(inv.invoiceDate));
      if (!monthlyRevenueMap[key]) {
        monthlyRevenueMap[key] = { label: key, revenue: 0, expenses: 0, profit: 0 };
      }
      monthlyRevenueMap[key].revenue += inv.grandTotal;
    });

    expenses.forEach((exp) => {
      const key = monthFormatter.format(new Date(exp.expenseDate));
      if (!monthlyRevenueMap[key]) {
        monthlyRevenueMap[key] = { label: key, revenue: 0, expenses: 0, profit: 0 };
      }
      monthlyRevenueMap[key].expenses += exp.amount;
    });

    Object.values(monthlyRevenueMap).forEach((item) => {
      item.profit = item.revenue - item.expenses;
    });

    // Fallback if sparse data
    const monthlyRevenueData = Object.values(monthlyRevenueMap);
    if (monthlyRevenueData.length === 0) {
      monthlyRevenueData.push({
        label: monthFormatter.format(now),
        revenue: totalRevenue,
        expenses: totalExpenses,
        profit: netOperatingProfit,
      });
    }

    // Revenue by Customer Segment
    const segmentMap: Record<string, number> = {
      B2B: 0,
      B2C: 0,
      INSTITUTIONAL: 0,
      MAKER: 0,
    };
    nonCancelledInvoices.forEach((inv) => {
      const seg = inv.customer?.customerType || 'B2B';
      segmentMap[seg] = (segmentMap[seg] || 0) + inv.grandTotal;
    });
    const customerSegmentData = Object.entries(segmentMap).map(([segment, revenue]) => ({
      segment,
      revenue,
      sharePct: totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0,
    }));

    // ==========================================
    // 2. PRODUCTION & FLEET EFFICIENCY
    // ==========================================
    const totalJobs = printJobs.length;
    const completedJobs = printJobs.filter((j) => j.status === 'COMPLETED').length;
    const failedJobs = printJobs.filter((j) => ['FAILED', 'REPRINT'].includes(j.status)).length;
    const inProgressJobs = printJobs.filter((j) => ['PRINTING', 'SCHEDULED', 'QUEUED'].includes(j.status)).length;

    const totalPrintHours = Math.round(printJobs.reduce((acc, j) => acc + (j.actualTimeHours || j.estimatedTimeHours || 0), 0) * 10) / 10;
    const totalFilamentConsumedG = Math.round(printJobs.reduce((acc, j) => acc + (j.actualFilamentG || j.estimatedFilamentG || 0), 0));
    const totalWasteFilamentG = Math.round(printJobs.reduce((acc, j) => acc + (j.wasteFilamentG || 0), 0));
    const scrapRatePct = totalFilamentConsumedG > 0 ? Math.round((totalWasteFilamentG / totalFilamentConsumedG) * 100 * 10) / 10 : 0;

    const jobSuccessRatePct = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100 * 10) / 10 : 100;
    const jobFailureRatePct = calculateFailureRate(failedJobs, totalJobs);

    // Printer utilization breakdown
    const printerStats = printers.map((prt) => {
      const printerJobs = printJobs.filter((j) => j.printerId === prt.id);
      const machineHours = Math.round(printerJobs.reduce((acc, j) => acc + (j.actualTimeHours || j.estimatedTimeHours || 0), 0) * 10) / 10;
      const machineCompleted = printerJobs.filter((j) => j.status === 'COMPLETED').length;
      const machineFailed = printerJobs.filter((j) => ['FAILED', 'REPRINT'].includes(j.status)).length;
      return {
        id: prt.id,
        code: prt.printerCode,
        name: prt.name,
        model: prt.model,
        status: prt.status,
        totalLifetimeHours: prt.totalPrintHours,
        periodHours: machineHours,
        jobsCount: printerJobs.length,
        completedCount: machineCompleted,
        failedCount: machineFailed,
        successRate: printerJobs.length > 0 ? Math.round((machineCompleted / printerJobs.length) * 100) : 100,
      };
    });

    // Material consumption breakdown by material type
    const standardPolymers = ['PLA', 'PETG', 'ABS', 'PA-CF', 'TPU'];
    const materialUsageMap: Record<string, { material: string; weightG: number; scrapG: number; estimatedCost: number; jobsCount: number }> = {};
    const materialPrinterMap: Record<string, Record<string, { printerCode: string; printerName: string; weightG: number; scrapG: number; jobsCount: number }>> = {};

    // Seed standard polymers
    standardPolymers.forEach((mat) => {
      materialUsageMap[mat] = { material: mat, weightG: 0, scrapG: 0, estimatedCost: 0, jobsCount: 0 };
      materialPrinterMap[mat] = {};
    });

    // Also include any spool polymers
    filamentSpools.forEach((s) => {
      if (s.material && !materialUsageMap[s.material]) {
        materialUsageMap[s.material] = { material: s.material, weightG: 0, scrapG: 0, estimatedCost: 0, jobsCount: 0 };
        materialPrinterMap[s.material] = {};
      }
    });

    printJobs.forEach((j) => {
      const mat = j.filamentSpool?.material || 'PLA';
      if (!materialUsageMap[mat]) {
        materialUsageMap[mat] = { material: mat, weightG: 0, scrapG: 0, estimatedCost: 0, jobsCount: 0 };
      }
      if (!materialPrinterMap[mat]) {
        materialPrinterMap[mat] = {};
      }

      const weight = j.actualFilamentG || j.estimatedFilamentG || 0;
      const waste = j.wasteFilamentG || 0;
      const costPerG = j.filamentSpool?.costPerGram || 1.8;

      materialUsageMap[mat].weightG += weight;
      materialUsageMap[mat].scrapG += waste;
      materialUsageMap[mat].estimatedCost += Math.round(weight * costPerG);
      materialUsageMap[mat].jobsCount += 1;

      const pCode = j.printer?.printerCode || (j.printerId ? `PRT-${j.printerId.slice(0, 4)}` : 'PRT-GEN');
      const pName = j.printer?.name || 'Farm Printer';

      if (!materialPrinterMap[mat][pCode]) {
        materialPrinterMap[mat][pCode] = {
          printerCode: pCode,
          printerName: pName,
          weightG: 0,
          scrapG: 0,
          jobsCount: 0,
        };
      }
      materialPrinterMap[mat][pCode].weightG += weight;
      materialPrinterMap[mat][pCode].scrapG += waste;
      materialPrinterMap[mat][pCode].jobsCount += 1;
    });

    const materialUsageData = Object.values(materialUsageMap).filter((m) => m.weightG > 0 || m.scrapG > 0);
    const finalMaterialUsageData = materialUsageData.length > 0 ? materialUsageData : Object.values(materialUsageMap);

    const materialPrinterBreakdown: Record<string, Array<{ printerCode: string; printerName: string; weightG: number; scrapG: number; jobsCount: number }>> = {};
    Object.keys(materialPrinterMap).forEach((mat) => {
      materialPrinterBreakdown[mat] = Object.values(materialPrinterMap[mat]);
    });

    const availableMaterials = Array.from(new Set([...Object.keys(materialUsageMap), ...standardPolymers]));

    // ==========================================
    // 3. PRODUCT MARGINS & PROFITABILITY
    // ==========================================
    const productMargins = products.map((prod) => {
      const unitsSold = prod.orderItems.reduce((acc, item) => acc + item.quantity, 0);
      const grossRev = unitsSold * prod.sellingPrice;
      const totalCost = unitsSold * prod.productionCost;
      const totalProfit = grossRev - totalCost;
      const marginPct = prod.sellingPrice > 0
        ? Math.round(((prod.sellingPrice - prod.productionCost) / prod.sellingPrice) * 100 * 10) / 10
        : 0;

      return {
        id: prod.id,
        sku: prod.sku,
        name: prod.name,
        category: prod.category || 'General',
        sellingPrice: prod.sellingPrice,
        productionCost: prod.productionCost,
        unitProfit: prod.sellingPrice - prod.productionCost,
        marginPct,
        unitsSold,
        grossRev,
        totalProfit,
      };
    }).sort((a, b) => b.totalProfit - a.totalProfit);

    // ==========================================
    // 4. CUSTOMER INTELLIGENCE & LTV
    // ==========================================
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter((c) => c.status === 'ACTIVE').length;
    const repeatCustomers = customers.filter((c) => c.orders.length > 1).length;
    const repeatCustomerRatePct = totalCustomers > 0
      ? Math.round((repeatCustomers / totalCustomers) * 100 * 10) / 10
      : 0;

    const customerLtvRankings = customers.map((c) => {
      const rev = c.invoices
        .filter((i) => i.status !== 'CANCELLED')
        .reduce((sum, i) => sum + i.grandTotal, 0);
      return {
        id: c.id,
        code: c.customerCode,
        name: c.name,
        company: c.company || c.name,
        type: c.customerType,
        totalOrders: c.orders.length,
        lifetimeValue: rev,
        avgOrderValue: c.orders.length > 0 ? Math.round(rev / c.orders.length) : 0,
        rating: c.rating,
      };
    }).sort((a, b) => b.lifetimeValue - a.lifetimeValue);

    // ==========================================
    // 5. QUALITY & COST OF QUALITY (CoQ)
    // ==========================================
    const totalQC = qcInspections.length;
    const passedQC = qcInspections.filter((q) => q.result === 'PASSED').length;
    const failedQC = qcInspections.filter((q) => q.result === 'FAILED').length;
    const reworkQC = qcInspections.filter((q) => q.result === 'REWORK_REQUIRED').length;
    const firstPassYieldPct = calculateFirstPassYield(passedQC, totalQC);

    // Scrap & Defect cost impact
    const defectCostTotal = defects.reduce((acc, d) => acc + (d.costImpact || 0), 0);
    const scrapMaterialCost = Math.round(totalWasteFilamentG * 1.8); // avg ₹1.8/g
    const totalCostOfQuality = defectCostTotal + scrapMaterialCost;

    // Defect Pareto distribution
    const defectParetoMap: Record<string, { defectType: string; count: number; totalCost: number }> = {};
    defects.forEach((d) => {
      if (!defectParetoMap[d.defectType]) {
        defectParetoMap[d.defectType] = { defectType: d.defectType, count: 0, totalCost: 0 };
      }
      defectParetoMap[d.defectType].count += 1;
      defectParetoMap[d.defectType].totalCost += d.costImpact || 0;
    });
    const defectParetoData = Object.values(defectParetoMap).sort((a, b) => b.totalCost - a.totalCost);

    // Complaints resolution
    const totalComplaints = complaints.length;
    const openComplaints = complaints.filter((c) => ['OPEN', 'INVESTIGATING'].includes(c.status)).length;
    const resolvedComplaints = complaints.filter((c) => ['RESOLVED', 'CLOSED'].includes(c.status)).length;

    return NextResponse.json({
      success: true,
      timeframe: range,
      startDate,
      endDate: now,
      summary: {
        totalRevenue,
        totalExpenses,
        netOperatingProfit,
        profitMarginPct,
        totalPaid,
        totalReceivables,
        averageOrderValue,
        quoteConversionRatePct,
        pipelineValue,
        totalPrintHours,
        totalJobs,
        completedJobs,
        failedJobs,
        jobSuccessRatePct,
        jobFailureRatePct,
        scrapRatePct,
        firstPassYieldPct,
        totalCostOfQuality,
        repeatCustomerRatePct,
      },
      charts: {
        monthlyRevenueData,
        customerSegmentData,
        materialUsageData: finalMaterialUsageData,
        materialPrinterBreakdown,
        availableMaterials,
        printerStats,
        defectParetoData,
      },
      rankings: {
        productMargins,
        customerLtvRankings,
      },
      quality: {
        totalQC,
        passedQC,
        failedQC,
        reworkQC,
        totalComplaints,
        openComplaints,
        resolvedComplaints,
      },
    });
  } catch (error: any) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to compute analytics' },
      { status: 500 }
    );
  }
}
