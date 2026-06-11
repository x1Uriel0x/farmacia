'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { dia: 'Lun 11', ventas: 1420 },
  { dia: 'Mar 12', ventas: 1875 },
  { dia: 'Mié 13', ventas: 1230 },
  { dia: 'Jue 14', ventas: 2140 },
  { dia: 'Vie 15', ventas: 1960 },
  { dia: 'Sáb 16', ventas: 2380 },
  { dia: 'Dom 17', ventas: 1848 },
];

const chartColor = '#0f9b8e';
const gridColor = '#dbe6ef';
const axisColor = '#526b88';

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
      <p className="text-sm font-semibold text-foreground tabular-nums">
        ${payload[0].value.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}

export default function SalesAreaChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chartColor} stopOpacity={0.25} />
            <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
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
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="ventas"
          stroke={chartColor}
          strokeWidth={2}
          fill="url(#salesGradient)"
          dot={{ r: 3, fill: chartColor, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: chartColor, stroke: '#ffffff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
