'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { formatCurrency } from '@/lib/calculations';
import { Printer } from 'lucide-react';

export default function InvoicePrintPage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<any | null>(null);
  const [settings, setSettings] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    Promise.all([
      fetch(`/api/finance/invoices/${params.id}`).then((res) => (res.ok ? res.json() : null)),
      fetch('/api/settings').then((res) => (res.ok ? res.json() : null)),
    ]).then(([invData, settsData]) => {
      setInvoice(invData);
      if (settsData && settsData.settings) {
        setSettings(settsData.settings);
      }
      setLoading(false);
    });
  }, [params.id]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading invoice...</div>;
  if (!invoice) return <div style={{ padding: 40, textAlign: 'center' }}>Invoice not found.</div>;

  const isGst = settings?.gstEnabled || false;
  const companyGstin = settings?.gstin || '';
  const invoiceTitle = isGst
    ? (settings?.invoiceTypeWithGst || 'TAX INVOICE')
    : (settings?.invoiceTypeWithoutGst || 'BILL OF SUPPLY / COMMERCIAL INVOICE');

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
      {/* Print Toolbar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            Invoice Preview &bull; Mode:{' '}
            <strong style={{ color: isGst ? '#15803d' : '#e11d48' }}>
              {isGst ? 'Full GST Mode (Tax Invoice)' : 'Non-GST Mode (Bill of Supply)'}
            </strong>
          </span>
        </div>
        <button
          onClick={() => window.print()}
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
            fontSize: 13,
          }}
        >
          <Printer size={15} /> Print / Save as PDF
        </button>
      </div>

      {/* DOCUMENT HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div
              style={{
                width: 180,
                height: 54,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                marginBottom: 6,
              }}
            >
              <img
                src={settings?.logoUrl || '/logo.png'}
                alt=""
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
              />
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: '#64748b', lineHeight: 1.45 }}>
            {settings?.address || 'Industrial Area, Phase II'}, {settings?.city || 'Bangalore'} - {settings?.pincode || '560058'}
            <br />
            {isGst && companyGstin && (
              <span>
                GSTIN: <strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>{companyGstin}</strong> &bull;{' '}
              </span>
            )}
            Email: {settings?.email || 'printxo.studio@gmail.com'}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#090a0c', letterSpacing: '0.04em' }}>
            {invoiceTitle}
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#e11d48', fontFamily: 'monospace', marginTop: 2 }}>
            {invoice.invoiceNumber}
          </div>
          <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>
            Invoice Date: <strong>{new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}</strong>
            <br />
            Due Date: <strong>{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</strong>
          </div>
          <div style={{ marginTop: 6 }}>
            <span
              style={{
                padding: '3px 8px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 700,
                backgroundColor: invoice.status === 'PAID' ? '#dcfce7' : '#fef3c7',
                color: invoice.status === 'PAID' ? '#15803d' : '#b45309',
                border: '1px solid currentColor',
              }}
            >
              {invoice.status}
            </span>
          </div>
        </div>
      </div>

      {/* BILL TO & SHIP TO */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
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
            Billed To:
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{invoice.customer.name}</div>
          {invoice.customer.company && (
            <div style={{ fontWeight: 600, color: '#334155' }}>{invoice.customer.company}</div>
          )}
          <div style={{ color: '#64748b', marginTop: 2 }}>{invoice.billingAddress || 'Bangalore, Karnataka'}</div>
          {invoice.gstin && isGst && (
            <div style={{ marginTop: 4 }}>
              Customer GSTIN: <strong style={{ fontFamily: 'monospace' }}>{invoice.gstin}</strong>
            </div>
          )}
        </div>

        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 }}>
            Shipped To:
          </div>
          <div style={{ color: '#334155' }}>{invoice.shippingAddress || invoice.billingAddress || 'Same as billing'}</div>
          <div style={{ marginTop: 8, fontSize: 12 }}>
            <span style={{ color: '#64748b' }}>Terms of Payment:</span>{' '}
            <strong>{invoice.paymentTerms || 'Due on Receipt'}</strong>
          </div>
        </div>
      </div>

      {/* INVOICE ITEMS TABLE */}
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
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Description of Goods / Services</th>
            <th style={{ padding: '10px 12px', textAlign: 'center' }}>HSN/SAC</th>
            <th style={{ padding: '10px 12px', textAlign: 'center' }}>Qty</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Rate</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item: any, idx: number) => (
            <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px', color: '#64748b' }}>{idx + 1}</td>
              <td style={{ padding: '12px', fontWeight: 600 }}>{item.description}</td>
              <td style={{ padding: '12px', textAlign: 'center', fontFamily: 'monospace', color: '#64748b' }}>
                {item.hsnSacCode || '8477'}
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
              <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace' }}>
                ₹{item.rate}
              </td>
              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>
                ₹{item.amount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTALS & TAX BREAKDOWN (CGST/SGST/IGST OR NON-GST) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        {/* Bank & UPI Transfer Details */}
        <div
          style={{
            maxWidth: 340,
            padding: '12px 16px',
            backgroundColor: '#f8fafc',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            fontSize: 11.5,
            lineHeight: 1.6,
          }}
        >
          <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
            Bank & UPI Transfer Details:
          </div>
          <div>Bank: <strong>HDFC Bank Ltd</strong></div>
          <div>A/C Name: <strong>PRINTXO Additive Technologies</strong></div>
          <div>A/C Number: <strong style={{ fontFamily: 'monospace' }}>50200098765432</strong></div>
          <div>IFSC Code: <strong style={{ fontFamily: 'monospace' }}>HDFC0001234</strong></div>
          <div>UPI ID: <strong style={{ fontFamily: 'monospace' }}>printxo.studio@hdfcbank</strong></div>
        </div>

        {/* Totals Column */}
        <div style={{ width: '320px', fontSize: 12.5, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Subtotal:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>₹{invoice.subtotal}</span>
          </div>

          {invoice.shippingAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Shipping / Freight:</span>
              <span style={{ fontFamily: 'monospace' }}>₹{invoice.shippingAmount}</span>
            </div>
          )}

          {/* Conditional Taxes based on GST Mode */}
          {isGst && (invoice.cgstAmount > 0 || invoice.sgstAmount > 0 || invoice.igstAmount > 0) && (
            <>
              {invoice.cgstAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: 6 }}>
                  <span style={{ color: '#64748b' }}>CGST (9.0%):</span>
                  <span style={{ fontFamily: 'monospace' }}>₹{invoice.cgstAmount}</span>
                </div>
              )}

              {invoice.sgstAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>SGST (9.0%):</span>
                  <span style={{ fontFamily: 'monospace' }}>₹{invoice.sgstAmount}</span>
                </div>
              )}

              {invoice.igstAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: 6 }}>
                  <span style={{ color: '#64748b' }}>IGST (18.0%):</span>
                  <span style={{ fontFamily: 'monospace' }}>₹{invoice.igstAmount}</span>
                </div>
              )}
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
            <span style={{ color: '#e11d48' }}>₹{invoice.grandTotal}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803d', fontWeight: 600 }}>
            <span>Amount Paid:</span>
            <span style={{ fontFamily: 'monospace' }}>₹{invoice.amountPaid}</span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '1px solid #e2e8f0',
              paddingTop: 6,
              fontWeight: 800,
              color: invoice.balanceDue > 0 ? '#b45309' : '#15803d',
            }}
          >
            <span>Balance Due:</span>
            <span style={{ fontFamily: 'monospace' }}>₹{invoice.balanceDue}</span>
          </div>
        </div>
      </div>

      {/* SIGNATURE & LEGAL DISCLAIMER */}
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
          <div style={{ fontWeight: 700, color: '#334155', marginBottom: 2 }}>Terms & Conditions:</div>
          <div>1. Goods once manufactured as per custom CAD specification cannot be returned.</div>
          <div>2. Payment is due as per agreed terms from the date of invoice.</div>
          {!isGst && (
            <div style={{ color: '#0f172a', fontWeight: 600, marginTop: 4 }}>
              * Declaration: {settings?.taxExemptionNote || 'Issued by unregistered supplier under GST Law. No tax is charged.'}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
          <div style={{ width: 160, borderBottom: '1px solid #cbd5e1', marginBottom: 6 }} />
          <div style={{ fontWeight: 800, color: '#0f172a' }}>For PRINTXO</div>
          <div style={{ fontSize: 10.5, color: '#64748b' }}>Authorized Signatory</div>
        </div>
      </div>

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
        }
      `}</style>
    </div>
  );
}
