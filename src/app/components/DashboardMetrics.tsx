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
    color: 'teal',
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
    color: 'blue',
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
    color: 'orange',
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
    color: 'amber',
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
    color: 'red',
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
    color: 'green',
    colSpan: 'col-span-1 md:col-span-2',
    hero: false,
  },
];

const colorMap: Record<string, { accent: string; icon: string; value: string; ring: string; badge: string }> = {
  teal: {
    accent: 'bg-[#0f9b8e]',
    icon: 'bg-[#0f9b8e] text-white',
    value: 'text-[#0f766e]',
    ring: 'group-hover:border-[#0f9b8e]/50 group-hover:shadow-[#0f9b8e]/10',
    badge: 'text-success',
  },
  blue: {
    accent: 'bg-[#2563eb]',
    icon: 'bg-[#2563eb] text-white',
    value: 'text-[#1d4ed8]',
    ring: 'group-hover:border-[#2563eb]/50 group-hover:shadow-[#2563eb]/10',
    badge: 'text-success',
  },
  orange: {
    accent: 'bg-[#f59e0b]',
    icon: 'bg-[#f59e0b] text-white',
    value: 'text-[#d97706]',
    ring: 'group-hover:border-[#f59e0b]/50 group-hover:shadow-[#f59e0b]/10',
    badge: 'text-danger',
  },
  amber: {
    accent: 'bg-[#d97706]',
    icon: 'bg-[#d97706] text-white',
    value: 'text-[#b45309]',
    ring: 'group-hover:border-[#d97706]/50 group-hover:shadow-[#d97706]/10',
    badge: 'text-warning',
  },
  red: {
    accent: 'bg-[#dc2626]',
    icon: 'bg-[#dc2626] text-white',
    value: 'text-[#b91c1c]',
    ring: 'group-hover:border-[#dc2626]/50 group-hover:shadow-[#dc2626]/10',
    badge: 'text-danger',
  },
  green: {
    accent: 'bg-[#16a34a]',
    icon: 'bg-[#16a34a] text-white',
    value: 'text-[#15803d]',
    ring: 'group-hover:border-[#16a34a]/50 group-hover:shadow-[#16a34a]/10',
    badge: 'text-success',
  },
};

export default function DashboardMetrics() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-6 gap-4">
      {metrics.map((metric) => {
        const colors = colorMap[metric.color];
        return (
          <div
            key={metric.id}
            className={`card group relative overflow-hidden border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${colors.ring} ${metric.colSpan} ${metric.hero ? 'lg:col-span-2' : ''}`}
          >
            <span className={`absolute inset-x-0 top-0 h-1 ${colors.accent}`} />
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-lg shadow-sm ${colors.icon}`}>
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
            <p className={`tabular-nums font-bold ${colors.value} ${metric.hero ? 'text-3xl' : 'text-2xl'}`}>
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
