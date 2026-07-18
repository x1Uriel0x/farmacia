'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Clock, CheckCircle, ArrowRight } from 'lucide-react';

export default function DashboardAlerts() {

  const [datos, setDatos] = useState({
    bajoStock: 0,
    stockAgotado: 0,
    porVencer: 0,
    vencidos: 0
  });

  useEffect(() => {
    cargarAlertas();
  }, []);

  const cargarAlertas = async () => {

    try {

      const response = await fetch(
        'http://localhost/farmacia-api/dashboard_metricas.php'
      );

      const data = await response.json();

      setDatos(data);

    } catch (error) {

      console.error(error);

    }

  };

  const alerts = [];
  const alertHrefById: Record<string, string> = {
    agotado: '/inventory-management?estado=agotado',
    'bajo-stock': '/inventory-management?estado=bajo-stock',
    vencidos: '/inventory-management?estado=vencidos',
    'por-vencer': '/inventory-management?estado=por-vencer',
  };

  if (datos.stockAgotado > 0) {

    alerts.push({
      id: 'agotado',
      type: 'danger',
      icon: <AlertTriangle size={15} />,
      message: `${datos.stockAgotado} medicamento(s) están agotados`,
      action: 'Ver inventario',
      href: '/inventory-management',
    });

  }

  if (datos.bajoStock > 0) {

    alerts.push({
      id: 'bajo-stock',
      type: 'warning',
      icon: <AlertTriangle size={15} />,
      message: `${datos.bajoStock} medicamento(s) tienen stock bajo`,
      action: 'Ver inventario',
      href: '/inventory-management',
    });

  }

  if (datos.vencidos > 0) {

    alerts.push({
      id: 'vencidos',
      type: 'danger',
      icon: <Clock size={15} />,
      message: `${datos.vencidos} medicamento(s) ya están vencidos`,
      action: 'Revisar',
      href: '/inventory-management',
    });

  }

  if (datos.porVencer > 0) {

    alerts.push({
      id: 'por-vencer',
      type: 'warning',
      icon: <Clock size={15} />,
      message: `${datos.porVencer} lote(s) vencen en los próximos 30 días`,
      action: 'Revisar',
      href: '/inventory-management',
    });

  }

  if (alerts.length === 0) {

    alerts.push({
      id: 'sin-alertas',
      type: 'success',
      icon: <CheckCircle size={15} />,
      message: 'No existen alertas en el inventario.',
      action: 'Ver inventario',
      href: '/inventory-management',
    });

  }

  return (
    <div className="flex flex-col gap-2">

      {alerts.map((alert) => (

        <div
          key={alert.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium
            ${
              alert.type === 'warning'
                ? 'bg-warning-bg border-warning/30 text-warning'
                : alert.type === 'danger'
                ? 'bg-danger-bg border-danger/30 text-danger'
                : 'bg-success-bg border-success/30 text-success'
            }`}
        >

          {alert.icon}

          <span className="flex-1">
            {alert.message}
          </span>

          <Link
            href={alertHrefById[alert.id] ?? alert.href}
            className="flex items-center gap-1 text-xs underline underline-offset-2 hover:no-underline"
          >
            {alert.action}
            <ArrowRight size={12} />
          </Link>

        </div>

      ))}

    </div>
  );
}
