'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, CheckCircle } from 'lucide-react';
import { normalizeMetricas, type DashboardMetricas } from './dashboardData';

const initialMetricas: DashboardMetricas = {
  ventasDia: 0,
  facturasHoy: 0,
  unidadesVendidas: 0,
  bajoStock: 0,
  stockAgotado: 0,
  porVencer: 0,
  vencidos: 0,
  valorInventario: 0,
};

export default function DashboardAlerts() {
  const [datos, setDatos] = useState<DashboardMetricas>(initialMetricas);

  useEffect(() => {
    const cargarAlertas = async () => {
      try {
        const response = await fetch(
          'http://localhost/farmacia-api/dashboard_metricas.php'
        );

        const data = await response.json();

        setDatos(normalizeMetricas(data));
      } catch (error) {
        console.error('Error al cargar alertas del dashboard:', error);
      }
    };

    void cargarAlertas();
  }, []);

  const alertasPendientes =
    datos.stockAgotado + datos.bajoStock + datos.vencidos + datos.porVencer;
  const hasAlerts = alertasPendientes > 0;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium ${
        hasAlerts
          ? 'bg-warning-bg border-warning/30 text-warning'
          : 'bg-success-bg border-success/30 text-success'
      }`}
    >
      {hasAlerts ? <AlertTriangle size={15} /> : <CheckCircle size={15} />}

      <span className="flex-1">
        {hasAlerts
          ? 'Hay alertas pendientes en el inventario.'
          : 'No existen alertas pendientes en el inventario.'}
      </span>

      <Link
        href="/inventory-management"
        className="flex items-center gap-1 text-xs underline underline-offset-2 hover:no-underline"
      >
        Ver inventario
        <ArrowRight size={12} />
      </Link>
    </div>
  );
}
