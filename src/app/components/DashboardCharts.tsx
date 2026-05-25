'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const SalesAreaChart = dynamic(() => import('./SalesAreaChart'), { ssr: false });
const CategoryBarChart = dynamic(() => import('./CategoryBarChart'), { ssr: false });

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-4">
      <div className="lg:col-span-3 card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-header">Ventas Diarias</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Últimos 7 días — en USD</p>
          </div>
        </div>
        <SalesAreaChart />
      </div>
      <div className="lg:col-span-2 card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-header">Stock por Categoría</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Unidades disponibles</p>
          </div>
        </div>
        <CategoryBarChart />
      </div>
    </div>
  );
}