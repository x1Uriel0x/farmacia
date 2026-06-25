'use client';

import React, { useEffect, useState } from 'react';
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

interface CategoriaStock {
  categoria: string;
  stock: number;
}

const barColors = [
  '#0f9b8e',
  '#f59e0b',
  '#16a34a',
  '#d97706',
  '#dc2626',
  '#2563eb',
];

const gridColor = '#dbe6ef';
const axisColor = '#526b88';

interface TooltipProps {
  active?: boolean;
  payload?: {
    value: number;
    payload: CategoriaStock;
  }[];
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-lg shadow-dropdown px-3 py-2">
      <p className="text-xs text-muted-foreground mb-1">
        {payload[0].payload.categoria}
      </p>
      <p className="text-sm font-semibold text-foreground">
        {payload[0].value} unidades
      </p>
    </div>
  );
}

export default function CategoryBarChart() {
  const [data, setData] = useState<CategoriaStock[]>([]);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const response = await fetch(
        'http://localhost/farmacia-api/stock_categorias.php'
      );

      const datos = await response.json();

      setData(datos);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid
          stroke={gridColor}
          strokeDasharray="3 3"
          vertical={false}
        />

        <XAxis
          dataKey="categoria"
          tick={{ fontSize: 10, fill: axisColor }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          tick={{ fontSize: 11, fill: axisColor }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip content={<CustomTooltip />} />

        <Bar dataKey="stock" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={barColors[index % barColors.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}