import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  subtext?: string;
  change?: {
    value: number | string;
    isPositive?: boolean;
  };
  icon?: LucideIcon;
  accentColor?: string;
}

export function KPICard({ label, value, subtext, change, icon: Icon, accentColor }: KPICardProps) {
  return (
    <div className="kpi-card" style={accentColor ? { borderLeft: `3px solid ${accentColor}` } : undefined}>
      <div className="kpi-header">
        <span className="kpi-label">{label}</span>
        {Icon && <Icon size={16} color={accentColor || 'var(--text-muted)'} />}
      </div>
      <div className="kpi-value">{value}</div>
      {(subtext || change) && (
        <div className="kpi-footer">
          {change && (
            <span
              style={{
                color: change.isPositive ? 'var(--status-success)' : 'var(--status-danger)',
                fontWeight: 600,
              }}
            >
              {change.isPositive ? '↑' : '↓'} {change.value}
            </span>
          )}
          {subtext && <span style={{ color: 'var(--text-muted)' }}>{subtext}</span>}
        </div>
      )}
    </div>
  );
}
