'use client';

import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { normalizeVentasDiarias, type VentaDiaria } from './dashboardData';

const chartColor = '#2563EB';
const gridColor = '#E2E8F0';
const axisColor = '#64748B';

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-lg shadow-dropdown px-3 py-2">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold text-foreground">
        ${payload[0].value.toFixed(2)}
      </p>
    </div>
  );
}

export default function SalesAreaChart() {
  const [data, setData] = useState<VentaDiaria[]>([]);

  useEffect(() => {
    const cargarVentas = async () => {
      try {
        const response = await fetch(
          'http://localhost/farmacia-api/ventas_diarias.php'
        );

        const datos = await response.json();

        setData(normalizeVentasDiarias(datos));
      } catch (error) {
        console.error('Error al cargar ventas diarias:', error);
      }
    };

    void cargarVentas();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chartColor} stopOpacity={0.25} />
            <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          stroke={gridColor}
          strokeDasharray="3 3"
          vertical={false}
        />

        <XAxis
          dataKey="dia"
          tick={{ fontSize: 11, fill: axisColor }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          tick={{ fontSize: 11, fill: axisColor }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip content={<CustomTooltip />} />

        <Area
          type="monotone"
          dataKey="ventas"
          stroke={chartColor}
          strokeWidth={2}
          fill="url(#salesGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
