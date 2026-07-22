'use client';
import { formatCurrency } from '../../lib/currency';

import Badge from '../../components/ui/Badge';
import React, { useEffect, useState } from 'react';
import {ShoppingCart,
  Package,
  Pencil,
  Trash2,
} from 'lucide-react';
import { normalizeActividades, type Actividad } from './dashboardData';
import type { BadgeVariant } from '../../components/ui/Badge';

export default function DashboardActivity() {
  const [activities, setActivities] = useState<Actividad[]>([]);

  useEffect(() => {
    const cargarActividades = async () => {
      try {
        const response = await fetch(
          'http://localhost/farmacia-api/actividad.php'
        );

        const data = await response.json();

        setActivities(normalizeActividades(data));

      } catch (error) {
        console.error('Error al cargar actividad reciente:', error);
      }
    };

    void cargarActividades();
  }, []);

  const obtenerIcono = (tipo: string) => {
    switch (tipo) {
      case 'producto':
        return {
          icono: <Package size={14} />,
          color: 'bg-success/10 text-success',
        };

      case 'editar':
        return {
          icono: <Pencil size={14} />,
          color: 'bg-warning/10 text-warning',
        };

      case 'eliminar':
        return {
          icono: <Trash2 size={14} />,
          color: 'bg-danger/10 text-danger',
        };

      case 'factura':
        return {
          icono: <ShoppingCart size={14} />,
          color: 'bg-primary/10 text-primary',
        };

      default:
        return {
          icono: <Package size={14} />,
          color: 'bg-muted text-muted-foreground',
        };
    }
  };

  const tiempoTranscurrido = (fecha: string) => {
    const ahora = new Date();
    const registro = new Date(fecha);

    const segundos = Math.floor(
      (ahora.getTime() - registro.getTime()) / 1000
    );

    if (segundos < 60) return 'Hace unos segundos';

    const minutos = Math.floor(segundos / 60);

    if (minutos < 60) {
      return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    }

    const horas = Math.floor(minutos / 60);

    if (horas < 24) {
      return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    }

    const dias = Math.floor(horas / 24);

    return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
  };

  const obtenerBadge = (tipo: string): { variant: BadgeVariant; label: string } => {
  switch (tipo) {

    case 'factura':
      return {
        variant: 'facturada',
        label: 'Facturada'
      };

    case 'producto':
      return {
        variant: 'disponible',
        label: 'Nuevo'
      };

    case 'editar':
      return {
        variant: 'por-vencer',
        label: 'Actualizado'
      };

    case 'eliminar':
      return {
        variant: 'agotado',
        label: 'Eliminado'
      };

    default:
      return {
        variant: 'disponible',
        label: 'Actividad'
      };
  }
};

  return (
    <div className="card">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 className="section-header">Actividad Reciente</h2>

        <span className="text-xs text-muted-foreground">
          Últimos movimientos
        </span>
      </div>

      <div className="divide-y divide-border">

        {activities.length === 0 ? (

          <div className="px-6 py-8 text-center text-sm text-muted-foreground">
            No hay actividad reciente.
          </div>

        ) : (

          activities.map((item) => {

            const info = obtenerIcono(item.tipo);

           return (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 px-6 py-4 hover:bg-muted/20 transition-colors"
                  >
                    <div
                      className={`p-2 rounded-lg flex-shrink-0 ${info.color}`}
                    >
                      {info.icono}
                    </div>

                    <div className="flex-1">

                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground">
                          {item.titulo}
                        </p>

                        <Badge
                          variant={obtenerBadge(item.tipo).variant}
                          label={obtenerBadge(item.tipo).label}
                        />
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {item.descripcion}
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        Por{' '}
                        <span className="font-medium text-foreground">
                          {item.usuario}
                        </span>{' '}
                        • {tiempoTranscurrido(item.fecha)}
                      </p>

                    </div>
                  </div>
                );
          })

        )}

      </div>
    </div>
  );
}
