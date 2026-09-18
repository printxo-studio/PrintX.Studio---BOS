// =========================================================
// PRINTXO BOS - CENTRALIZED BUSINESS CALCULATION ENGINE
// Section 10 (Pricing Engine) & Section 49 (Calculations)
// =========================================================

export interface PricingInput {
  // Filament & Material
  filamentWeightGrams: number;
  filamentCostPerKg: number; // in INR
  
  // Machine & Electricity
  printTimeHours: number;
  machineDepreciationPerHour: number; // in INR
  powerConsumptionWatts: number; // typically 150-350W
  electricityCostPerKwh: number; // in INR (typically ₹8-12)
  
  // Labor & Operations
  laborTimeHours: number;
  laborRatePerHour: number; // in INR
  
  // Post-processing & Add-ons
  postProcessingCost: number;
  designCadCost: number;
  packagingCost: number;
  shippingCost: number;
  
  // Business Parameters
  overheadPercent: number; // e.g. 15%
  desiredMarginPercent: number; // e.g. 40%
  taxRatePercent: number; // 18% GST default
}

export interface PricingBreakdown {
  materialCost: number;
  machineCost: number;
  electricityCost: number;
  laborCost: number;
  postProcessingCost: number;
  designCost: number;
  packagingCost: number;
  shippingCost: number;
  overheadCost: number;
  totalProductionCost: number;
  profitAmount: number;
  subtotal: number;
  taxAmount: number;
  finalPrice: number;
  marginPercent: number;
  costPerGram: number;
  costPerHour: number;
}

export function calculateQuotationPrice(input: PricingInput): PricingBreakdown {
  // 1. Material Cost: (grams / 1000) * costPerKg
  const materialCost = (input.filamentWeightGrams / 1000) * input.filamentCostPerKg;

  // 2. Machine Depreciation Cost
  const machineCost = input.printTimeHours * input.machineDepreciationPerHour;

  // 3. Electricity Cost: (Watts / 1000) * hours * ratePerKwh
  const electricityCost =
    (input.powerConsumptionWatts / 1000) *
    input.printTimeHours *
    input.electricityCostPerKwh;

  // 4. Labor Cost
  const laborCost = input.laborTimeHours * input.laborRatePerHour;

  // 5. Direct Costs Subtotal
  const directCosts =
    materialCost +
    machineCost +
    electricityCost +
    laborCost +
    input.postProcessingCost +
    input.designCadCost +
    input.packagingCost +
    input.shippingCost;

  // 6. Overhead Cost (% of direct costs)
  const overheadCost = directCosts * (input.overheadPercent / 100);

  // 7. Total Production Cost
  const totalProductionCost = directCosts + overheadCost;

  // 8. Profit based on desired margin %: Price = Cost / (1 - Margin%)
  const marginDecimal = Math.min(Math.max(input.desiredMarginPercent / 100, 0), 0.95);
  const subtotal = marginDecimal > 0 ? totalProductionCost / (1 - marginDecimal) : totalProductionCost;
  const profitAmount = subtotal - totalProductionCost;

  // 9. Taxes (GST)
  const taxAmount = subtotal * (input.taxRatePercent / 100);
  const finalPrice = Math.round(subtotal + taxAmount);

  return {
    materialCost: round(materialCost),
    machineCost: round(machineCost),
    electricityCost: round(electricityCost),
    laborCost: round(laborCost),
    postProcessingCost: round(input.postProcessingCost),
    designCost: round(input.designCadCost),
    packagingCost: round(input.packagingCost),
    shippingCost: round(input.shippingCost),
    overheadCost: round(overheadCost),
    totalProductionCost: round(totalProductionCost),
    profitAmount: round(profitAmount),
    subtotal: round(subtotal),
    taxAmount: round(taxAmount),
    finalPrice,
    marginPercent: round(input.desiredMarginPercent, 1),
    costPerGram: input.filamentWeightGrams > 0 ? round(totalProductionCost / input.filamentWeightGrams, 2) : 0,
    costPerHour: input.printTimeHours > 0 ? round(totalProductionCost / input.printTimeHours, 2) : 0,
  };
}

// ==========================================
// Operational Metrics Calculations
// ==========================================

export function calculateProfit(revenue: number, cost: number): number {
  return round(revenue - cost);
}

export function calculateMargin(profit: number, revenue: number): number {
  if (revenue <= 0) return 0;
  return round((profit / revenue) * 100, 1);
}

export function calculateFailureRate(failedJobs: number, totalJobs: number): number {
  if (totalJobs <= 0) return 0;
  return round((failedJobs / totalJobs) * 100, 1);
}

export function calculateFirstPassYield(passedJobs: number, totalJobs: number): number {
  if (totalJobs <= 0) return 0;
  return round((passedJobs / totalJobs) * 100, 1);
}

export function calculateWastePercentage(wasteGrams: number, totalGrams: number): number {
  if (totalGrams <= 0) return 0;
  return round((wasteGrams / totalGrams) * 100, 1);
}

export function calculatePrinterUtilization(actualPrintHours: number, availableHours: number): number {
  if (availableHours <= 0) return 0;
  return round((actualPrintHours / availableHours) * 100, 1);
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

function round(val: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}
