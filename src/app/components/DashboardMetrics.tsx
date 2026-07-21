'use client';

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Clock,
  DollarSign,
  FileText,
  ShoppingBag,
} from 'lucide-react';
import { normalizeMetricas, type DashboardMetricas } from './dashboardData';

const colorMap: Record<
  string,
  {
    accent: string;
    icon: string;
    value: string;
    ring: string;
    badge: string;
  }
> = {
  teal: {
    accent: 'bg-[#2563EB]',
    icon: 'bg-[#2563EB] text-white',
    value: 'text-[#1D4ED8]',
    ring: 'group-hover:border-[#2563EB]/50 group-hover:shadow-[#2563EB]/15',
    badge: 'text-success',
  },
  blue: {
    accent: 'bg-[#06B6D4]',
    icon: 'bg-[#06B6D4] text-white',
    value: 'text-[#0891B2]',
    ring: 'group-hover:border-[#06B6D4]/50 group-hover:shadow-[#06B6D4]/15',
    badge: 'text-success',
  },
  orange: {
    accent: 'bg-[#1E3A8A]',
    icon: 'bg-[#1E3A8A] text-white',
    value: 'text-[#1E3A8A]',
    ring: 'group-hover:border-[#1E3A8A]/40 group-hover:shadow-[#1E3A8A]/15',
    badge: 'text-success',
  },
  amber: {
    accent: 'bg-[#f59e0b]',
    icon: 'bg-[#f59e0b] text-white',
    value: 'text-[#b45309]',
    ring: 'group-hover:border-[#f59e0b]/50 group-hover:shadow-[#f59e0b]/15',
    badge: 'text-warning',
  },
  red: {
    accent: 'bg-[#ef4444]',
    icon: 'bg-[#ef4444] text-white',
    value: 'text-[#dc2626]',
    ring: 'group-hover:border-[#ef4444]/50 group-hover:shadow-[#ef4444]/15',
    badge: 'text-danger',
  },
  green: {
    accent: 'bg-[#10B981]',
    icon: 'bg-[#10B981] text-white',
    value: 'text-[#059669]',
    ring: 'group-hover:border-[#10B981]/50 group-hover:shadow-[#10B981]/15',
    badge: 'text-success',
  },
};

export default function DashboardMetrics() {
  const [metricas, setMetricas] = useState<DashboardMetricas>({
    ventasDia: 0,
    facturasHoy: 0,
    unidadesVendidas: 0,
    bajoStock: 0,
    stockAgotado: 0,
    porVencer: 0,
    vencidos: 0,
    valorInventario: 0,
  });

  useEffect(() => {
    const cargarMetricas = async () => {
      try {
        const response = await fetch(
          'http://localhost/farmacia-api/dashboard_metricas.php'
        );

        const data = await response.json();

        setMetricas(normalizeMetricas(data));
      } catch (error) {
        console.error('Error al cargar metricas del dashboard:', error);
      }
    };

    void cargarMetricas();
  }, []);

  const metrics = [
    {
      id: 'metric-ventas-dia',
      label: 'Ventas del Día',
      value: `$${metricas.ventasDia.toFixed(2)}`,
      change: 'Datos reales',
      trend: 'up',
      icon: <DollarSign size={20} />,
      color: 'teal',
      colSpan: 'col-span-1 md:col-span-2',
      hero: true,
    },
    {
      id: 'metric-facturas-hoy',
      label: 'Facturas Emitidas Hoy',
      value: String(metricas.facturasHoy),
      change: 'Datos reales',
      trend: 'up',
      icon: <FileText size={20} />,
      color: 'blue',
      colSpan: 'col-span-1',
      hero: false,
    },
    {
      id: 'metric-unidades-vendidas',
      label: 'Unidades Vendidas',
      value: String(metricas.unidadesVendidas),
      change: 'Datos reales',
      trend: 'up',
      icon: <ShoppingBag size={20} />,
      color: 'orange',
      colSpan: 'col-span-1',
      hero: false,
    },
    {
      id: 'metric-bajo-stock',
      label: 'Bajo Stock',
      value: String(metricas.bajoStock),
      change: 'Requieren revisión',
      trend: 'alert',
      icon: <AlertTriangle size={20} />,
      color: 'amber',
      colSpan: 'col-span-1',
      hero: false,
    },
    {
      id: 'metric-por-vencer',
      label: 'Por Vencer (30d)',
      value: String(metricas.porVencer),
      change: 'Lotes próximos a vencer',
      trend: 'alert',
      icon: <Clock size={20} />,
      color: 'red',
      colSpan: 'col-span-1',
      hero: false,
    },
    {
      id: 'metric-valor-inventario',
      label: 'Valor del Inventario',
      value: `$${metricas.valorInventario.toFixed(2)}`,
      change: 'Calculado desde BD',
      trend: 'up',
      icon: <Package size={20} />,
      color: 'green',
      colSpan: 'col-span-1 md:col-span-2',
      hero: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-6 gap-4">
      {metrics.map((metric) => {
        const colors = colorMap[metric.color];

        return (
          <div
            key={metric.id}
            className={`card group relative overflow-hidden border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${colors.ring} ${metric.colSpan} ${metric.hero ? 'lg:col-span-2 bg-gradient-to-br from-blue-50 to-cyan-50' : ''}`}
          >
            <span
              className={`absolute inset-x-0 top-0 h-1 ${colors.accent}`}
            />

            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-lg shadow-sm ${colors.icon}`}>
                {metric.icon}
              </div>

              {metric.trend === 'up' && (
                <TrendingUp
                  size={14}
                  className="text-success mt-1"
                />
              )}
            </div>

            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              {metric.label}
            </p>

            <p
              className={`tabular-nums font-bold ${colors.value} ${
                metric.hero ? 'text-3xl' : 'text-2xl'
              }`}
            >
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
