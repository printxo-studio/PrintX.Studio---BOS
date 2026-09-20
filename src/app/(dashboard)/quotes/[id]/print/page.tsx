'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { COMPANY_DETAILS } from '@/lib/constants';
import { Printer } from 'lucide-react';

export default function QuotePrintPage() {
  const params = useParams();
  const [quote, setQuote] = useState<any | null>(null);
  const [settings, setSettings] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    Promise.all([
      fetch(`/api/quotes/${params.id}`).then((res) => (res.ok ? res.json() : null)),
      fetch('/api/settings').then((res) => (res.ok ? res.json() : null)),
    ]).then(([quoteData, settingsData]) => {
      setQuote(quoteData);
      if (settingsData && settingsData.settings) {
        setSettings(settingsData.settings);
      }
      setLoading(false);
    });
  }, [params.id]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading proposal...</div>;
  if (!quote) return <div style={{ padding: 40, textAlign: 'center' }}>Quotation not found.</div>;

  const isGst = settings ? settings.gstEnabled : false;
  const cgst = isGst ? Math.round(quote.taxAmount / 2) : 0;
  const sgst = isGst ? quote.taxAmount - cgst : 0;
  const grandTotal = isGst ? quote.grandTotal : (quote.subtotal + (quote.packagingCost || 0) + (quote.shippingCost || 0));

  return (
    <div
      style={{
        maxWidth: 820,
        margin: '0 auto',
        padding: '36px 40px',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontFamily: 'Inter, -apple-system, sans-serif',
        minHeight: '100vh',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }}
    >
      {/* Non-printable Print Toolbar */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 30,
          paddingBottom: 16,
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <span style={{ fontSize: 13, color: '#64748b' }}>
          Quotation Proposal Preview &bull; {isGst ? 'GST Mode Active' : 'Commercial Non-GST Mode'}
        </span>
        <button
          onClick={() => window.print()}
          className="btn btn-primary btn-sm"
          style={{
            backgroundColor: '#e11d48',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 16px',
            borderRadius: 4,
            cursor: 'pointer',
            border: 'none',
            fontWeight: 600,
          }}
        >
          <Printer size={15} /> Print / Save as PDF
        </button>
      </div>

      {/* DOCUMENT HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div
              style={{
                width: 200,
                height: 52,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                marginBottom: 8,
              }}
            >
              <img
                src={settings?.logoUrl || '/logo.png'}
                alt="PrintX Studio"
                style={{ height: 52, width: 'auto', maxWidth: 200, objectFit: 'contain' }}
              />
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: '#64748b', lineHeight: 1.45 }}>
            {settings?.address || COMPANY_DETAILS.address}, {settings?.city || COMPANY_DETAILS.city} - {settings?.pincode || COMPANY_DETAILS.pincode}
            <br />
            {isGst && (settings?.gstin || COMPANY_DETAILS.gstin) && (
              <span>
                GSTIN: <strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>{settings?.gstin || COMPANY_DETAILS.gstin}</strong> &bull;{' '}
              </span>
            )}
            Email: {settings?.email || COMPANY_DETAILS.email}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#e11d48', letterSpacing: '0.05em' }}>
            QUOTATION
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
            {quote.quoteNumber}
          </div>
          <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>
            Date: <strong>{new Date(quote.date).toLocaleDateString()}</strong>
            <br />
            Valid Until: <strong>{new Date(quote.validUntil).toLocaleDateString()}</strong>
          </div>
        </div>
      </div>

      {/* BILL TO / CUSTOMER */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: 20,
          backgroundColor: '#f8fafc',
          padding: '16px 20px',
          borderRadius: 6,
          border: '1px solid #e2e8f0',
          marginBottom: 28,
          fontSize: 12.5,
        }}
      >
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 }}>
            Quotation Prepared For:
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{quote.customer.name}</div>
          {quote.customer.company && (
            <div style={{ fontWeight: 600, color: '#334155' }}>{quote.customer.company}</div>
          )}
          <div style={{ color: '#64748b', marginTop: 2 }}>{quote.customer.address || 'Bangalore, Karnataka'}</div>
          {isGst && quote.customer.gstin && (
            <div style={{ marginTop: 4 }}>
              GSTIN: <strong style={{ fontFamily: 'monospace' }}>{quote.customer.gstin}</strong>
            </div>
          )}
        </div>

        <div style={{ fontSize: 12, lineHeight: 1.6 }}>
          <div>
            <span style={{ color: '#64748b' }}>Delivery Estimate:</span>{' '}
            <strong>{quote.deliveryEstimate || '3-5 Working Days'}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Payment Terms:</span>{' '}
            <strong>{quote.paymentTerms || '50% Advance'}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Prepared By:</span>{' '}
            <strong>{quote.preparedBy || 'PrintXO Studio'}</strong>
          </div>
        </div>
      </div>

      {/* LINE ITEMS TABLE */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 12.5,
          marginBottom: 24,
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>#</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Description</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Material & Specs</th>
            <th style={{ padding: '10px 12px', textAlign: 'center' }}>Qty</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Unit Price</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {quote.items.map((item: any, idx: number) => (
            <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px', color: '#64748b' }}>{idx + 1}</td>
              <td style={{ padding: '12px' }}>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                {item.description && (
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{item.description}</div>
                )}
              </td>
              <td style={{ padding: '12px' }}>
                <span
                  style={{
                    backgroundColor: '#e2e8f0',
                    padding: '2px 6px',
                    borderRadius: 3,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {item.material || 'PLA'}
                </span>
                {item.printTimeHours && (
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    {item.printTimeHours}h print &bull; {item.filamentGrams}g
                  </div>
                )}
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
              <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace' }}>
                ₹{item.unitPrice}
              </td>
              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>
                ₹{item.lineTotal}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTALS & TAX BREAKDOWN */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
        <div style={{ width: '320px', fontSize: 12.5, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Subtotal:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>₹{quote.subtotal}</span>
          </div>

          {quote.packagingCost > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Packaging:</span>
              <span style={{ fontFamily: 'monospace' }}>₹{quote.packagingCost}</span>
            </div>
          )}

          {quote.shippingCost > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Shipping / Logistics:</span>
              <span style={{ fontFamily: 'monospace' }}>₹{quote.shippingCost}</span>
            </div>
          )}

          {/* Conditional Taxes based on GST toggle */}
          {isGst && quote.taxAmount > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: 6 }}>
                <span style={{ color: '#64748b' }}>CGST (9.0%):</span>
                <span style={{ fontFamily: 'monospace' }}>₹{cgst}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>SGST (9.0%):</span>
                <span style={{ fontFamily: 'monospace' }}>₹{sgst}</span>
              </div>
            </>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '2px solid #0f172a',
              paddingTop: 8,
              fontSize: 16,
              fontWeight: 900,
              color: '#0f172a',
            }}
          >
            <span>Grand Total:</span>
            <span style={{ color: '#e11d48' }}>₹{grandTotal}</span>
          </div>
        </div>
      </div>

      {/* TERMS & SIGNATURE */}
      <div
        style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: 18,
          fontSize: 11,
          color: '#64748b',
          lineHeight: 1.6,
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: 24,
        }}
      >
        <div>
          <div style={{ fontWeight: 700, color: '#334155', marginBottom: 4 }}>Standard Additive Terms:</div>
          <div>1. 50% advance required prior to production scheduling.</div>
          <div>2. Slicer dimensional tolerance standard: ISO/ASTM 52920 (±0.15mm typical FDM/FFF).</div>
          <div>3. Final parts undergo 100% first-pass QC inspection prior to dispatch.</div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>PRINTXO Studio</div>
          <div style={{ marginTop: 32, borderTop: '1px solid #94a3b8', display: 'inline-block', width: 160 }}>
            Authorized Signatory
          </div>
        </div>
      </div>

      {/* Print Stylesheet */}
      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print,
          aside,
          header {
            display: none !important;
          }
          .main-content,
          .page-body {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
