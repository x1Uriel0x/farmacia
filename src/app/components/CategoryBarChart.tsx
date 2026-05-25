'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const data = [
  { categoria: 'Analgésicos', stock: 342 },
  { categoria: 'Antibióticos', stock: 187 },
  { categoria: 'Vitaminas', stock: 521 },
  { categoria: 'Antiácidos', stock: 94 },
  { categoria: 'Antihipert.', stock: 63 },
  { categoria: 'Dermatol.', stock: 228 },
];

const barColors = [
  'var(--primary)',
  'var(--accent)',
  'var(--success)',
  'var(--warning)',
  'var(--danger)',
  'var(--info)',
];

interface TooltipProps {
  active?: boolean;
  payload?: { value: number; payload: { categoria: string } }[];
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-dropdown px-3 py-2">
      <p className="text-xs text-muted-foreground mb-1">{payload[0].payload.categoria}</p>
      <p className="text-sm font-semibold text-foreground tabular-nums">
        {payload[0].value} unidades
      </p>
    </div>
  );
}

export default function CategoryBarChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -15, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="categoria"
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="stock" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-cat-${index + 1}`} fill={barColors[index % barColors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}