import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral' | 'accent';
  label?: string;
}

export function StatusBadge({ status, variant, label }: StatusBadgeProps) {
  // Derive variant automatically if not provided
  let computedVariant = variant;
  if (!computedVariant) {
    const s = (status || '').toUpperCase();
    if (['COMPLETED', 'PASSED', 'PAID', 'APPROVED', 'ACTIVE', 'IN_STOCK', 'WON', 'DELIVERED', 'SUCCESS'].includes(s)) {
      computedVariant = 'success';
    } else if (['PRINTING', 'IN_PROGRESS', 'IN_USE', 'IN_PRODUCTION'].includes(s)) {
      computedVariant = 'purple';
    } else if (['PENDING', 'LOW', 'MAINTENANCE', 'WARPING', 'NEGOTIATION', 'SCHEDULED', 'PAUSED'].includes(s)) {
      computedVariant = 'warning';
    } else if (['FAILED', 'CANCELLED', 'OVERDUE', 'EMPTY', 'DEFECTIVE', 'CRITICAL', 'LOST', 'REJECTED', 'ERROR'].includes(s)) {
      computedVariant = 'danger';
    } else if (['CONFIRMED', 'DISPATCHED', 'SHIPPED', 'QUALIFIED', 'OPENED', 'IN_TRANSIT', 'TESTING'].includes(s)) {
      computedVariant = 'info';
    } else {
      computedVariant = 'neutral';
    }
  }

  const displayLabel = label || status.replace(/_/g, ' ');

  return (
    <span className={`badge badge-${computedVariant}`}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: 'currentColor',
          display: 'inline-block',
        }}
      />
      {displayLabel}
    </span>
  );
}
