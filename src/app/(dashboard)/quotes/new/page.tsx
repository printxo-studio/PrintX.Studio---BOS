'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FileText,
  Plus,
  Trash2,
  Calculator,
  ArrowRight,
  ShieldCheck,
  Disc,
  Clock,
  Zap,
  DollarSign,
  AlertCircle,
  Building,
  UserCheck,
} from 'lucide-react';
import {
  calculateQuotationPrice,
  formatCurrency,
  PricingInput,
} from '@/lib/calculations';
import { DEFAULT_PRICING_CONFIG } from '@/lib/constants';

interface LineItem {
  name: string;
  description: string;
  quantity: number;
  material: string;
  printTimeHours: number;
  filamentGrams: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  lineTotal: number;
}

function NewQuoteWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCustomerId = searchParams.get('customerId') || '';

  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(preselectedCustomerId);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) setSettings(data.settings);
      })
      .catch(() => {});
  }, []);

  // Line items
  const [items, setItems] = useState<LineItem[]>([
    {
      name: 'Custom 3D Print Part',
      description: 'Functional high precision part printed per CAD specification',
      quantity: 1,
      material: 'PLA',
      printTimeHours: 4.5,
      filamentGrams: 120,
      unitPrice: 850,
      discount: 0,
      taxRate: 18.0,
      lineTotal: 850,
    },
  ]);

  // Integrated Pricing Engine Inputs (Section 10)
  const [pricingParams, setPricingParams] = useState<PricingInput>({
    filamentWeightGrams: 120,
    filamentCostPerKg: 1800,
    printTimeHours: 4.5,
    machineDepreciationPerHour: DEFAULT_PRICING_CONFIG.machineDepreciationPerHour,
    powerConsumptionWatts: DEFAULT_PRICING_CONFIG.powerConsumptionWatts,
    electricityCostPerKwh: DEFAULT_PRICING_CONFIG.electricityRatePerKwh,
    laborTimeHours: 0.5,
    laborRatePerHour: DEFAULT_PRICING_CONFIG.laborRatePerHour,
    postProcessingCost: 150,
    designCadCost: 0,
    packagingCost: 80,
    shippingCost: 250,
    overheadPercent: DEFAULT_PRICING_CONFIG.overheadPercent,
    desiredMarginPercent: DEFAULT_PRICING_CONFIG.defaultMarginPercent,
    taxRatePercent: DEFAULT_PRICING_CONFIG.defaultGstRate,
  });

  // Additional costs applied to quote total
  const [additionalCosts, setAdditionalCosts] = useState({
    designCost: 0,
    cadCost: 0,
    postProcessCost: 150,
    packagingCost: 80,
    shippingCost: 250,
    otherCost: 0,
  });

  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentTerms, setPaymentTerms] = useState('50% Advance, 50% Before Dispatch');
  const [deliveryEstimate, setDeliveryEstimate] = useState('3-5 Business Days');
  const [notes, setNotes] = useState('Pricing valid for 30 days. Material tolerances ±0.15mm.');

  // Load customer directory
  useEffect(() => {
    fetch('/api/crm/customers')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setCustomers(data);
        if (!selectedCustomerId && data.length > 0) {
          setSelectedCustomerId(data[0].id);
        }
      });
  }, []);

  // Recalculate price breakdown using centralized pricing engine
  const breakdown = calculateQuotationPrice(pricingParams);

  // Auto-update first item's unit price if calculator is applied
  const applyCalculatorToActiveItem = (index: number) => {
    const updated = [...items];
    updated[index].unitPrice = breakdown.finalPrice;
    updated[index].lineTotal = Math.round(breakdown.finalPrice * updated[index].quantity);
    updated[index].printTimeHours = pricingParams.printTimeHours;
    updated[index].filamentGrams = pricingParams.filamentWeightGrams;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        name: 'New Line Item',
        description: '',
        quantity: 1,
        material: 'PLA',
        printTimeHours: 2.0,
        filamentGrams: 50,
        unitPrice: 450,
        discount: 0,
        taxRate: 18.0,
        lineTotal: 450,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof LineItem, val: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = val;

    // Recalculate line total
    const qty = updated[index].quantity || 1;
    const price = updated[index].unitPrice || 0;
    const disc = updated[index].discount || 0;
    updated[index].lineTotal = Math.round(qty * price - disc);

    setItems(updated);
  };

  // Calculate quote totals with conditional GST
  const isGst = settings ? settings.gstEnabled : false;
  const gstRate = isGst ? (settings?.defaultGstRate || 18.0) : 0;
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const discountTotal = Math.round((subtotal * discountPercent) / 100);
  const taxableAmount = subtotal - discountTotal + additionalCosts.shippingCost + additionalCosts.packagingCost;
  const taxAmount = isGst ? Math.round(taxableAmount * (gstRate / 100)) : 0;
  const grandTotal = taxableAmount + taxAmount;

  const totalFilamentGrams = items.reduce((sum, item) => sum + (item.filamentGrams || 0) * item.quantity, 0);
  const totalPrintHours = items.reduce((sum, item) => sum + (item.printTimeHours || 0) * item.quantity, 0);

  const handleSubmitQuote = async (status: 'DRAFT' | 'SENT') => {
    if (!selectedCustomerId) {
      alert('Please select a customer for this quote.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          status,
          paymentTerms,
          deliveryEstimate,
          notes,
          items,

          // Breakdown
          subtotal,
          discountValue: discountPercent,
          discountTotal,
          taxRate: 18.0,
          taxAmount,
          grandTotal,
          shippingCost: additionalCosts.shippingCost,
          packagingCost: additionalCosts.packagingCost,
          designCost: additionalCosts.designCost,
          cadCost: additionalCosts.cadCost,
          postProcessCost: additionalCosts.postProcessCost,
          estimatedCost: breakdown.totalProductionCost * items.length,
          estimatedProfit: grandTotal - (breakdown.totalProductionCost * items.length),
          marginPercent: breakdown.marginPercent,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        router.push(`/quotes/${created.id}`);
      } else {
        alert('Failed to save quotation');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="breadcrumbs">
        <Link href="/quotes">Quotations</Link>
        <span>/</span>
        <span>New Quote Wizard</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Calculator size={22} color="var(--accent-red)" /> 3D Print Quotation Generator
          </h1>
          <p className="page-subtitle">
            Configure line items &bull; Run real-time machine & material cost calculations &bull; {isGst ? 'Issue GST proposal' : 'Issue commercial proposal'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => handleSubmitQuote('DRAFT')}
            className="btn btn-secondary btn-sm"
            disabled={loading}
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSubmitQuote('SENT')}
            className="btn btn-primary btn-sm"
            disabled={loading}
          >
            Generate & Issue Quote →
          </button>
        </div>
      </div>

      {/* 2-COLUMN LAYOUT: ITEMS & PRICING ENGINE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, alignItems: 'flex-start' }}>
        {/* LEFT COLUMN: CUSTOMER & LINE ITEMS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Customer Selection */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <UserCheck size={16} color="var(--accent-red)" /> Customer Information
              </div>
              <Link href="/customers" style={{ fontSize: 11.5, color: 'var(--accent-red)' }}>
                + Add Customer
              </Link>
            </div>

            <div className="form-group">
              <label className="form-label">Select Customer *</label>
              <select
                className="form-control"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customerCode} - {c.name} {c.company ? `(${c.company})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Line Items Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <FileText size={16} color="var(--accent-red)" /> Quotation Line Items
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: 11 }}
              >
                <Plus size={13} /> Add Item
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 14,
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--accent-red)' }}>
                      Item #{idx + 1}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => applyCalculatorToActiveItem(idx)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: 10.5, padding: '2px 8px' }}
                        title="Apply calculator cost to this item"
                      >
                        Apply Calculated Price (₹{breakdown.finalPrice})
                      </button>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: 4, color: 'var(--status-danger)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Part Name / SKU</label>
                      <input
                        type="text"
                        className="form-control"
                        value={item.name}
                        onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                        placeholder="e.g. Drone Motor Mount Arm"
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Material</label>
                      <select
                        className="form-control"
                        value={item.material}
                        onChange={(e) => handleItemChange(idx, 'material', e.target.value)}
                      >
                        <option value="PLA">PLA (Matte / Pro)</option>
                        <option value="PETG">PETG (Engineering)</option>
                        <option value="ABS">ABS / ASA</option>
                        <option value="TPU">TPU-95A (Flexible)</option>
                        <option value="PA-CF">PA-CF (Carbon Fiber)</option>
                        <option value="PC">Polycarbonate</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Print Time (h)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        value={item.printTimeHours}
                        onChange={(e) => handleItemChange(idx, 'printTimeHours', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Filament (g)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={item.filamentGrams}
                        onChange={(e) => handleItemChange(idx, 'filamentGrams', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Unit Price (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 13, fontWeight: 700 }}>
                    <span>Line Total: ₹{item.lineTotal}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Terms & Notes */}
          <div className="card">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Payment Terms</label>
                <input
                  type="text"
                  className="form-control"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Delivery</label>
                <input
                  type="text"
                  className="form-control"
                  value={deliveryEstimate}
                  onChange={(e) => setDeliveryEstimate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Proposal Notes & Tolerances</label>
              <textarea
                className="form-control"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PRICING ENGINE CALCULATOR (Section 10) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ borderTop: '3px solid var(--accent-red)' }}>
            <div className="card-header">
              <div className="card-title">
                <Zap size={16} color="var(--accent-red)" /> Pricing Engine (Section 10)
              </div>
              <span className="badge badge-accent" style={{ fontSize: 10 }}>
                Configurable
              </span>
            </div>

            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 14 }}>
              Calculates real shop floor production cost + power + depreciation + labor + desired margin.
            </p>

            {/* Calculator Parameter Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: 10.5 }}>Part Weight (g)</label>
                <input
                  type="number"
                  className="form-control"
                  value={pricingParams.filamentWeightGrams}
                  onChange={(e) =>
                    setPricingParams({ ...pricingParams, filamentWeightGrams: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: 10.5 }}>Print Time (h)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-control"
                  value={pricingParams.printTimeHours}
                  onChange={(e) =>
                    setPricingParams({ ...pricingParams, printTimeHours: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: 10.5 }}>Spool Cost (₹/kg)</label>
                <input
                  type="number"
                  className="form-control"
                  value={pricingParams.filamentCostPerKg}
                  onChange={(e) =>
                    setPricingParams({ ...pricingParams, filamentCostPerKg: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: 10.5 }}>Desired Margin (%)</label>
                <input
                  type="number"
                  className="form-control"
                  value={pricingParams.desiredMarginPercent}
                  onChange={(e) =>
                    setPricingParams({ ...pricingParams, desiredMarginPercent: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            {/* Cost Breakdown Table */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                fontSize: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Material Cost:</span>
                <span>₹{breakdown.materialCost}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Machine Wear & Tear:</span>
                <span>₹{breakdown.machineCost}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Electricity (Bescom):</span>
                <span>₹{breakdown.electricityCost}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Post Processing:</span>
                <span>₹{breakdown.postProcessingCost}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Overhead (15%):</span>
                <span>₹{breakdown.overheadCost}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-default)',
                  paddingTop: 6,
                  fontWeight: 600,
                }}
              >
                <span>Total Unit Cost:</span>
                <span>₹{breakdown.totalProductionCost}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--status-success)' }}>
                <span>Profit Markup ({breakdown.marginPercent}%):</span>
                <span>+₹{breakdown.profitAmount}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-default)',
                  paddingTop: 8,
                  fontSize: 14,
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                }}
              >
                <span>Calculated Unit Price:</span>
                <span style={{ color: 'var(--accent-red)' }}>₹{breakdown.finalPrice}</span>
              </div>
            </div>
          </div>

          {/* QUOTE SUMMARY CARD */}
          <div className="card" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <div className="card-title" style={{ marginBottom: 14 }}>
              Quote Commercial Summary
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Items Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Filament Est.:</span>
                <span>{totalFilamentGrams} grams</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Print Time Est.:</span>
                <span>{totalPrintHours.toFixed(1)} hours</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Packaging & Shipping:</span>
                <span>₹{additionalCosts.shippingCost + additionalCosts.packagingCost}</span>
              </div>
              {isGst && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>GST ({gstRate}%):</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '2px solid var(--border-default)',
                  paddingTop: 10,
                  fontSize: 16,
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                }}
              >
                <span>Grand Total:</span>
                <span style={{ color: 'var(--status-success)' }}>{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                type="button"
                onClick={() => handleSubmitQuote('SENT')}
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Save & Issue Quotation →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewQuotePage() {
  return (
    <Suspense fallback={<div className="card" style={{ margin: 24, textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading Quotation Builder...</div>}>
      <NewQuoteWizard />
    </Suspense>
  );
}

