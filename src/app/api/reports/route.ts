import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { COMPANY_DETAILS, DEFAULT_PRICING_CONFIG } from '@/lib/constants';
import {
  calculateProfit,
  calculateMargin,
  calculateFirstPassYield,
  calculateFailureRate,
  formatCurrency,
} from '@/lib/calculations';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'DAILY'; // DAILY, WEEKLY, MONTHLY
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const now = new Date();
    let startDate: Date;
    let endDate = endDateParam ? new Date(endDateParam) : new Date();

    if (startDateParam) {
      startDate = new Date(startDateParam);
    } else {
      startDate = new Date();
      if (reportType === 'DAILY') {
        startDate.setHours(0, 0, 0, 0);
      } else if (reportType === 'WEEKLY') {
        startDate.setDate(now.getDate() - 7);
      } else if (reportType === 'MONTHLY') {
        startDate.setDate(now.getDate() - 30);
      }
    }

    // Parallel queries within the date window
    const [
      invoices,
      payments,
      expenses,
      quotes,
      orders,
      printJobs,
      printers,
      qcInspections,
      defects,
      complaints,
      shipments,
    ] = await Promise.all([
      db.invoice.findMany({
        where: { invoiceDate: { gte: startDate, lte: endDate } },
        include: { customer: true, items: true },
        orderBy: { invoiceDate: 'desc' },
      }),
      db.payment.findMany({
        where: { paymentDate: { gte: startDate, lte: endDate } },
      }),
      db.expense.findMany({
        where: { expenseDate: { gte: startDate, lte: endDate } },
        orderBy: { expenseDate: 'desc' },
      }),
      db.quote.findMany({
        where: { date: { gte: startDate, lte: endDate } },
        include: { customer: true },
      }),
      db.order.findMany({
        where: { orderDate: { gte: startDate, lte: endDate } },
        include: { customer: true, items: true },
      }),
      db.printJob.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        include: { printer: true, product: true, filamentSpool: true },
      }),
      db.printer.findMany(),
      db.qualityInspection.findMany({
        where: { inspectionDate: { gte: startDate, lte: endDate } },
        include: { defects: true },
      }),
      db.defect.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      db.complaint.findMany({
        where: { date: { gte: startDate, lte: endDate } },
      }),
      db.shipment.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        include: { order: { include: { customer: true } } },
      }),
    ]);

    // ==========================================
    // Aggregations
    // ==========================================
    const nonCancelledInvoices = invoices.filter((i) => i.status !== 'CANCELLED');
    const totalRevenue = nonCancelledInvoices.reduce((acc, i) => acc + i.grandTotal, 0);
    const taxableAmount = nonCancelledInvoices.reduce((acc, i) => acc + i.taxableAmount, 0);
    const totalGst = nonCancelledInvoices.reduce(
      (acc, i) => acc + (i.cgstAmount + i.sgstAmount + i.igstAmount),
      0
    );
    const totalCollections = payments
      .filter((p) => p.status === 'CONFIRMED')
      .reduce((acc, p) => acc + p.amount, 0);

    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = calculateProfit(totalRevenue, totalExpenses);
    const profitMargin = calculateMargin(netProfit, totalRevenue);

    // Production totals
    const totalPrintHours = Math.round(
      printJobs.reduce((acc, j) => acc + (j.actualTimeHours || j.estimatedTimeHours || 0), 0) * 10
    ) / 10;
    const completedJobs = printJobs.filter((j) => j.status === 'COMPLETED').length;
    const failedJobs = printJobs.filter((j) => ['FAILED', 'REPRINT'].includes(j.status)).length;
    const totalFilamentUsedG = Math.round(
      printJobs.reduce((acc, j) => acc + (j.actualFilamentG || j.estimatedFilamentG || 0), 0)
    );
    const totalScrapG = Math.round(
      printJobs.reduce((acc, j) => acc + (j.wasteFilamentG || 0), 0)
    );

    // Power consumption estimation
    const totalPowerKwh = Math.round(
      (totalPrintHours * (DEFAULT_PRICING_CONFIG.powerConsumptionWatts || 250)) / 1000 * 10
    ) / 10;
    const totalElectricityCost = Math.round(
      totalPowerKwh * (DEFAULT_PRICING_CONFIG.electricityRatePerKwh || 9.5)
    );

    // Quality metrics
    const passedQC = qcInspections.filter((q) => q.result === 'PASSED').length;
    const fpy = calculateFirstPassYield(passedQC, qcInspections.length);
    const defectCost = defects.reduce((acc, d) => acc + (d.costImpact || 0), 0);
    const scrapMaterialCost = Math.round(totalScrapG * 1.8);
    const totalCostOfQuality = defectCost + scrapMaterialCost;

    // Commercial Funnel
    const acceptedQuotes = quotes.filter((q) => ['ACCEPTED', 'CONVERTED'].includes(q.status)).length;
    const quoteWinRate = quotes.length > 0 ? Math.round((acceptedQuotes / quotes.length) * 100) : 0;

    // Report Title & Narrative synthesis
    let reportTitle = '';
    let executiveNarrative = '';

    if (reportType === 'DAILY') {
      reportTitle = `Daily Operational Flash — ${startDate.toLocaleDateString('en-IN')}`;
      executiveNarrative = `During the operating cycle of ${startDate.toLocaleDateString('en-IN')}, PRINTXO executed ${printJobs.length} print jobs across the farm, clocking ${totalPrintHours} machine hours. Total billings recorded ${formatCurrency(totalRevenue)} with ${formatCurrency(totalExpenses)} in recorded operating expenses. Quality FPY concluded at ${fpy}% with ${totalScrapG}g scrap generated. Fleet readiness remains optimal with ${printers.filter(p => p.status === 'AVAILABLE' || p.status === 'PRINTING').length} of ${printers.length} machines operational.`;
    } else if (reportType === 'WEEKLY') {
      reportTitle = `Weekly Business Review (WBR) — ${startDate.toLocaleDateString('en-IN')} to ${endDate.toLocaleDateString('en-IN')}`;
      executiveNarrative = `For the 7-day rolling period ending ${endDate.toLocaleDateString('en-IN')}, PRINTXO captured ${formatCurrency(totalRevenue)} in net sales revenue across ${orders.length} manufacturing orders, achieving an operating margin of ${profitMargin}%. Machine utilization logged ${totalPrintHours} runtime hours with a job completion rate of ${calculateFirstPassYield(completedJobs, printJobs.length)}%. First Pass Yield stands at ${fpy}%, with total cost of quality contained at ${formatCurrency(totalCostOfQuality)}. Quote conversion yielded ${quoteWinRate}% acceptance rate.`;
    } else {
      reportTitle = `Monthly Executive P&L & Operations Statement — ${startDate.toLocaleDateString('en-IN')} to ${endDate.toLocaleDateString('en-IN')}`;
      executiveNarrative = `For the monthly accounting period, PRINTXO closed with gross invoiced revenue of ${formatCurrency(totalRevenue)} and collections of ${formatCurrency(totalCollections)}. Operating profit finished at ${formatCurrency(netProfit)} representing an operating margin of ${profitMargin}%. Direct production absorbed ${totalFilamentUsedG}g of polymer material and consumed ${totalPowerKwh} kWh of electricity (valued at ${formatCurrency(totalElectricityCost)}). The farm operated with ${fpy}% FPY and logged ${complaints.length} customer complaints.`;
    }

    return NextResponse.json({
      success: true,
      company: COMPANY_DETAILS,
      reportType,
      reportTitle,
      period: {
        startDate,
        endDate,
        formattedStart: startDate.toLocaleDateString('en-IN'),
        formattedEnd: endDate.toLocaleDateString('en-IN'),
      },
      executiveNarrative,
      kpis: {
        totalRevenue,
        taxableAmount,
        totalGst,
        totalCollections,
        totalExpenses,
        netProfit,
        profitMargin,
        totalPrintHours,
        totalJobs: printJobs.length,
        completedJobs,
        failedJobs,
        totalFilamentUsedG,
        totalScrapG,
        totalPowerKwh,
        totalElectricityCost,
        fpy,
        totalCostOfQuality,
        ordersCount: orders.length,
        quotesCount: quotes.length,
        quoteWinRate,
        complaintsCount: complaints.length,
      },
      tables: {
        invoices: nonCancelledInvoices.map((i) => ({
          invoiceNumber: i.invoiceNumber,
          customer: i.customer.name,
          date: i.invoiceDate,
          taxableAmount: i.taxableAmount,
          tax: i.cgstAmount + i.sgstAmount + i.igstAmount,
          grandTotal: i.grandTotal,
          status: i.status,
        })),
        expenses: expenses.map((e) => ({
          code: e.expenseCode,
          category: e.category,
          description: e.description,
          amount: e.amount,
          date: e.expenseDate,
        })),
        printJobs: printJobs.map((j) => ({
          jobCode: j.jobCode,
          product: j.product?.name || 'Custom Part',
          printer: j.printer.name,
          hours: j.actualTimeHours || j.estimatedTimeHours,
          filamentG: j.actualFilamentG || j.estimatedFilamentG,
          status: j.status,
        })),
        qualityLog: qcInspections.map((q) => ({
          qcCode: q.qcCode,
          stage: q.inspectionStage,
          specification: q.specification,
          result: q.result,
          defectType: q.defectType || 'None',
        })),
      },
    });
  } catch (error: any) {
    console.error('Reports API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate report' },
      { status: 500 }
    );
  }
}
