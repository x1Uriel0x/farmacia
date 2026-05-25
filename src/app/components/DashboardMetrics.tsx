import React from 'react';
import { TrendingUp, TrendingDown, Package, AlertTriangle, Clock, DollarSign, FileText, ShoppingBag } from 'lucide-react';

const metrics = [
  {
    id: 'metric-ventas-dia',
    label: 'Ventas del Día',
    value: '$1,847.50',
    change: '+12.4%',
    trend: 'up' as const,
    icon: <DollarSign size={20} />,
    color: 'primary',
    colSpan: 'col-span-1 md:col-span-2',
    hero: true,
  },
  {
    id: 'metric-facturas-hoy',
    label: 'Facturas Emitidas Hoy',
    value: '38',
    change: '+5 vs ayer',
    trend: 'up' as const,
    icon: <FileText size={20} />,
    color: 'info',
    colSpan: 'col-span-1',
    hero: false,
  },
  {
    id: 'metric-unidades-vendidas',
    label: 'Unidades Vendidas',
    value: '214',
    change: '-3.1%',
    trend: 'down' as const,
    icon: <ShoppingBag size={20} />,
    color: 'secondary',
    colSpan: 'col-span-1',
    hero: false,
  },
  {
    id: 'metric-bajo-stock',
    label: 'Bajo Stock',
    value: '3',
    change: 'Requieren reorden',
    trend: 'alert' as const,
    icon: <AlertTriangle size={20} />,
    color: 'warning',
    colSpan: 'col-span-1',
    hero: false,
  },
  {
    id: 'metric-por-vencer',
    label: 'Por Vencer (30d)',
    value: '2',
    change: 'Lotes críticos',
    trend: 'alert' as const,
    icon: <Clock size={20} />,
    color: 'danger',
    colSpan: 'col-span-1',
    hero: false,
  },
  {
    id: 'metric-valor-inventario',
    label: 'Valor del Inventario',
    value: '$48,320',
    change: '+$1,200 esta semana',
    trend: 'up' as const,
    icon: <Package size={20} />,
    color: 'success',
    colSpan: 'col-span-1 md:col-span-2',
    hero: false,
  },
];

const colorMap: Record<string, { bg: string; icon: string; badge: string }> = {
  primary: { bg: 'bg-primary/5 border-primary/20', icon: 'bg-primary/10 text-primary', badge: 'text-success' },
  info: { bg: 'bg-info-bg border-info/20', icon: 'bg-info/10 text-info', badge: 'text-success' },
  secondary: { bg: 'bg-muted border-border', icon: 'bg-secondary text-secondary-foreground', badge: 'text-danger' },
  warning: { bg: 'bg-warning-bg border-warning/30', icon: 'bg-warning/10 text-warning', badge: 'text-warning' },
  danger: { bg: 'bg-danger-bg border-danger/30', icon: 'bg-danger/10 text-danger', badge: 'text-danger' },
  success: { bg: 'bg-success-bg border-success/20', icon: 'bg-success/10 text-success', badge: 'text-success' },
};

export default function DashboardMetrics() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-6 gap-4">
      {metrics.map((metric) => {
        const colors = colorMap[metric.color];
        return (
          <div
            key={metric.id}
            className={`card p-5 border ${colors.bg} ${metric.colSpan} ${metric.hero ? 'lg:col-span-2' : ''}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${colors.icon}`}>
                {metric.icon}
              </div>
              {metric.trend === 'up' && (
                <TrendingUp size={14} className="text-success mt-1" />
              )}
              {metric.trend === 'down' && (
                <TrendingDown size={14} className="text-danger mt-1" />
              )}
            </div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              {metric.label}
            </p>
            <p className={`tabular-nums font-bold text-foreground ${metric.hero ? 'text-3xl' : 'text-2xl'}`}>
              {metric.value}
            </p>
            <p className={`text-xs mt-1 font-medium ${colors.badge}`}>
              {metric.change}
            </p>
          </div>
        );
      })}
    </div>
  );
}